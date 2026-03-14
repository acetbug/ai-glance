/**
 * 风格规则表 — 纯数据声明，不包含任何 DOM 操作逻辑
 *
 * 返回 { selector, styles } 对象数组，由外部传入的风格配置 s 驱动。
 * 包含容器布局、内容排版、分隔线与水印的所有样式规则。
 * 添加新的样式规则只需在此文件追加条目，无需修改应用逻辑。
 */

const CONTAINER_WIDTH = 420;

export default function buildStyleRules(s) {
  return [
    // ── 容器 ──
    {
      selector: ".aig-container",
      styles: {
        width: `${CONTAINER_WIDTH}px`,
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
    { selector: "img", styles: { maxWidth: "100%", height: "auto" } },
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
      },
    },
    {
      selector: "td",
      styles: {
        border: `1px solid ${s.codeBorder}`,
        padding: "8px 12px",
      },
    },
  ];
}
