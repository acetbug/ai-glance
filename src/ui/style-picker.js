import STYLE_PRESETS from "../styles/presets.js";

/**
 * 风格选择器气泡组件
 * 点击复制按钮后弹出，选择风格后执行复制
 */
export default class StylePicker {
  /**
   * @param {(style: object, save: boolean) => void} onConfirm 确认选择后的回调
   */
  constructor(onConfirm) {
    this.onConfirm = onConfirm;
    this._popover = null;
    this._closeHandler = null;
    this._closeTimer = null;
  }

  /**
   * 在按钮附近弹出风格选择器
   * @param {Element} anchorEl 锚点元素（按钮）
   * @param {object} currentStyle 当前风格
   */
  show(anchorEl, currentStyle) {
    // 关闭已有弹出
    this.hide();

    const popover = document.createElement("div");
    popover.className = "aig-style-picker";
    this._popover = popover;

    // ── 标题栏 ──
    const header = document.createElement("div");
    header.className = "aig-picker-header";
    header.innerHTML = `
      <span class="aig-picker-title">选择图片风格</span>
      <button class="aig-picker-close" title="关闭">&times;</button>
    `;
    popover.appendChild(header);
    header
      .querySelector(".aig-picker-close")
      .addEventListener("click", () => this.hide());

    // ── 预设列表 ──
    const presetGrid = document.createElement("div");
    presetGrid.className = "aig-preset-grid";

    for (const preset of Object.values(STYLE_PRESETS)) {
      const card = this.createPresetCard(preset, currentStyle.id === preset.id);
      card.addEventListener("click", () => {
        // 更新选中状态
        presetGrid
          .querySelectorAll(".aig-preset-card")
          .forEach((c) => c.classList.remove("aig-selected"));
        card.classList.add("aig-selected");
        this._selectedStyle = { ...preset };
        this.updateCustomInputs(popover, preset);
      });
      presetGrid.appendChild(card);
    }
    popover.appendChild(presetGrid);

    // ── 自定义颜色区 ──
    const customSection = document.createElement("div");
    customSection.className = "aig-custom-section";
    customSection.innerHTML = `
      <div class="aig-custom-title">自定义颜色</div>
      <div class="aig-custom-row">
        <label>背景 <input type="color" data-prop="bg" value="${currentStyle.bg}"></label>
        <label>文字 <input type="color" data-prop="text" value="${currentStyle.text}"></label>
        <label>强调 <input type="color" data-prop="accent" value="${currentStyle.accent}"></label>
      </div>
      <div class="aig-custom-row">
        <label>Prompt背景 <input type="color" data-prop="promptBg" value="${currentStyle.promptBg}"></label>
        <label>代码背景 <input type="color" data-prop="codeBg" value="${currentStyle.codeBg}"></label>
        <label>代码文字 <input type="color" data-prop="codeText" value="${currentStyle.codeText}"></label>
      </div>
    `;
    popover.appendChild(customSection);

    // 自定义颜色变化监听
    customSection.querySelectorAll('input[type="color"]').forEach((input) => {
      input.addEventListener("input", () => {
        const prop = input.dataset.prop;
        if (!this._selectedStyle) {
          this._selectedStyle = { ...currentStyle };
        }
        this._selectedStyle[prop] = input.value;
        this._selectedStyle.id = "custom";
        // 取消预设选中
        presetGrid
          .querySelectorAll(".aig-preset-card")
          .forEach((c) => c.classList.remove("aig-selected"));
      });
    });

    this._selectedStyle = { ...currentStyle };

    // ── 底部按钮 ──
    const footer = document.createElement("div");
    footer.className = "aig-picker-footer";

    const saveLabel = document.createElement("label");
    saveLabel.className = "aig-save-label";
    saveLabel.innerHTML = `<input type="checkbox" checked class="aig-save-check"> 保存为默认`;
    footer.appendChild(saveLabel);

    const confirmBtn = document.createElement("button");
    confirmBtn.className = "aig-confirm-btn";
    confirmBtn.textContent = "确定生成";
    confirmBtn.addEventListener("click", async () => {
      const save = popover.querySelector(".aig-save-check").checked;
      this.hide();
      this.onConfirm(this._selectedStyle, save);
    });
    footer.appendChild(confirmBtn);
    popover.appendChild(footer);

    // ── 定位 ──
    document.body.appendChild(popover);
    this.position(popover, anchorEl);

    // 点击外部关闭
    this._closeHandler = (e) => {
      if (
        !popover.contains(e.target) &&
        e.target !== anchorEl &&
        !anchorEl.contains(e.target)
      ) {
        this.hide();
      }
    };
    this._closeTimer = setTimeout(() => {
      this._closeTimer = null;
      if (this._closeHandler) {
        document.addEventListener("click", this._closeHandler);
      }
    }, 0);
  }

  /** 创建预设卡片 */
  createPresetCard(preset, isSelected) {
    const card = document.createElement("div");
    card.className = `aig-preset-card${isSelected ? " aig-selected" : ""}`;
    card.innerHTML = `
      <div class="aig-preset-preview" style="background:${preset.bg}; color:${preset.text}; border: 1px solid ${preset.codeBorder}">
        <div style="font-size:10px;color:${preset.accent};margin-bottom:2px">PROMPT</div>
        <div style="background:${preset.promptBg};padding:3px 5px;border-radius:3px;font-size:9px;margin-bottom:4px;color:${preset.promptText}">问题...</div>
        <div style="font-size:9px">回答内容</div>
        <div style="background:${preset.codeBg};color:${preset.codeText};padding:2px 4px;border-radius:2px;font-size:8px;margin-top:3px;font-family:monospace">code</div>
      </div>
      <div class="aig-preset-name">${preset.name}</div>
    `;
    return card;
  }

  /** 更新自定义输入框值 */
  updateCustomInputs(popover, style) {
    popover.querySelectorAll('input[type="color"]').forEach((input) => {
      const prop = input.dataset.prop;
      if (style[prop]) input.value = style[prop];
    });
  }

  /** 定位弹出框 */
  position(popover, anchor) {
    const rect = anchor.getBoundingClientRect();
    const popRect = popover.getBoundingClientRect();

    let top = rect.top - popRect.height - 8;
    let left = rect.left;

    // 如果上方放不下，放下方
    if (top < 10) {
      top = rect.bottom + 8;
    }

    // 如果右侧超出视口
    if (left + popRect.width > window.innerWidth - 10) {
      left = window.innerWidth - popRect.width - 10;
    }

    // 如果左侧超出
    if (left < 10) left = 10;

    popover.style.top = `${top}px`;
    popover.style.left = `${left}px`;
  }

  /** 隐藏弹出 */
  hide() {
    if (this._closeTimer) {
      clearTimeout(this._closeTimer);
      this._closeTimer = null;
    }
    if (this._popover) {
      this._popover.remove();
      this._popover = null;
    }
    if (this._closeHandler) {
      document.removeEventListener("click", this._closeHandler);
      this._closeHandler = null;
    }
  }
}
