import html2canvas from "html2canvas";

/**
 * 渲染器 — 将提取的对话内容按选定风格渲染为图片
 *
 * 流程: 构建 styled HTML → 插入隐藏容器 → html2canvas 截图 → Blob
 */
export class Renderer {
  /**
   * 将对话内容渲染为图片 Blob
   * @param {{ promptText: string, responseHTML: string }} content
   * @param {object} style 风格配置
   * @returns {Promise<Blob>}
   */
  async render(content, style) {
    const container = this.buildContainer(content, style);

    // 插入到页面（必须在 DOM 中才能让 html2canvas 正常工作）
    document.body.appendChild(container);

    try {
      // 等待内部图片等资源加载
      await this.waitForImages(container);

      const canvas = await html2canvas(container, {
        backgroundColor: null, // 使用容器自己的背景色
        scale: 2, // 高清输出
        useCORS: true,
        logging: false,
        width: container.offsetWidth,
        height: container.offsetHeight,
      });

      return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Canvas toBlob failed"));
        }, "image/png");
      });
    } finally {
      container.remove();
    }
  }

  /**
   * 构建带样式的渲染容器
   */
  buildContainer(content, style) {
    const container = document.createElement("div");
    container.className = "aig-render-container";
    Object.assign(container.style, {
      position: "fixed",
      left: "-9999px",
      top: "0",
      zIndex: "-1",
      width: "680px",
      background: style.bg,
      color: style.text,
      fontFamily: style.fontFamily,
      fontSize: style.fontSize,
      lineHeight: "1.7",
      padding: style.padding,
      borderRadius: style.borderRadius,
      overflow: "hidden",
    });

    // Prompt 区域
    if (content.promptText) {
      const promptSection = document.createElement("div");
      promptSection.className = "aig-prompt-section";
      Object.assign(promptSection.style, {
        background: style.promptBg,
        border: `1px solid ${style.promptBorder}`,
        borderRadius: "8px",
        padding: "16px 20px",
        marginBottom: "20px",
        color: style.promptText,
        fontSize: "14px",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      });

      // Prompt 标签
      const label = document.createElement("div");
      Object.assign(label.style, {
        fontSize: "12px",
        fontWeight: "600",
        color: style.accent,
        marginBottom: "8px",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
      });
      label.textContent = "PROMPT";
      promptSection.appendChild(label);

      const promptBody = document.createElement("div");
      promptBody.textContent = content.promptText;
      promptSection.appendChild(promptBody);

      container.appendChild(promptSection);
    }

    // 分隔线
    const divider = document.createElement("div");
    Object.assign(divider.style, {
      height: "1px",
      background: style.codeBorder,
      margin: "0 0 20px 0",
    });
    container.appendChild(divider);

    // AI 回复区域
    const responseSection = document.createElement("div");
    responseSection.className = "aig-response-section";
    responseSection.innerHTML = content.responseHTML;

    // 应用回复区域的内部样式
    this.applyResponseStyles(responseSection, style);

    container.appendChild(responseSection);

    // 水印 / 底部标识
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
   * 对响应 HTML 内部元素应用自定义样式
   */
  applyResponseStyles(el, style) {
    // 段落
    el.querySelectorAll("p").forEach((p) => {
      Object.assign(p.style, { margin: "0 0 12px 0" });
    });

    // 标题
    el.querySelectorAll("h1,h2,h3,h4,h5,h6").forEach((h) => {
      Object.assign(h.style, {
        color: style.text,
        marginTop: "20px",
        marginBottom: "10px",
        fontWeight: "600",
      });
    });

    // 代码块
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

    // 行内代码
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

    // 列表
    el.querySelectorAll("ul,ol").forEach((list) => {
      Object.assign(list.style, {
        paddingLeft: "24px",
        margin: "8px 0",
      });
    });

    el.querySelectorAll("li").forEach((li) => {
      Object.assign(li.style, { margin: "4px 0" });
    });

    // 引用块
    el.querySelectorAll("blockquote").forEach((bq) => {
      Object.assign(bq.style, {
        borderLeft: `3px solid ${style.accent}`,
        paddingLeft: "16px",
        margin: "12px 0",
        color: style.promptText,
        fontStyle: "italic",
      });
    });

    // 链接
    el.querySelectorAll("a").forEach((a) => {
      Object.assign(a.style, {
        color: style.accent,
        textDecoration: "underline",
      });
    });

    // 表格
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

    // 移除原有的 class 避免被页面样式干扰（但保留结构信息）
    el.querySelectorAll("[class]").forEach((node) => {
      // 只清除与原站相关的类名，保留我们自己的
      if (!node.className.startsWith?.("aig-")) {
        node.removeAttribute("class");
      }
    });

    // 清理 SVG 图标按钮等非内容元素
    el.querySelectorAll('button, [role="button"]').forEach((btn) =>
      btn.remove(),
    );
  }

  /**
   * 等待容器内所有图片加载完成
   */
  waitForImages(container) {
    const images = container.querySelectorAll("img");
    if (images.length === 0) return Promise.resolve();

    const promises = [...images].map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve; // 失败也继续
          }),
    );
    return Promise.all(promises);
  }
}
