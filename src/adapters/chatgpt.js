/**
 * ChatGPT 适配器
 */

const ChatGPTAdapter = {
  name: "chatgpt",
  urlPattern: new URLPattern("https://chatgpt.com/*"),
  
  turnSelectors: [
    // 主选择器
    "article",
    '[data-message-author-role]',
    '[class*="message"]',
    
    // 备用选择器
    "main article",
    "[role='article']",
    
    // 旧版选择器
    ".group",
  ],
  
  actionBarSelectors: [
    "#conversation-header-actions",
    "[class*='conversation'] [class*='header']",
    "[class*='actions']",
    "nav",
    "header",
  ],
};

export default ChatGPTAdapter;
