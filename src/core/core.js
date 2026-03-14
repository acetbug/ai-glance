import AdapterManager from "../adapters/manager.js";
import ChatGPTAdapter from "../adapters/chatgpt.js";
import ClaudeAdapter from "../adapters/claude.js";
import { cloneAndClean, enterSelection, exitSelection } from "./runtime.js";
import DeepSeekAdapter from "../adapters/deepseek.js";
import DoubaoAdapter from "../adapters/doubao.js";
import GeminiAdapter from "../adapters/gemini.js";
import GrokAdapter from "../adapters/grok.js";
import MainButton from "../ui/main-button.js";
import QwenAdapter from "../adapters/qwen.js";
import render from "../render/renderer.js";
import showToast from "../ui/toast.js";
import StyleManager from "../styles/manager.js";
import StylePicker from "../ui/style-picker.js";
import stylize from "../styles/stylizer.js";
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
    this.mainButton = new MainButton(this.onClickMainButton.bind(this));
    this.toolbar = new Toolbar(
      this.getSelectedCount.bind(this),
      this.onSelectAllToolbar.bind(this),
      this.onConfirmToolbar.bind(this),
      this.onCancelToolbar.bind(this),
    );
    this.stylePicker = new StylePicker(this.onConfirmStylePicker.bind(this));
    this._selectionMode = false;
    this._pendingTurns = [];
    this._isGenerating = false;
    this._mainButtonObserver = null;
    this._ensureButtonQueued = false;
  }

  init() {
    if (!this.adapterManager.detect()) return;
    if (this._mainButtonObserver) return;

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
  }

  exitSelectionMode() {
    this._selectionMode = false;

    const turns = document.querySelectorAll(".aig-selectable");
    turns.forEach(exitSelection);
    this.toolbar.hide();
  }

  async generate(turns, style) {
    if (this._isGenerating) {
      showToast("正在生成，请稍候……");
      return;
    }
    this._isGenerating = true;
    showToast("生成中……");

    try {
      // 先让 toast 渲染出来，避免用户感知“卡住”
      await new Promise((r) => requestAnimationFrame(r));

      const nodes = turns.map(cloneAndClean);
      const container = stylize(nodes, style);
      const blob = await render(container);
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      showToast("已复制到剪贴板");
    } catch {
      showToast("复制失败", true);
    } finally {
      this._isGenerating = false;
    }
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

  onConfirmToolbar() {
    this._pendingTurns = Array.from(
      document.querySelectorAll(".aig-turn-check.aig-checked"),
    ).map((check) => check.parentElement);
    if (this._pendingTurns.length === 0) return;
    this.exitSelectionMode();
    this.styleManager.getCurrentStyle().then((style) => {
      this.stylePicker.show(this.mainButton.button, style);
    });
  }

  onCancelToolbar() {
    this.exitSelectionMode();
  }

  onConfirmStylePicker(style, save) {
    if (save) this.styleManager.saveStyle(style);
    const turns = this._pendingTurns;
    this._pendingTurns = [];
    this.generate(turns, style);
  }
}
