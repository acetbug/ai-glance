/**
 * 对话管理器 — 监控页面对话变化，为每个 AI 回复注入复制按钮
 *
 * 使用 MutationObserver 监听 DOM 变化，当新的 AI 回复出现时自动注入按钮。
 * 维护已处理元素集合，避免重复注入。
 */
export class ConversationManager {
  /**
   * @param {import('../adapters/base.js').BaseAdapter} adapter
   * @param {(responseEl: Element) => void} onInjectButton 注入按钮的回调
   */
  constructor(adapter, onInjectButton) {
    this.adapter = adapter;
    this.onInjectButton = onInjectButton;
    this._processed = new WeakSet();
    this._observer = null;
    this._scanTimer = null;
  }

  /** 启动监控 */
  start() {
    // 初始扫描
    this.scan();

    // MutationObserver 监听新消息
    this._observer = new MutationObserver(() => {
      // 防抖：避免频繁扫描（流式输出时 DOM 高频变化）
      clearTimeout(this._scanTimer);
      this._scanTimer = setTimeout(() => this.scan(), 500);
    });

    this._observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // 定时兜底扫描（某些 SPA 路由变化可能不触发 mutation）
    this._fallbackInterval = setInterval(() => this.scan(), 3000);
  }

  /** 停止监控 */
  stop() {
    this._observer?.disconnect();
    clearTimeout(this._scanTimer);
    clearInterval(this._fallbackInterval);
  }

  /** 扫描页面，为新的 AI 回复注入按钮 */
  scan() {
    const responses = this.adapter.getResponseElements();

    for (const responseEl of responses) {
      if (this._processed.has(responseEl)) continue;

      // 检查是否已完成生成
      if (!this.adapter.isResponseComplete(responseEl)) continue;

      this._processed.add(responseEl);
      this.onInjectButton(responseEl);
    }
  }
}
