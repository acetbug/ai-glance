import STYLE_PRESETS from "../styles/presets.js";

const TABS = [
  { id: "style", label: "风格" },
  { id: "config", label: "配置" },
];

export default class StylePicker {
  /**
   * @param {(style: object, config: object, save: boolean) => void} onConfirm 确认选择后的回调
   */
  constructor(onConfirm) {
    this.onConfirm = onConfirm;
    this._popover = null;
    this._closeHandler = null;
    this._closeTimer = null;
    this._selectedStyle = null;
    this._exportConfig = null;
    this._activeTab = "style";
  }

  /**
   * 在按钮附近弹出风格选择器
   * @param {Element} anchorEl 锚点元素（按钮）
   * @param {object} currentStyle 当前风格
   * @param {object} exportConfig 当前导出配置
   */
  show(anchorEl, currentStyle, exportConfig = {}) {
    this.hide();

    const popover = document.createElement("div");
    popover.className = "aig-style-picker";
    this._popover = popover;
    this._selectedStyle = { ...currentStyle };
    this._exportConfig = { ...exportConfig };

    this._renderHeader(popover);
    this._renderTabs(popover);
    this._renderTabContent(popover);
    this._renderFooter(popover);

    document.body.appendChild(popover);
    this.position(popover, anchorEl);

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

  _renderHeader(popover) {
    const header = document.createElement("div");
    header.className = "aig-picker-header";
    header.innerHTML = `
      <span class="aig-picker-title">导出设置</span>
      <button class="aig-picker-close" title="关闭">&times;</button>
    `;
    popover.appendChild(header);

    header
      .querySelector(".aig-picker-close")
      .addEventListener("click", () => this.hide());
  }

  _renderTabs(popover) {
    const tabsContainer = document.createElement("div");
    tabsContainer.className = "aig-picker-tabs";

    TABS.forEach((tab) => {
      const btn = document.createElement("button");
      btn.className = `aig-tab-btn${tab.id === this._activeTab ? " aig-tab-active" : ""}`;
      btn.dataset.tab = tab.id;
      btn.textContent = tab.label;
      btn.addEventListener("click", () => this._switchTab(tab.id));
      tabsContainer.appendChild(btn);
    });

    popover.appendChild(tabsContainer);
  }

  _renderTabContent(popover) {
    const styleContent = document.createElement("div");
    styleContent.className = `aig-tab-content aig-tab-visible`;
    styleContent.dataset.tab = "style";
    this._renderStyleTab(styleContent);
    popover.appendChild(styleContent);

    const configContent = document.createElement("div");
    configContent.className = "aig-tab-content";
    configContent.dataset.tab = "config";
    this._renderConfigTab(configContent);
    popover.appendChild(configContent);
  }

  _renderStyleTab(container) {
    const presetGrid = document.createElement("div");
    presetGrid.className = "aig-preset-grid";

    for (const preset of Object.values(STYLE_PRESETS)) {
      const card = this.createPresetCard(
        preset,
        this._selectedStyle.id === preset.id,
      );
      card.addEventListener("click", () => {
        presetGrid
          .querySelectorAll(".aig-preset-card")
          .forEach((c) => c.classList.remove("aig-selected"));
        card.classList.add("aig-selected");
        this._selectedStyle = { ...preset };
      });
      presetGrid.appendChild(card);
    }
    container.appendChild(presetGrid);

    const customSection = document.createElement("div");
    customSection.className = "aig-custom-section";
    customSection.innerHTML = `
      <div class="aig-custom-title">自定义颜色</div>
      <div class="aig-custom-row">
        <div class="aig-color-item">
          <label>
            <input type="color" data-prop="bg" value="${this._selectedStyle.bg}">
            背景
          </label>
        </div>
        <div class="aig-color-item">
          <label>
            <input type="color" data-prop="text" value="${this._selectedStyle.text}">
            文字
          </label>
        </div>
        <div class="aig-color-item">
          <label>
            <input type="color" data-prop="accent" value="${this._selectedStyle.accent}">
            强调
          </label>
        </div>
      </div>
      <div class="aig-custom-row">
        <div class="aig-color-item">
          <label>
            <input type="color" data-prop="promptBg" value="${this._selectedStyle.promptBg}">
            Prompt背景
          </label>
        </div>
        <div class="aig-color-item">
          <label>
            <input type="color" data-prop="codeBg" value="${this._selectedStyle.codeBg}">
            代码背景
          </label>
        </div>
        <div class="aig-color-item">
          <label>
            <input type="color" data-prop="codeText" value="${this._selectedStyle.codeText}">
            代码文字
          </label>
        </div>
      </div>
    `;
    container.appendChild(customSection);

    customSection.querySelectorAll('input[type="color"]').forEach((input) => {
      input.addEventListener("input", () => {
        const prop = input.dataset.prop;
        this._selectedStyle[prop] = input.value;
        this._selectedStyle.id = "custom";
        presetGrid
          .querySelectorAll(".aig-preset-card")
          .forEach((c) => c.classList.remove("aig-selected"));
      });
    });
  }

  _renderConfigTab(container) {
    const configSection = document.createElement("div");
    configSection.className = "aig-config-section";
    configSection.innerHTML = `
      <div class="aig-config-group">
        <label class="aig-config-label">导出尺寸</label>
        <div class="aig-config-row">
          <select class="aig-config-select" data-prop="width">
            <option value="360">窄 (360px)</option>
            <option value="420" selected>标准 (420px)</option>
            <option value="480">宽 (480px)</option>
            <option value="600">超宽 (600px)</option>
          </select>
        </div>
      </div>
      <div class="aig-config-group">
        <label class="aig-config-label">渲染画质</label>
        <div class="aig-config-row">
          <select class="aig-config-select" data-prop="scale">
            <option value="1">标准 (1x)</option>
            <option value="2" selected>高清 (2x)</option>
            <option value="3">超清 (3x)</option>
          </select>
        </div>
      </div>
      <div class="aig-config-group">
        <label class="aig-config-label">水印设置</label>
        <label class="aig-config-checkbox">
          <input type="checkbox" data-prop="watermarkEnabled" ${this._exportConfig.watermarkEnabled !== false ? "checked" : ""}>
          <span>显示水印</span>
        </label>
        <div class="aig-config-row" style="margin-top: 8px;">
          <input type="text" class="aig-config-input" data-prop="watermark" 
                 value="${this._exportConfig.watermark || 'AI Glance'}" 
                 placeholder="水印文字">
        </div>
      </div>
      <div class="aig-config-group">
        <label class="aig-config-label">标题设置</label>
        <label class="aig-config-checkbox">
          <input type="checkbox" data-prop="titleEnabled" ${this._exportConfig.titleEnabled ? "checked" : ""}>
          <span>添加标题</span>
        </label>
        <div class="aig-config-row" style="margin-top: 8px;">
          <input type="text" class="aig-config-input" data-prop="title" 
                 value="${this._exportConfig.title || ''}" 
                 placeholder="例如：与AI的精彩对话">
        </div>
      </div>
    `;
    container.appendChild(configSection);

    configSection.querySelectorAll("[data-prop]").forEach((el) => {
      const prop = el.dataset.prop;
      const isCheckbox = el.type === "checkbox";
      const isSelect = el.tagName === "SELECT";

      el.addEventListener("change", () => {
        if (isCheckbox) {
          this._exportConfig[prop] = el.checked;
        } else if (isSelect) {
          this._exportConfig[prop] = parseInt(el.value) || el.value;
        }
      });

      if (!isCheckbox && !isSelect) {
        el.addEventListener("input", () => {
          this._exportConfig[prop] = el.value;
        });
      }
    });
  }

  _renderFooter(popover) {
    const footer = document.createElement("div");
    footer.className = "aig-picker-footer";

    const leftActions = document.createElement("div");
    leftActions.style.display = "flex";
    leftActions.style.gap = "12px";
    leftActions.style.alignItems = "center";

    const saveLabel = document.createElement("label");
    saveLabel.className = "aig-save-label";
    saveLabel.innerHTML = `<input type="checkbox" checked class="aig-save-check"> 保存为默认`;
    leftActions.appendChild(saveLabel);

    const shareBtn = document.createElement("button");
    shareBtn.className = "aig-theme-toggle";
    shareBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="18" cy="5" r="3"/>
        <circle cx="6" cy="12" r="3"/>
        <circle cx="18" cy="19" r="3"/>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
      </svg>
      分享
    `;
    shareBtn.addEventListener("click", () => this._shareStyle());
    leftActions.appendChild(shareBtn);

    footer.appendChild(leftActions);

    const confirmBtn = document.createElement("button");
    confirmBtn.className = "aig-confirm-btn";
    confirmBtn.textContent = "确定生成";
    confirmBtn.addEventListener("click", async () => {
      const save = popover.querySelector(".aig-save-check").checked;
      this.hide();
      this.onConfirm(this._selectedStyle, this._exportConfig, save);
    });
    footer.appendChild(confirmBtn);

    popover.appendChild(footer);
  }

  _switchTab(tabId) {
    this._activeTab = tabId;

    this._popover.querySelectorAll(".aig-tab-btn").forEach((btn) => {
      btn.classList.toggle(
        "aig-tab-active",
        btn.dataset.tab === tabId,
      );
    });

    this._popover.querySelectorAll(".aig-tab-content").forEach((content) => {
      content.classList.toggle(
        "aig-tab-visible",
        content.dataset.tab === tabId,
      );
    });
  }

  _shareStyle() {
    const shareData = {
      style: this._selectedStyle,
      config: this._exportConfig,
      version: "1.0",
    };

    try {
      const json = JSON.stringify(shareData, null, 2);
      navigator.clipboard.writeText(json);
      alert("风格配置已复制到剪贴板！\n分享给好友后，他们可以粘贴导入。");
    } catch (err) {
      console.error("Share failed:", err);
      alert("分享失败，请手动复制：\n\n" + JSON.stringify(shareData));
    }
  }

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

  position(popover, anchor) {
    const rect = anchor.getBoundingClientRect();
    const popRect = popover.getBoundingClientRect();

    let top = rect.top - popRect.height - 8;
    let left = rect.left;

    if (top < 10) {
      top = rect.bottom + 8;
    }

    if (left + popRect.width > window.innerWidth - 10) {
      left = window.innerWidth - popRect.width - 10;
    }

    if (left < 10) left = 10;

    popover.style.top = `${top}px`;
    popover.style.left = `${left}px`;
  }

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
