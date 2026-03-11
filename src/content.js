/**
 * AI Glance — 入口文件
 * 检测当前页面对应的 AI 站点适配器，初始化所有模块
 */
import { detectAdapter } from "./adapters/registry.js";
import { ConversationManager } from "./core/conversation-manager.js";
import { Extractor } from "./core/extractor.js";
import { StyleManager } from "./core/style-manager.js";
import { Renderer } from "./core/renderer.js";
import { CopyButton } from "./ui/copy-button.js";
import { StylePicker } from "./ui/style-picker.js";

(function aiGlanceInit() {
  const adapter = detectAdapter();
  if (!adapter) {
    console.log("[AI Glance] 当前页面不匹配任何已知AI站点，插件未激活");
    return;
  }

  console.log(`[AI Glance] 检测到 ${adapter.name}，正在初始化...`);

  const extractor = new Extractor(adapter);
  const styleManager = new StyleManager();
  const renderer = new Renderer();

  /** 执行复制流程 */
  async function doCopy(responseEl, buttonEl, style) {
    CopyButton.setState(buttonEl, "loading");

    try {
      const content = await extractor.extract(responseEl);
      if (!content) {
        throw new Error("无法提取对话内容");
      }

      const blob = await renderer.render(content, style);

      // 复制到剪贴板
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);

      CopyButton.setState(buttonEl, "success");
    } catch (err) {
      console.error("[AI Glance] 复制失败:", err);
      CopyButton.setState(buttonEl, "error");
    }
  }

  // 当前正在操作的 response 和 button 引用
  let pendingResponseEl = null;
  let pendingButtonEl = null;

  // 风格选择器（确认后执行复制）
  const stylePicker = new StylePicker(styleManager, (style) => {
    if (pendingResponseEl && pendingButtonEl) {
      doCopy(pendingResponseEl, pendingButtonEl, style);
    }
    pendingResponseEl = null;
    pendingButtonEl = null;
  });

  // 复制按钮（点击后弹出风格选择器）
  const copyButton = new CopyButton((responseEl, buttonEl) => {
    pendingResponseEl = responseEl;
    pendingButtonEl = buttonEl;
    stylePicker.show(buttonEl);
  });

  // 注入按钮的回调
  function injectButton(responseEl) {
    const actionBar = adapter.getActionBar(responseEl);
    if (actionBar) {
      copyButton.inject(actionBar, responseEl);
    } else {
      // 没找到操作栏，直接在回复后面插入
      copyButton.injectAfterResponse(responseEl);
    }
  }

  // 启动对话管理器
  const manager = new ConversationManager(adapter, injectButton);
  manager.start();

  console.log("[AI Glance] 初始化完成，正在监控对话...");
})();
