/**
 * 豆包 (Doubao) 适配器
 * 支持多种选择器以适应不同版本的页面结构
 */

const DoubaoAdapter = {
  name: "doubao",
  urlPattern: new URLPattern("https://www.doubao.com/*"),
  
  // 优先级从高到低的选择器列表
  turnSelectors: [
    // 2025年5月可能的选择器
    '[data-testid="message-container"]',
    '[data-testid="message-item"]',
    '[data-testid="chat-message"]',
    
    // 旧版选择器
    '[data-testid="message_text_content"]',
    
    // 通用选择器 - 按类名查找
    '.chat-message',
    '.message-item',
    '.conversation-item',
    
    // 更通用的选择器
    '[class*="message"]',
    '[class*="Message"]',
    
    // 角色标签选择器
    '[role="region"]',
  ],
  
  actionBarSelectors: [
    "#generic-tools-placeholder",
    '[class*="chat-input"]',
    '[class*="input-area"]',
    '.chat-input-container',
    '.input-wrapper',
    'nav',
    'header',
  ],
  
  // 自动检测：查找包含多个相似子元素的容器
  autoDetect: function() {
    console.log("[AI Glance] Doubao auto-detecting message elements...");
    
    // 策略1: 查找所有带有 data-testid 的元素
    const allDataTestIds = document.querySelectorAll('[data-testid]');
    const idCounts = {};
    
    allDataTestIds.forEach(el => {
      const id = el.getAttribute('data-testid');
      if (id) {
        idCounts[id] = (idCounts[id] || 0) + 1;
      }
    });
    
    console.log("[AI Glance] Doubao data-testid counts:", idCounts);
    
    // 找出现次数最多且包含 "message" 的元素
    let bestSelector = null;
    let bestCount = 0;
    
    for (const [id, count] of Object.entries(idCounts)) {
      if (count >= 2 && (id.toLowerCase().includes('message') || 
                          id.toLowerCase().includes('chat') ||
                          id.toLowerCase().includes('item'))) {
        if (count > bestCount) {
          bestCount = count;
          bestSelector = `[data-testid="${id}"]`;
        }
      }
    }
    
    if (bestSelector) {
      console.log("[AI Glance] Doubao auto-detected best selector:", bestSelector, "with", bestCount, "elements");
      return bestSelector;
    }
    
    // 策略2: 查找具有相似结构的元素
    console.log("[AI Glance] Doubao trying structure-based detection...");
    
    // 查找所有可能包含对话的容器
    const mainContent = document.querySelector('main') || 
                        document.querySelector('[role="main"]') ||
                        document.body;
    
    // 尝试找包含多个相似子元素的容器
    const containers = mainContent.querySelectorAll('div, section, article');
    let bestContainer = null;
    let bestChildCount = 0;
    
    containers.forEach(container => {
      // 检查子元素是否有相似的结构
      const children = Array.from(container.children);
      if (children.length >= 2) {
        // 检查子元素是否有相似的类名模式
        const firstClassName = children[0].className || '';
        const similarCount = children.filter(child => {
          const childClass = child.className || '';
          // 检查是否有相似的类名（共享至少一个类）
          if (firstClassName && childClass) {
            const firstClasses = firstClassName.split(' ').filter(c => c);
            const childClasses = childClass.split(' ').filter(c => c);
            return firstClasses.some(cls => childClasses.includes(cls));
          }
          return false;
        }).length;
        
        if (similarCount >= 2 && similarCount > bestChildCount) {
          bestChildCount = similarCount;
          bestContainer = container;
        }
      }
    });
    
    if (bestContainer && bestContainer.firstElementChild) {
      const firstChild = bestContainer.firstElementChild;
      if (firstChild.className) {
        const classes = firstChild.className.split(' ').filter(c => c);
        if (classes.length > 0) {
          const selector = `.${classes[0].replace(/:/g, '\\:')}`;
          console.log("[AI Glance] Doubao auto-detected class selector:", selector);
          return selector;
        }
      }
    }
    
    console.log("[AI Glance] Doubao auto-detection failed, returning fallback");
    return null;
  }
};

export default DoubaoAdapter;
