/**
 * 导出面板组件
 * 显示生成的图片预览，支持复制和下载
 */

export default class ExportPanel {
  constructor() {
    this._panel = null;
    this._anchor = null;
    this._closeHandler = null;
    this._blob = null;
  }

  /**
   * 显示导出面板
   * @param {Blob} blob 图片Blob
   * @param {Element} anchor 锚点元素
   * @param {object} options 选项
   */
  show(blob, anchor, options = {}) {
    this.hide();
    this._blob = blob;
    this._anchor = anchor;

    const url = URL.createObjectURL(blob);
    const sizeKB = Math.round(blob.size / 1024);
    const dimensions = options.dimensions || { width: "未知", height: "未知" };

    const panel = document.createElement("div");
    panel.className = "aig-export-panel";
    panel.innerHTML = `
      <img class="aig-export-preview" src="${url}" alt="Preview">
      <div class="aig-export-info">
        <div class="aig-export-info-row">
          <span class="aig-export-info-label">尺寸</span>
          <span class="aig-export-info-value">${dimensions.width} × ${dimensions.height}</span>
        </div>
        <div class="aig-export-info-row">
          <span class="aig-export-info-label">大小</span>
          <span class="aig-export-info-value">${sizeKB} KB</span>
        </div>
        <div class="aig-export-info-row">
          <span class="aig-export-info-label">格式</span>
          <span class="aig-export-info-value">PNG</span>
        </div>
      </div>
      <div class="aig-export-actions">
        <button class="aig-export-btn" data-action="copy">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          复制
        </button>
        <button class="aig-export-btn aig-export-btn-primary" data-action="download">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          下载
        </button>
      </div>
    `;

    panel.addEventListener("click", (e) => {
      const action = e.target.closest("[data-action]")?.dataset.action;
      if (action === "copy") {
        this.copyToClipboard(blob, url);
      } else if (action === "download") {
        this.downloadImage(blob, options.filename || "ai-conversation.png");
      }
    });

    document.body.appendChild(panel);
    this._panel = panel;

    this.position(panel, anchor);

    this._closeHandler = (e) => {
      if (!panel.contains(e.target) && e.target !== anchor && !anchor?.contains(e.target)) {
        this.hide();
      }
    };
    setTimeout(() => {
      document.addEventListener("click", this._closeHandler);
    }, 0);
  }

  /**
   * 定位面板
   * @param {Element} panel
   * @param {Element} anchor
   */
  position(panel, anchor) {
    if (!anchor) {
      panel.style.top = "50%";
      panel.style.left = "50%";
      panel.style.transform = "translate(-50%, -50%)";
      return;
    }

    const rect = anchor.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();

    let top = rect.top - panelRect.height - 8;
    let left = rect.left + (rect.width - panelRect.width) / 2;

    if (top < 10) {
      top = rect.bottom + 8;
    }
    if (left + panelRect.width > window.innerWidth - 10) {
      left = window.innerWidth - panelRect.width - 10;
    }
    if (left < 10) left = 10;

    panel.style.top = `${top}px`;
    panel.style.left = `${left}px`;
  }

  /**
   * 复制到剪贴板
   * @param {Blob} blob
   * @param {string} url
   */
  async copyToClipboard(blob, url) {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ]);
      this.showSuccess("已复制到剪贴板");
    } catch (err) {
      console.error("Copy failed:", err);
      this.showError("复制失败，请重试");
    }
  }

  /**
   * 下载图片
   * @param {Blob} blob
   * @param {string} filename
   */
  downloadImage(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    this.showSuccess(`已下载: ${filename}`);
  }

  /** 显示成功提示 */
  showSuccess(msg) {
    const icon = this._panel?.querySelector(".aig-export-preview");
    if (icon) {
      const originalBoxShadow = icon.style.boxShadow;
      icon.style.boxShadow = "0 0 0 3px var(--aig-success)";
      setTimeout(() => {
        icon.style.boxShadow = originalBoxShadow;
      }, 500);
    }
  }

  /** 显示错误提示 */
  showError(msg) {
    const preview = this._panel?.querySelector(".aig-export-preview");
    if (preview) {
      const originalBoxShadow = preview.style.boxShadow;
      preview.style.boxShadow = "0 0 0 3px var(--aig-error)";
      setTimeout(() => {
        preview.style.boxShadow = originalBoxShadow;
      }, 500);
    }
  }

  /** 隐藏面板 */
  hide() {
    if (this._closeHandler) {
      document.removeEventListener("click", this._closeHandler);
      this._closeHandler = null;
    }
    if (this._panel) {
      const img = this._panel.querySelector("img");
      if (img?.src) {
        URL.revokeObjectURL(img.src);
      }
      this._panel.remove();
      this._panel = null;
    }
    this._blob = null;
  }
}
