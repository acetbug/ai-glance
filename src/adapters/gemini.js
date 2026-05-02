/**
 * Gemini 适配器
 */

const GeminiAdapter = {
  name: "gemini",
  urlPattern: new URLPattern("https://gemini.google.com/*"),
  
  turnSelectors: [
    // 主选择器
    ".query-text",
    ".response-content",
    
    // 备用选择器
    '[class*="message"]',
    '[class*="Message"]',
    '[class*="query"]',
    '[class*="response"]',
    
    // 通用选择器
    "article",
    "[role='article']",
    '[class*="user"]',
    '[class*="assistant"]',
  ],
  
  actionBarSelectors: [
    "top-bar-actions .right-section",
    "[class*='toolbar']",
    "[class*='header']",
    "[class*='nav']",
    "[class*='actions']",
    "nav",
    "header",
  ],
};

export default GeminiAdapter;
