/**
 * 站点适配器基类 — 定义所有适配器必须实现的接口
 * 具体站点适配器只需提供选择器数据和少量定制逻辑
 */
export class BaseAdapter {
  /** 站点标识 */
  get name() {
    throw new Error("adapter must define name");
  }

  /** 判断当前页面是否由此适配器处理 */
  static matches(_url) {
    return false;
  }

  // ── 选择器（子类覆盖即可） ──────────────────────────

  /** 整个对话容器选择器 */
  get conversationContainerSelector() {
    return "";
  }

  /** 单个对话轮次（turn）选择器 */
  get turnSelector() {
    return "";
  }

  /** 在一个 turn 中，AI 回复容器选择器 */
  get responseSelector() {
    return "";
  }

  /** 在一个 turn 中，用户提问容器选择器 */
  get promptSelector() {
    return "";
  }

  /** AI 回复底部操作栏选择器（我们将按钮插入此处） */
  get actionBarSelector() {
    return "";
  }

  // ── 方法 ────────────────────────────────────────────

  /**
   * 获取页面上所有 AI 回复元素
   * @returns {Element[]}
   */
  getResponseElements() {
    return [...document.querySelectorAll(this.responseSelector)];
  }

  /**
   * 给定一个 AI 回复元素，返回对应的用户 prompt 元素
   * 默认逻辑：向上查找最近的 turn 容器，再在其中或前面找 prompt
   */
  getPromptForResponse(responseEl) {
    // 默认：找到包含此 response 的 turn，然后向前找 prompt turn
    const turn = responseEl.closest(this.turnSelector);
    if (!turn) return null;
    const prevTurn = turn.previousElementSibling;
    if (prevTurn) {
      const prompt = prevTurn.querySelector(this.promptSelector) || prevTurn;
      return prompt;
    }
    return null;
  }

  /**
   * 获取 AI 回复元素对应的操作栏
   */
  getActionBar(responseEl) {
    const turn = responseEl.closest(this.turnSelector);
    if (!turn) return null;
    return turn.querySelector(this.actionBarSelector);
  }

  /**
   * 提取 AI 回复的 HTML 内容
   */
  extractResponseHTML(responseEl) {
    return responseEl.innerHTML;
  }

  /**
   * 提取用户 prompt 的纯文本
   */
  extractPromptText(promptEl) {
    return promptEl?.innerText?.trim() || "";
  }

  /**
   * 预处理（如展开折叠内容），返回 Promise
   */
  async preprocess(_responseEl) {
    // 默认无操作
  }

  /**
   * 判断一个 response 是否已经完成（非流式输出中）
   */
  isResponseComplete(_responseEl) {
    return true;
  }
}
