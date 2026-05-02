/**
 * Grok 适配器
 */

const GrokAdapter = {
  name: "grok",
  urlPattern: new URLPattern("https://grok.com/*"),
  
  turnSelectors: [
    // 主选择器
    ".markdown",
    
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
    '[aria-label="Create share link"]',
    "[class*='toolbar']",
    "[class*='header']",
    "[class*='nav']",
    "[class*='actions']",
    "nav",
    "header",
  ],
};

export default GrokAdapter;
