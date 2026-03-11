import { BaseAdapter } from "./base.js";

/**
 * Claude (claude.ai) 适配器
 *
 * DOM 结构要点：
 * - 对话消息: [data-testid="user-message"], [data-testid="ai-message"]
 * - 用户消息内容在 user-message 内
 * - AI 回复内容在 ai-message 内的 .grid-cols-1 .markdown 等
 * - 操作栏: AI 消息底部的反馈/复制按钮区
 */
export class ClaudeAdapter extends BaseAdapter {
  get name() {
    return "claude";
  }

  static matches(url) {
    return /^https:\/\/claude\.ai/i.test(url);
  }

  get turnSelector() {
    return '.group\\/turn, [data-testid$="-message"]';
  }

  get responseSelector() {
    return '[data-testid="ai-message"] .grid-cols-1 .markdown, [data-testid="ai-message"] .font-claude-message';
  }

  get promptSelector() {
    return '[data-testid="user-message"]';
  }

  get actionBarSelector() {
    return ".flex.items-center.justify-between";
  }

  getResponseElements() {
    let els = [
      ...document.querySelectorAll(
        '[data-testid="ai-message"] .grid-cols-1 .markdown',
      ),
    ];
    if (els.length === 0) {
      els = [
        ...document.querySelectorAll(
          '[data-testid="ai-message"] .font-claude-message',
        ),
      ];
    }
    return els;
  }

  getPromptForResponse(responseEl) {
    // 向上找 ai-message 容器
    const aiMsg =
      responseEl.closest('[data-testid="ai-message"]') ||
      responseEl.closest(".group\\/turn");
    if (!aiMsg) return null;

    let prev = aiMsg.previousElementSibling;
    while (prev) {
      const userMsg =
        prev.querySelector('[data-testid="user-message"]') ||
        prev.matches?.('[data-testid="user-message"]')
          ? prev
          : null;
      if (userMsg) return userMsg;
      if (prev.matches?.('[data-testid="user-message"]')) return prev;
      prev = prev.previousElementSibling;
    }
    return null;
  }

  getActionBar(responseEl) {
    const aiMsg =
      responseEl.closest('[data-testid="ai-message"]') ||
      responseEl.closest(".group\\/turn");
    if (!aiMsg) return null;

    // Claude 操作栏一般在消息末尾
    const bars = aiMsg.querySelectorAll(".flex.items-center");
    for (let i = bars.length - 1; i >= 0; i--) {
      if (bars[i].querySelector("button")) return bars[i];
    }
    return null;
  }
}
