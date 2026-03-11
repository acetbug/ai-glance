/**
 * 复制按钮组件 — 注入到 AI 回复操作栏的一键复制图片按钮
 */
export class CopyButton {
  /**
   * @param {(responseEl: Element, buttonEl: Element) => void} onClick
   */
  constructor(onClick) {
    this.onClick = onClick;
  }

  /**
   * 创建按钮并注入到操作栏
   * @param {Element} actionBar 操作栏元素
   * @param {Element} responseEl 对应的 AI 回复元素
   */
  inject(actionBar, responseEl) {
    if (!actionBar) return null;

    // 防止重复注入
    if (actionBar.querySelector(".aig-copy-btn")) return null;

    const btn = document.createElement("button");
    btn.className = "aig-copy-btn";
    btn.title = "复制为图片";
    btn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
      <span class="aig-copy-btn-text">复制图片</span>
    `;

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.onClick(responseEl, btn);
    });

    actionBar.appendChild(btn);
    return btn;
  }

  /**
   * 在没有找到操作栏时，直接在 response 元素后插入按钮
   */
  injectAfterResponse(responseEl) {
    // 检查是否已注入
    if (responseEl.parentElement?.querySelector(".aig-copy-btn-standalone"))
      return null;

    const wrapper = document.createElement("div");
    wrapper.className = "aig-copy-btn-standalone";

    const btn = document.createElement("button");
    btn.className = "aig-copy-btn";
    btn.title = "复制为图片";
    btn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
      <span class="aig-copy-btn-text">复制图片</span>
    `;

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.onClick(responseEl, btn);
    });

    wrapper.appendChild(btn);

    // 在 response 元素的 turn 容器末尾插入
    const parent = responseEl.parentElement;
    if (parent) {
      parent.insertBefore(wrapper, responseEl.nextSibling);
    }

    return btn;
  }

  /**
   * 设置按钮状态
   */
  static setState(btn, state) {
    const textEl = btn.querySelector(".aig-copy-btn-text");
    if (!textEl) return;

    switch (state) {
      case "loading":
        btn.disabled = true;
        btn.classList.add("aig-loading");
        textEl.textContent = "生成中...";
        break;
      case "success":
        btn.disabled = false;
        btn.classList.remove("aig-loading");
        btn.classList.add("aig-success");
        textEl.textContent = "已复制!";
        setTimeout(() => {
          btn.classList.remove("aig-success");
          textEl.textContent = "复制图片";
        }, 2000);
        break;
      case "error":
        btn.disabled = false;
        btn.classList.remove("aig-loading");
        btn.classList.add("aig-error");
        textEl.textContent = "失败";
        setTimeout(() => {
          btn.classList.remove("aig-error");
          textEl.textContent = "复制图片";
        }, 2000);
        break;
      default:
        btn.disabled = false;
        btn.classList.remove("aig-loading", "aig-success", "aig-error");
        textEl.textContent = "复制图片";
    }
  }
}
