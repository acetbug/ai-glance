/**
 * 进度指示器组件
 * 显示渲染进度、支持重试机制
 */

export default class ProgressOverlay {
  constructor() {
    this._overlay = null;
    this._progressBar = null;
    this._progressText = null;
    this._subText = null;
    this._onRetry = null;
    this._retryBtn = null;
  }

  /**
   * 显示进度覆盖层
   * @param {string} text 主文本
   * @param {Function} onRetry 重试回调
   */
  show(text = "正在生成图片...", onRetry = null) {
    this.hide();
    this._onRetry = onRetry;

    const overlay = document.createElement("div");
    overlay.className = "aig-progress-overlay";
    overlay.innerHTML = `
      <div class="aig-progress-card">
        <div class="aig-progress-spinner"></div>
        <div class="aig-progress-text">${text}</div>
        <div class="aig-progress-bar">
          <div class="aig-progress-fill" style="width: 0%"></div>
        </div>
        <div class="aig-progress-subtext">请稍候，这可能需要几秒钟...</div>
      </div>
    `;

    document.body.appendChild(overlay);
    this._overlay = overlay;
    this._progressBar = overlay.querySelector(".aig-progress-fill");
    this._progressText = overlay.querySelector(".aig-progress-text");
    this._subText = overlay.querySelector(".aig-progress-subtext");

    this._simulateProgress();
  }

  /** 模拟进度条动画 */
  _simulateProgress() {
    if (!this._progressBar) return;
    let progress = 0;
    const interval = setInterval(() => {
      if (!this._progressBar) {
        clearInterval(interval);
        return;
      }
      if (progress < 80) {
        progress += Math.random() * 15;
        if (progress > 80) progress = 80;
        this._progressBar.style.width = `${progress}%`;
      }
    }, 500);
    this._progressInterval = interval;
  }

  /**
   * 更新进度
   * @param {number} percent 百分比 0-100
   * @param {string} text 可选文本更新
   */
  update(percent, text = null) {
    if (this._progressBar) {
      this._progressBar.style.width = `${Math.min(100, Math.max(0, percent))}%`;
    }
    if (text && this._progressText) {
      this._progressText.textContent = text;
    }
  }

  /**
   * 显示错误状态
   * @param {string} errorMsg 错误信息
   * @param {Function} onRetry 重试回调
   */
  showError(errorMsg = "生成失败", onRetry = null) {
    if (!this._overlay) return;

    if (this._progressInterval) {
      clearInterval(this._progressInterval);
    }

    const card = this._overlay.querySelector(".aig-progress-card");
    if (card) {
      card.innerHTML = `
        <div class="aig-progress-text" style="color: var(--aig-error); margin-bottom: 8px;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:inline-block; vertical-align:middle; margin-right:8px;">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          生成失败
        </div>
        <div class="aig-progress-subtext">${errorMsg}</div>
        ${onRetry ? '<button class="aig-progress-retry">重试</button>' : ''}
      `;

      const retryBtn = card.querySelector(".aig-progress-retry");
      if (retryBtn && (onRetry || this._onRetry)) {
        retryBtn.addEventListener("click", () => {
          const callback = onRetry || this._onRetry;
          if (callback) {
            this.hide();
            callback();
          }
        });
      }
    }
  }

  /** 隐藏进度覆盖层 */
  hide() {
    if (this._progressInterval) {
      clearInterval(this._progressInterval);
      this._progressInterval = null;
    }
    if (this._overlay) {
      this._overlay.remove();
      this._overlay = null;
      this._progressBar = null;
      this._progressText = null;
      this._subText = null;
    }
  }
}
