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
import showToast, { showError, showSuccess, showWarning } from "../ui/toast.js";
import StyleManager from "../styles/manager.js";
import StylePicker from "../ui/style-picker.js";
import stylize, { createExportFilename, estimateDimensions } from "../styles/stylizer.js";
import Toolbar from "../ui/toolbar.js";

export default class Core {
  constructor() {
    this.adapterManager = new AdapterManager(
      ChatGPTAdapter,
      ClaudeAdapter,
      DeepSeekAdapter,
      DoubaoAdapter,
      GeminiAdapter,
      GrokAdapter,
      QwenAdapter,
    );
    this.styleManager = new StyleManager();
    this.configManager = new ConfigManager();
    this.mainButton = new MainButton(this.onClickMainButton.bind(this));
    this.toolbar = new Toolbar(
      this.getSelectedCount.bind(this),
      this.onSelectAllToolbar.bind(this),
      this.onConfirmToolbar.bind(this),
      this.onCancelToolbar.bind(this),
    );
    this.stylePicker = new StylePicker(this.onConfirmStylePicker.bind(this));
    this.progress = new ProgressOverlay();
    this.exportPanel = new ExportPanel();

    this._selectionMode = false;
    this._pendingTurns = [];
    this._isGenerating = false;
    this._mainButtonObserver = null;
    this._ensureButtonQueued = false;
    this._lastGeneratedBlob = null;
    this._lastGeneratedConfig = null;
  }

  async init() {
    if (!this.adapterManager.detect()) return;
    if (this._mainButtonObserver) return;

    try {
      await this.configManager.initTheme();
    } catch (e) {
      console.warn("Theme initialization failed:", e);
    }

    this.ensureMainButton();
    this._mainButtonObserver = new MutationObserver(() => {
      if (this._ensureButtonQueued) return;
      this._ensureButtonQueued = true;
      requestAnimationFrame(() => {
        this._ensureButtonQueued = false;
        this.ensureMainButton();
      });
    });
    this._mainButtonObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  enterSelectionMode() {
    if (this._selectionMode) return;
    this._selectionMode = true;

    const turns = this.adapterManager.getTurnElements();
    turns.forEach((turn) =>
      enterSelection(turn, this.toolbar.updateCount.bind(this.toolbar)),
    );

    this.toolbar.show();
    this.mainButton.setActive(true);
  }

  exitSelectionMode() {
    this._selectionMode = false;

    const turns = document.querySelectorAll(".aig-selectable");
    turns.forEach(exitSelection);
    this.toolbar.hide();
    this.mainButton.setActive(false);
  }

  async generate(turns, style, exportConfig) {
    if (this._isGenerating) {
      showWarning("正在生成，请稍候……");
      return;
    }

    this._isGenerating = true;
    this.progress.show("正在生成图片...", () =>
      this.retryLastGeneration(),
    );

    try {
      await new Promise((r) => requestAnimationFrame(r));

      this.progress.update(20, "处理选中内容...");

      const nodes = turns.map(cloneAndClean);

      this.progress.update(40, "应用样式配置...");

      const effectiveConfig = {
        ...exportConfig,
        watermark: exportConfig.watermarkEnabled
          ? exportConfig.watermark
          : undefined,
      };

      const container = stylize(nodes, style, effectiveConfig);

      this.progress.update(60, "渲染图片...");

      const blob = await renderWithProgress(container, {
        scale: exportConfig.scale || 2,
        onProgress: (percent, stage) => {
          this.progress.update(60 + percent * 0.3, stage);
        },
      });

      if (!blob || blob.size === 0) {
        throw new Error("生成的图片为空");
      }

      this._lastGeneratedBlob = blob;
      this._lastGeneratedConfig = {
        style: { ...style },
        exportConfig: { ...exportConfig },
        turnsCount: turns.length,
      };

      this.progress.update(100, "完成！");

      await this.configManager.addHistory({
        styleName: style.name || style.id,
        turnCount: turns.length,
        timestamp: Date.now(),
        config: { ...exportConfig },
      });

      this.progress.hide();

      const filename = createExportFilename(style, exportConfig);
      const dimensions = estimateDimensions(turns.length, exportConfig);

      try {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        showSuccess("已复制到剪贴板");
      } catch (clipboardErr) {
        console.warn("Clipboard copy failed:", clipboardErr);
        showWarning("图片已生成，点击下载按钮保存");
      }

      this.exportPanel.show(blob, this.mainButton.button, {
        filename,
        dimensions: {
          width: dimensions.width,
          height: dimensions.height,
        },
      });
    } catch (error) {
      console.error("Generation error:", error);
      this.progress.showError(
        error.message || "生成失败，请重试",
        () => this.retryLastGeneration(),
      );
    } finally {
      this._isGenerating = false;
    }
  }

  retryLastGeneration() {
    if (!this._lastGeneratedConfig) {
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
    const parent = this.adapterManager.getActionBar();
    if (parent && !parent.querySelector(".aig-main-btn"))
      this.mainButton.attachTo(parent);
  }

  getSelectedCount() {
    return document.querySelectorAll(".aig-turn-check.aig-checked").length;
  }

  onClickMainButton() {
    if (this._selectionMode) this.exitSelectionMode();
    else this.enterSelectionMode();
  }

  onSelectAllToolbar() {
    const checks = document.querySelectorAll(".aig-turn-check");
    const allChecked = Array.from(checks).every((c) =>
      c.classList.contains("aig-checked"),
    );
    checks.forEach((c) => {
      c.classList.toggle("aig-checked", !allChecked);
      c.parentElement.classList.toggle("aig-selected", !allChecked);
    });
  }

  async onConfirmToolbar() {
    this._pendingTurns = Array.from(
      document.querySelectorAll(".aig-turn-check.aig-checked"),
    ).map((check) => check.parentElement);
    if (this._pendingTurns.length === 0) {
      showWarning("请先选择要导出的对话轮次");
      return;
    }
    this.exitSelectionMode();

    const [style, exportConfig] = await Promise.all([
      this.styleManager.getCurrentStyle(),
      this.configManager.getExportConfig(),
    ]);

    this.stylePicker.show(this.mainButton.button, style, exportConfig);
  }

  onCancelToolbar() {
    this.exitSelectionMode();
  }

  onConfirmStylePicker(style, exportConfig, save) {
    if (save) {
      this.styleManager.saveStyle(style);
      this.configManager.saveExportConfig(exportConfig);
    }

    const turns = this._pendingTurns;
    this._pendingTurns = [];
    this.generate(turns, style, exportConfig);
  }
}
