import { BaseAdapter } from "./base.js";

/**
 * ChatGPT (chatgpt.com / chat.openai.com) 适配器
 *
 * DOM 结构要点：
 * - 对话轮次: article[data-testid^="conversation-turn-"]
 * - 用户消息: [data-message-author-role="user"]
 * - AI 回复:  [data-message-author-role="assistant"]
 * - Markdown 内容: .markdown.prose 或 .markdown
 * - 操作栏: 回复底部的按钮容器
 */
export class ChatGPTAdapter extends BaseAdapter {
  get name() {
    return "chatgpt";
  }

  static matches(url) {
    return /^https:\/\/(chatgpt\.com|chat\.openai\.com)/i.test(url);
  }

  get turnSelector() {
    return 'article[data-testid^="conversation-turn-"]';
  }

  get responseSelector() {
    return '[data-message-author-role="assistant"] .markdown';
  }

  get promptSelector() {
    return '[data-message-author-role="user"]';
  }

  get actionBarSelector() {
    // ChatGPT 的操作栏是 assistant turn 底部包含复制/重新生成等按钮的 div
    return ".flex.justify-between";
  }

  getResponseElements() {
    return [...document.querySelectorAll(this.responseSelector)];
  }

  getPromptForResponse(responseEl) {
    // 找到包含此 response 的 article turn
    const turn = responseEl.closest(this.turnSelector);
    if (!turn) return null;

    // 前一个 article 即为 user turn
    let prev = turn.previousElementSibling;
    while (prev) {
      const userMsg = prev.querySelector(this.promptSelector);
      if (userMsg) return userMsg;
      prev = prev.previousElementSibling;
    }
    return null;
  }

  getActionBar(responseEl) {
    const turn = responseEl.closest(this.turnSelector);
    if (!turn) return null;
    // 查找 turn 内的操作按钮区域
    // ChatGPT 通常在 .markdown 容器后有操作栏
    const actionBars = turn.querySelectorAll(".flex.items-center");
    // 取最后一个（底部操作栏）
    for (let i = actionBars.length - 1; i >= 0; i--) {
      const bar = actionBars[i];
      // 确保是包含按钮的操作栏
      if (bar.querySelector("button")) return bar;
    }
    return null;
  }

  extractResponseHTML(responseEl) {
    return responseEl.innerHTML;
  }

  extractPromptText(promptEl) {
    if (!promptEl) return "";
    // 用户消息可能在 .whitespace-pre-wrap 内
    const inner = promptEl.querySelector(".whitespace-pre-wrap");
    return (inner || promptEl).innerText.trim();
  }

  isResponseComplete(responseEl) {
    const turn = responseEl.closest(this.turnSelector);
    if (!turn) return true;
    // 如果存在"停止生成"按钮，说明还在生成中
    const stopBtn = turn.querySelector('button[aria-label="Stop generating"]');
    return !stopBtn;
  }
}
