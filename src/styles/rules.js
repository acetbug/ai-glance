/**
 * 风格规则表 — 纯数据声明，不包含任何 DOM 操作逻辑
 *
 * 返回 { selector, styles } 对象数组，由外部传入的风格配置 s 驱动。
 * 包含容器布局、内容排版、分隔线与水印的所有样式规则。
 * 添加新的样式规则只需在此文件追加条目，无需修改应用逻辑。
 */

const DEFAULT_CONTAINER_WIDTH = 420;

export default function buildStyleRules(s, config = {}) {
  const containerWidth = config.width || DEFAULT_CONTAINER_WIDTH;

  return [
    // ── 容器 ──
    {
      selector: ".aig-container",
      styles: {
        width: `${containerWidth}px`,
        background: s.bg,
        color: s.text,
        fontFamily: s.fontFamily,
        fontSize: s.fontSize,
        lineHeight: "1.7",
        padding: s.padding,
        borderRadius: s.borderRadius,
        overflow: "visible",
      },
    },
    // ── 标题 ──
    {
      selector: ".aig-title",
      styles: {
        fontSize: "20px",
        fontWeight: "700",
        color: s.text,
        marginBottom: "20px",
        paddingBottom: "16px",
        borderBottom: `2px solid ${s.accent}`,
        textAlign: "center",
        letterSpacing: "0.5px",
      },
    },
    // ── 分隔线 ──
    {
      selector: ".aig-divider",
      styles: {
        height: "1px",
        background: s.codeBorder,
        margin: "40px 0",
      },
    },
    // ── 水印 ──
    {
      selector: ".aig-watermark",
      styles: {
        marginTop: "24px",
        paddingTop: "12px",
        borderTop: `1px solid ${s.codeBorder}`,
        fontSize: "11px",
        color: s.promptText,
        opacity: "0.5",
        textAlign: "right",
      },
    },
    // ── 排版基础 ──
    { selector: "p", styles: { margin: "0 0 12px 0" } },
    { selector: "ul,ol", styles: { paddingLeft: "24px", margin: "8px 0" } },
    { selector: "li", styles: { margin: "4px 0" } },
    {
      selector: "img",
      styles: {
        maxWidth: "100%",
        height: "auto",
        display: "block",
        margin: "12px 0",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      },
    },
    {
      selector: "picture",
      styles: {
        display: "block",
        margin: "12px 0",
      },
    },
    {
      selector: "svg",
      styles: {
        maxWidth: "100%",
        height: "auto",
        display: "block",
        margin: "12px 0",
      },
    },
    {
      selector: "figure",
      styles: {
        margin: "16px 0",
        textAlign: "center",
      },
    },
    {
      selector: "figcaption",
      styles: {
        fontSize: "12px",
        color: s.text,
        opacity: "0.7",
        marginTop: "8px",
      },
    },
    // ── 主题驱动 ──
    {
      selector: "h1,h2,h3,h4,h5,h6",
      styles: {
        color: s.text,
        marginTop: "20px",
        marginBottom: "10px",
        fontWeight: "600",
      },
    },
    {
      selector: "pre",
      styles: {
        background: s.codeBg,
        color: s.codeText,
        border: `1px solid ${s.codeBorder}`,
        borderRadius: "8px",
        padding: "16px",
        overflow: "visible",
        fontSize: "13px",
        lineHeight: "1.5",
        margin: "12px 0",
        fontFamily: '"Fira Code", "JetBrains Mono", Consolas, monospace',
        whiteSpace: "pre-wrap",
        overflowWrap: "anywhere",
        wordBreak: "break-word",
      },
    },
    {
      selector: "code:not(pre code)",
      styles: {
        background: s.codeBg,
        color: s.codeText,
        padding: "2px 6px",
        borderRadius: "4px",
        fontSize: "13px",
        fontFamily: '"Fira Code", Consolas, monospace',
        boxDecorationBreak: "clone",
        WebkitBoxDecorationBreak: "clone",
      },
    },
    {
      selector: "blockquote",
      styles: {
        borderLeft: `3px solid ${s.accent}`,
        paddingLeft: "16px",
        margin: "12px 0",
        color: s.promptText,
        fontStyle: "italic",
      },
    },
    { selector: "a", styles: { color: s.accent, textDecoration: "underline" } },
    {
      selector: "table",
      styles: {
        borderCollapse: "collapse",
        width: "100%",
        margin: "12px 0",
        fontSize: "14px",
      },
    },
    {
      selector: "th",
      styles: {
        background: s.codeBg,
        border: `1px solid ${s.codeBorder}`,
        padding: "8px 12px",
        fontWeight: "600",
        textAlign: "left",
        color: s.text,
      },
    },
    {
      selector: "td",
      styles: {
        border: `1px solid ${s.codeBorder}`,
        padding: "8px 12px",
        color: s.text,
      },
    },
    {
      selector: "hr",
      styles: {
        border: "none",
        height: "1px",
        background: s.codeBorder,
        margin: "20px 0",
      },
    },
    {
      selector: "br",
      styles: {
        lineHeight: "inherit",
      },
    },
    {
      selector: "strong",
      styles: {
        fontWeight: "700",
      },
    },
    {
      selector: "em",
      styles: {
        fontStyle: "italic",
      },
    },
    {
      selector: "del",
      styles: {
        textDecoration: "line-through",
        opacity: "0.6",
      },
    },
    {
      selector: "mark",
      styles: {
        background: s.accent,
        color: s.bg,
        padding: "2px 4px",
        borderRadius: "3px",
      },
    },
    {
      selector: "sub",
      styles: {
        fontSize: "0.75em",
        verticalAlign: "sub",
      },
    },
    {
      selector: "sup",
      styles: {
        fontSize: "0.75em",
        verticalAlign: "super",
      },
    },
    {
      selector: "details",
      styles: {
        margin: "12px 0",
      },
    },
    {
      selector: "summary",
      styles: {
        cursor: "pointer",
        fontWeight: "500",
        color: s.accent,
      },
    },
    {
      selector: "kbd",
      styles: {
        background: s.codeBg,
        color: s.codeText,
        border: `1px solid ${s.codeBorder}`,
        borderRadius: "4px",
        padding: "2px 6px",
        fontSize: "12px",
        fontFamily: '"Fira Code", Consolas, monospace',
        boxShadow: `0 1px 0 ${s.codeBorder}`,
      },
    },
    {
      selector: "samp",
      styles: {
        fontFamily: '"Fira Code", Consolas, monospace',
        color: s.codeText,
      },
    },
    {
      selector: "var",
      styles: {
        fontStyle: "italic",
        color: s.accent,
      },
    },
  ];
}
