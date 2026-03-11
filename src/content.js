/**
 * AI Glance — 入口文件
 * 检测当前页面对应的 AI 站点适配器，初始化所有模块
 */
import { detectAdapter } from "./adapters/registry.js";
import { ConversationManager } from "./core/conversation-manager.js";
import { Extractor } from "./core/extractor.js";
import { StyleManager } from "./core/style-manager.js";
import { Renderer } from "./core/renderer.js";
import { StylePicker } from "./ui/style-picker.js";

(function aiGlanceInit() {
  const adapter = detectAdapter();
  if (!adapter) {
    console.log("[AI Glance] 当前页面不匹配任何已知AI站点，插件未激活");
    return;
  }

  console.log(`[AI Glance] 检测到 ${adapter.name}，正在初始化...`);

  const extractor = new Extractor();
  const styleManager = new StyleManager();
  const renderer = new Renderer();

  let pendingTurns = null;

  function showToast(msg, isError = false) {
    const toast = document.createElement("div");
    toast.className = `aig-toast${isError ? " aig-toast-error" : ""}`;
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  }

  const stylePicker = new StylePicker(styleManager, (style) => {
    if (!pendingTurns) return;
    const turns = pendingTurns;
    pendingTurns = null;

    showToast("生成中...");

    const turnHTMLs = extractor.extractTurns(turns);
    renderer
      .render(turnHTMLs, style)
      .then((blob) =>
        navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]),
      )
      .then(() => showToast("已复制到剪贴板"))
      .catch(() => showToast("复制失败", true));
  });

  const manager = new ConversationManager(adapter, {
    onGenerate(selectedTurns) {
      pendingTurns = selectedTurns;
      const mainBtn = document.querySelector(".aig-main-btn");
      stylePicker.show(mainBtn || document.body);
    },
  });

  manager.start();
  console.log("[AI Glance] 初始化完成");
})();
