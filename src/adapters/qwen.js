/**
 * Qwen 通义千问 适配器
 */

const QwenAdapter = {
  name: "qwen",
  urlPattern: new URLPattern("https://chat.qwen.ai/*"),
  
  turnSelectors: [
    // 主选择器
    ".qwen-markdown",
    ".chat-user-message",
    
    // 备用选择器
    '[class*="message"]',
    '[class*="Message"]',
    '[class*="chat-item"]',
    '[class*="conversation"]',
    
    // 通用选择器
    "article",
    "[role='article']",
    '[class*="user"]',
    '[class*="assistant"]',
  ],
  
  actionBarSelectors: [
    "#qwen-chat-header-right",
    "[class*='toolbar']",
    "[class*='header']",
    "[class*='nav']",
    "[class*='actions']",
    "nav",
    "header",
  ],
};

export default QwenAdapter;
