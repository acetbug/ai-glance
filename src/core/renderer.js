import html2canvas from "html2canvas";

/**
 * 渲染器 — 将选中的 turn 内容按选定风格渲染为图片
 *
 * 流程: 构建 styled HTML → 插入隐藏容器 → html2canvas 截图 → Blob
 */
export class Renderer {
  /**
   * 将多个 turn 的 HTML 渲染为图片 Blob
   * @param {string[]} turnHTMLs 每个 turn 的 HTML 内容
   * @param {object} style 风格配置
   * @returns {Promise<Blob>}
   */
  async render(turnHTMLs, style) {
    const container = this.buildContainer(turnHTMLs, style);

    document.body.appendChild(container);

    try {
      // 加载图片与 html2canvas 前置准备可并行
      const imgReady = this.waitForImages(container);

      // 让浏览器完成一次布局
      await new Promise((r) => requestAnimationFrame(r));
      await imgReady;

      const canvas = await html2canvas(container, {
        backgroundColor: null,
        scale: window.devicePixelRatio > 1 ? 1.5 : 2,
        useCORS: true,
        logging: false,
        width: container.offsetWidth,
        height: container.offsetHeight,
        windowWidth: container.offsetWidth,
      });

      return new Promise((resolve, reject) => {
        canvas.toBlob(
          (blob) =>
            blob ? resolve(blob) : reject(new Error("Canvas toBlob failed")),
          "image/png",
        );
      });
    } finally {
      container.remove();
    }
  }

  /**
   * 构建带样式的渲染容器
   */
  buildContainer(turnHTMLs, style) {
    const container = document.createElement("div");
    container.className = "aig-render-container";
    Object.assign(container.style, {
      position: "fixed",
      left: "-9999px",
      top: "0",
      zIndex: "-1",
      width: "420px",
      background: style.bg,
      color: style.text,
      fontFamily: style.fontFamily,
      fontSize: style.fontSize,
      lineHeight: "1.7",
      padding: style.padding,
      borderRadius: style.borderRadius,
      overflow: "hidden",
    });

    turnHTMLs.forEach((html, i) => {
      const section = document.createElement("div");
      section.innerHTML = html;
      this.applyTurnStyles(section, style);
      container.appendChild(section);

      if (i < turnHTMLs.length - 1) {
        const divider = document.createElement("div");
        Object.assign(divider.style, {
          height: "1px",
          background: style.codeBorder,
          margin: "20px 0",
        });
        container.appendChild(divider);
      }
    });

    if (style.watermark) {
      const watermark = document.createElement("div");
      Object.assign(watermark.style, {
        marginTop: "24px",
        paddingTop: "12px",
        borderTop: `1px solid ${style.codeBorder}`,
        fontSize: "11px",
        color: style.promptText,
        opacity: "0.5",
        textAlign: "right",
      });
      watermark.textContent = style.watermark;
      container.appendChild(watermark);
    }

    return container;
  }

  /**
   * 对 turn 内部元素应用自定义样式
   */
  applyTurnStyles(el, style) {
    el.querySelectorAll("p").forEach((p) => {
      Object.assign(p.style, { margin: "0 0 12px 0" });
    });

    el.querySelectorAll("h1,h2,h3,h4,h5,h6").forEach((h) => {
      Object.assign(h.style, {
        color: style.text,
        marginTop: "20px",
        marginBottom: "10px",
        fontWeight: "600",
      });
    });

    el.querySelectorAll("pre").forEach((pre) => {
      Object.assign(pre.style, {
        background: style.codeBg,
        color: style.codeText,
        border: `1px solid ${style.codeBorder}`,
        borderRadius: "8px",
        padding: "16px",
        overflow: "auto",
        fontSize: "13px",
        lineHeight: "1.5",
        margin: "12px 0",
        fontFamily: '"Fira Code", "JetBrains Mono", Consolas, monospace',
        whiteSpace: "pre-wrap",
        wordBreak: "break-all",
      });
    });

    el.querySelectorAll("code").forEach((code) => {
      if (code.parentElement?.tagName !== "PRE") {
        Object.assign(code.style, {
          background: style.codeBg,
          color: style.codeText,
          padding: "2px 6px",
          borderRadius: "4px",
          fontSize: "13px",
          fontFamily: '"Fira Code", Consolas, monospace',
        });
      }
    });

    el.querySelectorAll("ul,ol").forEach((list) => {
      Object.assign(list.style, {
        paddingLeft: "24px",
        margin: "8px 0",
      });
    });

    el.querySelectorAll("li").forEach((li) => {
      Object.assign(li.style, { margin: "4px 0" });
    });

    el.querySelectorAll("blockquote").forEach((bq) => {
      Object.assign(bq.style, {
        borderLeft: `3px solid ${style.accent}`,
        paddingLeft: "16px",
        margin: "12px 0",
        color: style.promptText,
        fontStyle: "italic",
      });
    });

    el.querySelectorAll("a").forEach((a) => {
      Object.assign(a.style, {
        color: style.accent,
        textDecoration: "underline",
      });
    });

    el.querySelectorAll("table").forEach((table) => {
      Object.assign(table.style, {
        borderCollapse: "collapse",
        width: "100%",
        margin: "12px 0",
        fontSize: "14px",
      });
    });

    el.querySelectorAll("th").forEach((th) => {
      Object.assign(th.style, {
        background: style.codeBg,
        border: `1px solid ${style.codeBorder}`,
        padding: "8px 12px",
        fontWeight: "600",
        textAlign: "left",
      });
    });

    el.querySelectorAll("td").forEach((td) => {
      Object.assign(td.style, {
        border: `1px solid ${style.codeBorder}`,
        padding: "8px 12px",
      });
    });

    el.querySelectorAll("[class]").forEach((node) => {
      if (!node.className.startsWith?.("aig-")) {
        node.removeAttribute("class");
      }
    });

    el.querySelectorAll('button, [role="button"]').forEach((btn) =>
      btn.remove(),
    );

    // 约束图片尺寸
    el.querySelectorAll("img").forEach((img) => {
      Object.assign(img.style, {
        maxWidth: "100%",
        height: "auto",
      });
    });
  }

  waitForImages(container) {
    const images = container.querySelectorAll("img");
    if (images.length === 0) return Promise.resolve();

    const promises = [...images].map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          }),
    );
    return Promise.all(promises);
  }
}
