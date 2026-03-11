import { BaseAdapter } from "./base.js";

/**
 * Gemini (gemini.google.com) 适配器
 *
 * DOM 结构要点（Web Components 为主）：
 * - 对话容器: .conversation-container
 * - 用户消息 turn: .query-content 或 user-query
 * - AI 回复 turn: .model-response-text 或 model-response
 * - Markdown 内容: .markdown 容器
 * - 操作栏: 回复底部的 action buttons
 *
 * 注意: Gemini 的 prompt 默认可能折叠，需要点击展开
 */
export class GeminiAdapter extends BaseAdapter {
  get name() {
    return "gemini";
  }

  static matches(url) {
    return /^https:\/\/gemini\.google\.com/i.test(url);
  }

  get turnSelector() {
    return ".conversation-turn, turn-container, .turn-content";
  }

  get responseSelector() {
    return ".model-response-text .markdown, model-response .markdown";
  }

  get promptSelector() {
    return ".query-text, .query-content, user-query";
  }

  get actionBarSelector() {
    return ".response-actions, .action-buttons, .bottom-actions";
  }

  getResponseElements() {
    // Gemini 使用自定义元素，需要更灵活的查找
    let elements = [
      ...document.querySelectorAll(".model-response-text .markdown"),
    ];
    if (elements.length === 0) {
      // 备选选择器
      elements = [...document.querySelectorAll("model-response .markdown")];
    }
    if (elements.length === 0) {
      elements = [
        ...document.querySelectorAll(".response-container .markdown"),
      ];
    }
    return elements;
  }

  getPromptForResponse(responseEl) {
    // Gemini 中, 向上找到最近的 turn 容器，再找同级或前面的 query
    let container =
      responseEl.closest(".conversation-turn") ||
      responseEl.closest("turn-container") ||
      responseEl.parentElement;

    // 向上遍历，查找 query
    let el = container;
    while (el) {
      const query = el.querySelector(".query-text, .query-content, user-query");
      if (query) return query;
      el = el.previousElementSibling;
    }
    return null;
  }

  getActionBar(responseEl) {
    // 从 response 向上查找包含操作按钮的容器
    let container =
      responseEl.closest(".conversation-turn") ||
      responseEl.closest("turn-container") ||
      responseEl.parentElement;

    if (!container) return null;

    const bar = container.querySelector(
      ".response-actions, .action-buttons, .bottom-actions",
    );
    if (bar) return bar;

    // 备选：查找包含 button 的最近容器
    const buttons = container.querySelectorAll("button");
    if (buttons.length > 0) {
      return buttons[buttons.length - 1].parentElement;
    }
    return null;
  }

  async preprocess(responseEl) {
    // Gemini 可能需要展开折叠的 prompt
    const container =
      responseEl.closest(".conversation-turn") ||
      responseEl.closest("turn-container");
    if (!container) return;

    // 查找"显示更多"按钮并点击
    const expandBtns = container.querySelectorAll(
      'button[aria-label*="展开"], button[aria-label*="expand"], .expand-button',
    );
    for (const btn of expandBtns) {
      btn.click();
      await new Promise((r) => setTimeout(r, 300));
    }
  }
}
