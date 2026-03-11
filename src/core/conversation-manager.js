/**
 * 对话管理器 — 在页面顶部注入主按钮，管理 turn 多选模式
 */
export class ConversationManager {
  /**
   * @param {import('../adapters/base.js').BaseAdapter} adapter
   * @param {{ onGenerate: (turns: Element[]) => void }} callbacks
   */
  constructor(adapter, { onGenerate }) {
    this.adapter = adapter;
    this.onGenerate = onGenerate;
    this._observer = null;
    this._injected = false;
    this._selectionMode = false;
    this._toolbar = null;
  }

  start() {
    this._tryInjectButton();
    this._observer = new MutationObserver(() => {
      if (this._injected && !document.querySelector(".aig-main-btn")) {
        this._injected = false;
      }
      if (!this._injected) this._tryInjectButton();
    });
    this._observer.observe(document.body, { childList: true, subtree: true });
  }

  stop() {
    this._observer?.disconnect();
  }

  _tryInjectButton() {
    const actionBar = this.adapter.getActionBar();
    if (!actionBar || actionBar.querySelector(".aig-main-btn")) return;

    const btn = document.createElement("button");
    btn.className = "aig-main-btn";
    btn.title = "多选复制为图片";
    btn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
      <span>复制为图片</span>
    `;
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (this._selectionMode) {
        this.exitSelectionMode();
      } else {
        this.enterSelectionMode();
      }
    });

    actionBar.prepend(btn);
    this._injected = true;
  }

  enterSelectionMode() {
    if (this._selectionMode) return;
    this._selectionMode = true;

    const turns = this.adapter.getTurnElements();
    for (const turn of turns) {
      if (turn.querySelector(".aig-turn-check")) continue;
      turn.classList.add("aig-selectable");
      turn.style.position ||= "relative";

      const check = document.createElement("div");
      check.className = "aig-turn-check";

      // 点击 turn 内部任意位置都可以切换选中
      const toggleSelection = (e) => {
        // 不拦截链接或按钮的原始行为
        if (e.target.closest("a, button:not(.aig-turn-check)")) return;
        e.preventDefault();
        turn.classList.toggle("aig-selected");
        check.classList.toggle("aig-checked");
        this._updateCount();
      };
      turn.addEventListener("click", toggleSelection);
      turn._aigToggle = toggleSelection;

      turn.prepend(check);
    }

    this._showToolbar();
  }

  exitSelectionMode() {
    this._selectionMode = false;
    document.querySelectorAll(".aig-selectable").forEach((turn) => {
      if (turn._aigToggle) {
        turn.removeEventListener("click", turn._aigToggle);
        delete turn._aigToggle;
      }
      turn.classList.remove("aig-selectable", "aig-selected");
      turn.querySelector(".aig-turn-check")?.remove();
    });
    this._toolbar?.remove();
    this._toolbar = null;
  }

  _updateCount() {
    const count = document.querySelectorAll(
      ".aig-turn-check.aig-checked",
    ).length;
    const label = this._toolbar?.querySelector(".aig-toolbar-count");
    if (label) label.textContent = count > 0 ? `已选 ${count} 条` : "";
  }

  _showToolbar() {
    if (this._toolbar) return;

    const toolbar = document.createElement("div");
    toolbar.className = "aig-selection-toolbar";

    toolbar.innerHTML = `
      <span class="aig-toolbar-count"></span>
      <button class="aig-toolbar-btn" data-action="selectAll">全选</button>
      <button class="aig-toolbar-btn aig-toolbar-primary" data-action="generate">生成图片</button>
      <button class="aig-toolbar-btn" data-action="cancel">取消</button>
    `;

    toolbar.addEventListener("click", (e) => {
      const action = e.target.dataset?.action;
      if (!action) return;

      if (action === "selectAll") {
        const checks = document.querySelectorAll(".aig-turn-check");
        const allChecked = [...checks].every((c) =>
          c.classList.contains("aig-checked"),
        );
        checks.forEach((c) => {
          const turn = c.parentElement;
          if (allChecked) {
            c.classList.remove("aig-checked");
            turn.classList.remove("aig-selected");
          } else {
            c.classList.add("aig-checked");
            turn.classList.add("aig-selected");
          }
        });
        this._updateCount();
      }

      if (action === "generate") {
        const selected = [];
        document
          .querySelectorAll(".aig-turn-check.aig-checked")
          .forEach((c) => selected.push(c.parentElement));
        if (selected.length === 0) return;
        this.exitSelectionMode();
        this.onGenerate(selected);
      }

      if (action === "cancel") {
        this.exitSelectionMode();
      }
    });

    document.body.appendChild(toolbar);
    this._toolbar = toolbar;
  }
}
