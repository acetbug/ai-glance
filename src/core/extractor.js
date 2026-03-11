/**
 * 内容提取器 — 从选中的 turn 元素中提取 HTML
 */
export class Extractor {
  /**
   * 提取一组 turn 元素的 HTML 内容
   * @param {Element[]} turnElements
   * @returns {string[]}
   */
  extractTurns(turnElements) {
    return turnElements.map((el) => {
      const clone = el.cloneNode(true);
      // 移除我们注入的 UI 元素
      clone.querySelectorAll(".aig-turn-check").forEach((c) => c.remove());
      clone.classList.remove("aig-selectable", "aig-selected");
      return this.sanitizeHTML(clone.innerHTML);
    });
  }

  sanitizeHTML(html) {
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");
  }
}
