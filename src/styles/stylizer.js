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
 * @param {object} config
 * @returns {Element}
 */
export default function stylize(nodes, style, config = {}) {
  const container = decoration(nodes, style, config);
  applyRules(container, style, config);
  return container;
}

function decoration(nodes, style, config) {
  const container = document.createElement("div");
  container.className = "aig-container";
  container.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");

  if (config.titleEnabled && config.title) {
    const titleEl = document.createElement("div");
    titleEl.className = "aig-title";
    titleEl.textContent = config.title;
    container.appendChild(titleEl);
  }

  nodes.forEach((node, i) => {
    container.appendChild(node);
    if (i < nodes.length - 1) {
      const divider = document.createElement("div");
      divider.className = "aig-divider";
      container.appendChild(divider);
    }
  });

  if (config.watermarkEnabled !== false && config.watermark) {
    const wm = document.createElement("div");
    wm.className = "aig-watermark";
    wm.textContent = config.watermark;
    container.appendChild(wm);
  } else if (config.watermarkEnabled !== false && style.watermark) {
    const wm = document.createElement("div");
    wm.className = "aig-watermark";
    wm.textContent = style.watermark;
    container.appendChild(wm);
  }

  return container;
}

function applyRules(container, style, config) {
  const root = document.createElement("div");
  root.appendChild(container);
  
  const width = config.width || 420;
  
  for (const { selector, styles } of buildStyleRules(style, { ...config, width })) {
    root.querySelectorAll(selector).forEach((el) => {
      Object.assign(el.style, styles);
    });
  }
  return container;
}

export function createExportFilename(style, config) {
  const timestamp = new Date();
  const dateStr = timestamp.toISOString().slice(0, 10);
  const styleName = style.name || style.id || "ai-conversation";
  const sanitizedStyleName = styleName.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, "-");
  
  return `${sanitizedStyleName}-${dateStr}.png`;
}

export function estimateDimensions(nodeCount, config) {
  const baseHeight = 100;
  const perNodeHeight = 150;
  const width = config.width || 420;
  const scale = config.scale || 2;
  
  return {
    width: width * scale,
    height: Math.round((baseHeight + nodeCount * perNodeHeight) * scale),
  };
}
