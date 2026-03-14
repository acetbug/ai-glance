/**
 * 风格化器 — 构建渲染容器并一次性应用所有风格规则
 *
 * 流程：先用 class 标识构建完整 DOM 结构，最后统一 applyRules。
 * 所有样式声明集中在 rules.js，此处只负责结构和应用。
 */
import buildStyleRules from "./rules.js";

/**
 * @param {Element[]} nodes
 * @param {object} style
 * @returns {Element}
 */
export default function stylize(nodes, style) {
  const container = decoration(nodes, style);
  applyRules(container, style);
  return container;
}

function decoration(nodes, style) {
  const container = document.createElement("div");
  container.className = "aig-container";
  container.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");

  nodes.forEach((node, i) => {
    container.appendChild(node);
    if (i < nodes.length - 1) {
      const divider = document.createElement("div");
      divider.className = "aig-divider";
      container.appendChild(divider);
    }
  });

  if (style.watermark) {
    const wm = document.createElement("div");
    wm.className = "aig-watermark";
    wm.textContent = style.watermark;
    container.appendChild(wm);
  }

  return container;
}

function applyRules(container, style) {
  const root = document.createElement("div");
  root.appendChild(container);
  for (const { selector, styles } of buildStyleRules(style)) {
    root.querySelectorAll(selector).forEach((el) => {
      Object.assign(el.style, styles);
    });
  }
  return container;
}
