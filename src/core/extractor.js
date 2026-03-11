/**
 * 内容提取器 — 使用适配器从页面元素中提取对话内容
 */
export class Extractor {
  /**
   * @param {import('../adapters/base.js').BaseAdapter} adapter
   */
  constructor(adapter) {
    this.adapter = adapter;
  }

  /**
   * 提取一组对话（prompt + response）的内容
   * @param {Element} responseEl AI 回复元素
   * @returns {{ promptText: string, responseHTML: string } | null}
   */
  async extract(responseEl) {
    // 预处理（如展开折叠内容）
    await this.adapter.preprocess(responseEl);

    const promptEl = this.adapter.getPromptForResponse(responseEl);
    const promptText = this.adapter.extractPromptText(promptEl);
    const responseHTML = this.adapter.extractResponseHTML(responseEl);

    if (!responseHTML) return null;

    return {
      promptText,
      responseHTML: this.sanitizeHTML(responseHTML),
    };
  }

  /**
   * 清理 HTML，移除不需要的脚本标签等
   */
  sanitizeHTML(html) {
    // 移除 script 和 style 标签
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");
  }
}
