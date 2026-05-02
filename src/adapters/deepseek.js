/**
 * DeepSeek 适配器
 */

const DeepSeekAdapter = {
  name: "deepseek",
  urlPattern: new URLPattern("https://chat.deepseek.com/*"),
  
  turnSelectors: [
    // 主选择器
    ".ds-message",
    
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
    ".bf38813a",
    "[class*='toolbar']",
    "[class*='header']",
    "[class*='nav']",
    "[class*='input-area']",
    "nav",
    "header",
  ],
};

export default DeepSeekAdapter;
