import AdapterManager from "../adapters/manager.js";
import ChatGPTAdapter from "../adapters/chatgpt.js";
import ClaudeAdapter from "../adapters/claude.js";
import { cloneAndClean, enterSelection, exitSelection } from "./runtime.js";
import ConfigManager from "./config.js";
import DeepSeekAdapter from "../adapters/deepseek.js";
import DoubaoAdapter from "../adapters/doubao.js";
import ExportPanel from "../ui/export-panel.js";
import GeminiAdapter from "../adapters/gemini.js";
import GrokAdapter from "../adapters/grok.js";
import MainButton from "../ui/main-button.js";
import ProgressOverlay from "../ui/progress.js";
import QwenAdapter from "../adapters/qwen.js";
import render, { renderWithProgress } from "../render/renderer.js";
import showToast, { showError, showSuccess, showWarning, showInfo } from "../ui/toast.js";
import StyleManager from "../styles/manager.js";
import StylePicker from "../ui/style-picker.js";
import stylize, { createExportFilename, estimateDimensions } from "../styles/stylizer.js";
import Toolbar from "../ui/toolbar.js";

const DEBUG_PREFIX = "[AI Glance]";

function logInfo(...args) {
  console.log(DEBUG_PREFIX, ...args);
}

function logError(...args) {
  console.error(DEBUG_PREFIX, ...args);
}

function logWarn(...args) {
  console.warn(DEBUG_PREFIX, ...args);
}

export default class Core {
  constructor() {
    logInfo("Initializing Core...");

    try {
      this.adapterManager = new AdapterManager(
        ChatGPTAdapter,
        ClaudeAdapter,
        DeepSeekAdapter,
        DoubaoAdapter,
        GeminiAdapter,
        GrokAdapter,
        QwenAdapter,
      );
      logInfo("AdapterManager created with", Object.keys(this.adapterManager.adapters || {}).length, "adapters");
    } catch (e) {
      logError("Failed to create AdapterManager:", e);
      throw e;
    }

    try {
      this.styleManager = new StyleManager();
      logInfo("StyleManager created");
    } catch (e) {
      logError("Failed to create StyleManager:", e);
    }

    try {
      this.configManager = new ConfigManager();
      logInfo("ConfigManager created");
    } catch (e) {
      logError("Failed to create ConfigManager:", e);
    }

    try {
      this.mainButton = new MainButton(this.onClickMainButton.bind(this));
      logInfo("MainButton created");
    } catch (e) {
      logError("Failed to create MainButton:", e);
      throw e;
    }

    try {
      this.toolbar = new Toolbar(
        this.getSelectedCount.bind(this),
        this.onSelectAllToolbar.bind(this),
        this.onConfirmToolbar.bind(this),
        this.onCancelToolbar.bind(this),
      );
      logInfo("Toolbar created");
    } catch (e) {
      logError("Failed to create Toolbar:", e);
      throw e;
    }

    try {
      this.stylePicker = new StylePicker(this.onConfirmStylePicker.bind(this));
      logInfo("StylePicker created");
    } catch (e) {
      logError("Failed to create StylePicker:", e);
    }

    try {
      this.progress = new ProgressOverlay();
      this.exportPanel = new ExportPanel();
      logInfo("Progress and ExportPanel created");
    } catch (e) {
      logError("Failed to create Progress/ExportPanel:", e);
    }

    this._selectionMode = false;
    this._pendingTurns = [];
    this._isGenerating = false;
    this._mainButtonObserver = null;
    this._ensureButtonQueued = false;
    this._lastGeneratedBlob = null;
    this._lastGeneratedConfig = null;
  }

  async init() {
    logInfo("Core.init() called");
    logInfo("Current URL:", window.location.href);

    try {
      const detected = this.adapterManager.detect();
      logInfo("Adapter detection result:", detected ? detected.name : "NOT DETECTED");

      if (!detected) {
        logWarn("No adapter found for current URL. Supported sites:", 
          Object.values(this.adapterManager.adapters || {}).map(a => a.name || a.urlPattern));
        showWarning("AI Glance：当前网站不支持或未检测到对话页面");
        return;
      }

      logInfo("Using adapter:", detected.name);
      logInfo("Turn selector:", detected.turnSelector);
      logInfo("Action bar selector:", detected.actionBarSelector);
    } catch (e) {
      logError("Adapter detection failed:", e);
      showError("AI Glance 初始化失败：" + e.message);
      return;
    }

    if (this._mainButtonObserver) {
      logWarn("MainButtonObserver already exists, skipping init");
      return;
    }

    try {
      await this.configManager.initTheme();
      logInfo("Theme initialized");
    } catch (e) {
      logWarn("Theme initialization failed (non-critical):", e);
    }

    try {
      this.ensureMainButton();
      logInfo("MainButton ensured");
    } catch (e) {
      logError("Failed to ensure MainButton:", e);
      showError("AI Glance：无法注入按钮 - " + e.message);
      return;
    }

    this._mainButtonObserver = new MutationObserver(() => {
      if (this._ensureButtonQueued) return;
      this._ensureButtonQueued = true;
      requestAnimationFrame(() => {
        this._ensureButtonQueued = false;
        try {
          this.ensureMainButton();
        } catch (e) {
          logWarn("MutationObserver ensureMainButton failed:", e);
        }
      });
    });

    this._mainButtonObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    logInfo("Core initialization complete");
  }

  enterSelectionMode() {
    logInfo("enterSelectionMode() called");

    if (this._selectionMode) {
      logWarn("Already in selection mode, returning");
      return;
    }

    this._selectionMode = true;

    let turns = [];
    try {
      turns = this.adapterManager.getTurnElements();
      logInfo("getTurnElements() returned", turns.length, "elements");

      if (turns.length === 0) {
        logWarn("No turn elements found!");
        logWarn("Current adapter:", this.adapterManager._currentAdapter?.name);
        logWarn("Turn selector:", this.adapterManager._currentAdapter?.turnSelector);
        
        showError("未检测到对话轮次，请确认：\n1. 页面已完全加载\n2. 当前页面有对话内容\n3. 选择器：" + (this.adapterManager._currentAdapter?.turnSelector || "未知"));
        
        this._selectionMode = false;
        return;
      }

      logInfo("Adding selection UI to", turns.length, "turns");
      turns.forEach((turn, index) => {
        try {
          enterSelection(turn, this.toolbar.updateCount.bind(this.toolbar));
          logInfo(`Turn ${index + 1} selection UI added`);
        } catch (e) {
          logError(`Failed to add selection UI to turn ${index + 1}:`, e);
        }
      });
    } catch (e) {
      logError("Error in enterSelectionMode:", e);
      showError("进入选择模式失败：" + e.message);
      this._selectionMode = false;
      return;
    }

    try {
      this.toolbar.show();
      this.mainButton.setActive(true);
      logInfo("Selection mode activated, toolbar shown");
      showInfo(`已找到 ${turns.length} 条对话，请选择要导出的内容`);
    } catch (e) {
      logError("Failed to show toolbar:", e);
      showError("显示工具栏失败：" + e.message);
    }
  }

  exitSelectionMode() {
    logInfo("exitSelectionMode() called");

    this._selectionMode = false;

    try {
      const turns = document.querySelectorAll(".aig-selectable");
      logInfo("Removing selection UI from", turns.length, "turns");
      turns.forEach((turn, index) => {
        try {
          exitSelection(turn);
        } catch (e) {
          logError(`Failed to remove selection UI from turn ${index}:`, e);
        }
      });

      this.toolbar.hide();
      this.mainButton.setActive(false);
      logInfo("Selection mode deactivated");
    } catch (e) {
      logError("Error in exitSelectionMode:", e);
    }
  }

  async generate(turns, style, exportConfig) {
    logInfo("generate() called with", turns?.length || 0, "turns");

    if (this._isGenerating) {
      logWarn("Already generating, returning");
      showWarning("正在生成，请稍候……");
      return;
    }

    if (!turns || turns.length === 0) {
      logError("No turns provided to generate()");
      showWarning("请先选择要导出的对话轮次");
      return;
    }

    this._isGenerating = true;

    try {
      this.progress.show("正在生成图片...", () =>
        this.retryLastGeneration(),
      );

      await new Promise((r) => requestAnimationFrame(r));

      this.progress.update(20, "处理选中内容...");
      logInfo("Processing nodes...");

      const nodes = turns.map((turn, index) => {
        try {
          return cloneAndClean(turn);
        } catch (e) {
          logError(`Failed to clone turn ${index}:`, e);
          throw new Error(`处理第 ${index + 1} 条对话失败：${e.message}`);
        }
      });

      this.progress.update(40, "应用样式配置...");
      logInfo("Applying style configuration...");

      const effectiveConfig = {
        ...exportConfig,
        watermark: exportConfig.watermarkEnabled
          ? exportConfig.watermark
          : undefined,
      };

      let container;
      try {
        container = stylize(nodes, style, effectiveConfig);
        logInfo("Container created with stylize()");
      } catch (e) {
        logError("stylize() failed:", e);
        throw new Error("应用样式失败：" + e.message);
      }

      this.progress.update(60, "渲染图片...");
      logInfo("Rendering image with scale:", exportConfig.scale || 2);

      let blob;
      try {
        blob = await renderWithProgress(container, {
          scale: exportConfig.scale || 2,
          onProgress: (percent, stage) => {
            this.progress.update(60 + percent * 0.3, stage);
          },
        });
        logInfo("Render complete, blob size:", blob?.size || 0, "bytes");
      } catch (e) {
        logError("Render failed:", e);
        throw new Error("渲染图片失败：" + e.message);
      }

      if (!blob || blob.size === 0) {
        logError("Blob is empty!");
        throw new Error("生成的图片为空，请重试");
      }

      this._lastGeneratedBlob = blob;
      this._lastGeneratedConfig = {
        style: { ...style },
        exportConfig: { ...exportConfig },
        turnsCount: turns.length,
      };

      this.progress.update(100, "完成！");

      try {
        await this.configManager.addHistory({
          styleName: style.name || style.id,
          turnCount: turns.length,
          timestamp: Date.now(),
          config: { ...exportConfig },
        });
        logInfo("History saved");
      } catch (e) {
        logWarn("Failed to save history (non-critical):", e);
      }

      this.progress.hide();

      const filename = createExportFilename(style, exportConfig);
      const dimensions = estimateDimensions(turns.length, exportConfig);
      logInfo("Generated filename:", filename);
      logInfo("Estimated dimensions:", dimensions);

      let copied = false;
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        copied = true;
        logInfo("Copied to clipboard successfully");
        showSuccess("已复制到剪贴板");
      } catch (clipboardErr) {
        logWarn("Clipboard copy failed:", clipboardErr);
        showWarning("图片已生成，点击下载按钮保存");
      }

      try {
        this.exportPanel.show(blob, this.mainButton.button, {
          filename,
          dimensions: {
            width: dimensions.width,
            height: dimensions.height,
          },
        });
        logInfo("Export panel shown");
      } catch (e) {
        logError("Failed to show export panel:", e);
        if (!copied) {
          showError("导出面板显示失败：" + e.message);
        }
      }
    } catch (error) {
      logError("Generation error:", error);
      this.progress.showError(
        error.message || "生成失败，请重试",
        () => this.retryLastGeneration(),
      );
    } finally {
      this._isGenerating = false;
      logInfo("Generation process ended");
    }
  }

  retryLastGeneration() {
    logInfo("retryLastGeneration() called");

    if (!this._lastGeneratedConfig) {
      logWarn("No last generated config");
      showError("没有可重试的操作");
      return;
    }

    this.progress.hide();
    this.generate(
      this._pendingTurns,
      this._lastGeneratedConfig.style,
      this._lastGeneratedConfig.exportConfig,
    );
  }

  ensureMainButton() {
    logInfo("ensureMainButton() called");

    let parent;
    try {
      parent = this.adapterManager.getActionBar();
      logInfo("getActionBar() returned:", parent ? "element found" : "null");

      if (!parent) {
        logWarn("Action bar not found!");
        logWarn("Action bar selector:", this.adapterManager._currentAdapter?.actionBarSelector);
        return;
      }

      const existingButton = parent.querySelector(".aig-main-btn");
      if (existingButton) {
        logInfo("Main button already exists, skipping");
        return;
      }

      this.mainButton.attachTo(parent);
      logInfo("Main button attached successfully");
    } catch (e) {
      logError("ensureMainButton failed:", e);
      throw e;
    }
  }

  getSelectedCount() {
    const count = document.querySelectorAll(".aig-turn-check.aig-checked").length;
    logInfo("getSelectedCount():", count);
    return count;
  }

  onClickMainButton() {
    logInfo("onClickMainButton() called, current mode:", this._selectionMode ? "selection" : "normal");

    try {
      if (this._selectionMode) {
        this.exitSelectionMode();
      } else {
        this.enterSelectionMode();
      }
    } catch (e) {
      logError("onClickMainButton failed:", e);
      showError("操作失败：" + e.message);
    }
  }

  onSelectAllToolbar() {
    logInfo("onSelectAllToolbar() called");

    try {
      const checks = document.querySelectorAll(".aig-turn-check");
      logInfo("Found", checks.length, "checkboxes");

      const allChecked = Array.from(checks).every((c) =>
        c.classList.contains("aig-checked"),
      );
      logInfo("All checked?", allChecked);

      checks.forEach((c) => {
        c.classList.toggle("aig-checked", !allChecked);
        c.parentElement.classList.toggle("aig-selected", !allChecked);
      });

      logInfo("Toggled all selections");
    } catch (e) {
      logError("onSelectAllToolbar failed:", e);
      showError("操作失败：" + e.message);
    }
  }

  async onConfirmToolbar() {
    logInfo("onConfirmToolbar() called");

    try {
      this._pendingTurns = Array.from(
        document.querySelectorAll(".aig-turn-check.aig-checked"),
      ).map((check) => check.parentElement);

      logInfo("Selected turns count:", this._pendingTurns.length);

      if (this._pendingTurns.length === 0) {
        logWarn("No turns selected!");
        showWarning("请先选择要导出的对话轮次\n（点击对话右上角的选择框）");
        return;
      }

      this.exitSelectionMode();

      logInfo("Getting current style and config...");
      const [style, exportConfig] = await Promise.all([
        this.styleManager.getCurrentStyle(),
        this.configManager.getExportConfig(),
      ]);

      logInfo("Current style:", style?.name || style?.id);
      logInfo("Export config:", exportConfig);

      this.stylePicker.show(this.mainButton.button, style, exportConfig);
      logInfo("Style picker shown");
    } catch (e) {
      logError("onConfirmToolbar failed:", e);
      showError("操作失败：" + e.message);
    }
  }

  onCancelToolbar() {
    logInfo("onCancelToolbar() called");
    this.exitSelectionMode();
  }

  onConfirmStylePicker(style, exportConfig, save) {
    logInfo("onConfirmStylePicker() called");
    logInfo("Save as default?", save);
    logInfo("Style:", style?.name || style?.id);
    logInfo("Export config:", exportConfig);

    try {
      if (save) {
        logInfo("Saving style and config as default...");
        this.styleManager.saveStyle(style);
        this.configManager.saveExportConfig(exportConfig);
        showInfo("设置已保存为默认");
      }

      const turns = this._pendingTurns;
      this._pendingTurns = [];
      this.generate(turns, style, exportConfig);
    } catch (e) {
      logError("onConfirmStylePicker failed:", e);
      showError("操作失败：" + e.message);
    }
  }
}
