/**
 * Claude 适配器
 */

const ClaudeAdapter = {
  name: "claude",
  urlPattern: new URLPattern("https://claude.ai/*"),
  
  turnSelectors: [
    // 主选择器
    "[data-test-render-count]",
    
    // 备用选择器
    '[class*="message"]',
    '[class*="Message"]',
    '[class*="conversation-item"]',
    '[class*="chat-item"]',
    
    // 通用选择器
    "article",
    "[role='article']",
    '[class*="user"]',
    '[class*="assistant"]',
  ],
  
  actionBarSelectors: [
    '[data-testid="wiggle-controls-actions"]',
    "[class*='toolbar']",
    "[class*='header']",
    "[class*='nav']",
    "nav",
    "header",
  ],
};

export default ClaudeAdapter;
