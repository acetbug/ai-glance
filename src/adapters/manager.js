/**
 * 适配器管理器
 * 支持多选择器列表和自动检测功能
 */

export default class AdapterManager {
  constructor(...adapters) {
    this.adapters = {};
    this._currentAdapter = null;
    this._lastUsedSelector = null;
    this._lastUsedActionBarSelector = null;
    
    for (const adapter of adapters) this.register(adapter);
  }

  detect() {
    this._currentAdapter = null;
    const url = location.href;
    
    console.log("[AI Glance] Detecting adapter for URL:", url);
    
    Object.values(this.adapters).forEach((adapter) => {
      try {
        if (adapter.urlPattern?.test(url)) {
          this._currentAdapter = adapter;
          console.log("[AI Glance] Detected adapter:", adapter.name);
        }
      } catch (e) {
        console.warn("[AI Glance] Error testing adapter:", adapter.name, e);
      }
    });
    
    return this._currentAdapter;
  }

  register(adapter) {
    if (adapter.name) {
      this.adapters[adapter.name] = adapter;
      console.log("[AI Glance] Registered adapter:", adapter.name);
    }
  }

  /**
   * 使用选择器列表查找元素
   * @param {string[]} selectors 选择器列表（按优先级排序）
   * @param {string} selectorName 选择器名称（用于日志）
   * @returns {Element|null|Element[]} 找到的元素或 null
   */
  _findWithSelectors(selectors, selectorName) {
    if (!selectors || selectors.length === 0) {
      console.log(`[AI Glance] No ${selectorName} selectors provided`);
      return null;
    }

    console.log(`[AI Glance] Trying ${selectorName} selectors:`, selectors);
    
    for (let i = 0; i < selectors.length; i++) {
      const selector = selectors[i];
      try {
        const elements = document.querySelectorAll(selector);
        console.log(`[AI Glance] ${selectorName} selector "${selector}" found ${elements.length} elements`);
        
        if (elements.length > 0) {
          this._lastUsedSelector = selector;
          console.log(`[AI Glance] Using ${selectorName} selector:`, selector);
          return [...elements];
        }
      } catch (e) {
        console.warn(`[AI Glance] Error with ${selectorName} selector "${selector}":`, e);
      }
    }
    
    return null;
  }

  /**
   * 获取单个元素（用于 actionBar）
   * @param {string[]} selectors 选择器列表
   * @param {string} selectorName 选择器名称
   * @returns {Element|null}
   */
  _findFirstWithSelectors(selectors, selectorName) {
    const elements = this._findWithSelectors(selectors, selectorName);
    if (elements && elements.length > 0) {
      this._lastUsedActionBarSelector = this._lastUsedSelector;
      return elements[0];
    }
    return null;
  }

  getTurnElements() {
    if (!this._currentAdapter) {
      console.warn("[AI Glance] No adapter detected, cannot get turn elements");
      return [];
    }

    console.log("[AI Glance] Getting turn elements for adapter:", this._currentAdapter.name);

    // 策略1: 使用 turnSelectors 列表
    if (this._currentAdapter.turnSelectors && this._currentAdapter.turnSelectors.length > 0) {
      const elements = this._findWithSelectors(
        this._currentAdapter.turnSelectors, 
        "turn"
      );
      if (elements && elements.length > 0) {
        return elements;
      }
    }

    // 策略2: 回退到旧的单个 turnSelector
    if (this._currentAdapter.turnSelector) {
      console.log("[AI Glance] Trying legacy turnSelector:", this._currentAdapter.turnSelector);
      try {
        const elements = [...document.querySelectorAll(this._currentAdapter.turnSelector)];
        console.log(`[AI Glance] Legacy turnSelector found ${elements.length} elements`);
        if (elements.length > 0) {
          this._lastUsedSelector = this._currentAdapter.turnSelector;
          return elements;
        }
      } catch (e) {
        console.warn("[AI Glance] Error with legacy turnSelector:", e);
      }
    }

    // 策略3: 尝试自动检测
    if (this._currentAdapter.autoDetect && typeof this._currentAdapter.autoDetect === 'function') {
      console.log("[AI Glance] Attempting auto-detection...");
      try {
        const autoSelector = this._currentAdapter.autoDetect();
        if (autoSelector) {
          console.log("[AI Glance] Auto-detected selector:", autoSelector);
          try {
            const elements = [...document.querySelectorAll(autoSelector)];
            console.log(`[AI Glance] Auto-detected selector found ${elements.length} elements`);
            if (elements.length > 0) {
              this._lastUsedSelector = autoSelector;
              return elements;
            }
          } catch (e) {
            console.warn("[AI Glance] Error with auto-detected selector:", e);
          }
        }
      } catch (e) {
        console.warn("[AI Glance] Auto-detection failed:", e);
      }
    }

    // 策略4: 最后尝试 - 查找所有可能的消息元素
    console.log("[AI Glance] Trying last-resort selectors...");
    
    const lastResortSelectors = [
      '[class*="message"]',
      '[class*="Message"]',
      '[class*="chat"]',
      '[class*="Chat"]',
      '[class*="conversation"]',
      '[class*="Conversation"]',
      'article',
      '[role="article"]',
    ];
    
    for (const selector of lastResortSelectors) {
      try {
        const elements = [...document.querySelectorAll(selector)];
        if (elements.length >= 2) {
          console.log(`[AI Glance] Last-resort selector "${selector}" found ${elements.length} elements`);
          this._lastUsedSelector = selector;
          return elements;
        }
      } catch (e) {
        // 忽略
      }
    }

    console.warn("[AI Glance] Failed to find any turn elements");
    return [];
  }

  getActionBar() {
    if (!this._currentAdapter) {
      console.warn("[AI Glance] No adapter detected, cannot get action bar");
      return null;
    }

    console.log("[AI Glance] Getting action bar for adapter:", this._currentAdapter.name);

    // 策略1: 使用 actionBarSelectors 列表
    if (this._currentAdapter.actionBarSelectors && this._currentAdapter.actionBarSelectors.length > 0) {
      const element = this._findFirstWithSelectors(
        this._currentAdapter.actionBarSelectors, 
        "actionBar"
      );
      if (element) {
        return element;
      }
    }

    // 策略2: 回退到旧的单个 actionBarSelector
    if (this._currentAdapter.actionBarSelector) {
      console.log("[AI Glance] Trying legacy actionBarSelector:", this._currentAdapter.actionBarSelector);
      try {
        const element = document.querySelector(this._currentAdapter.actionBarSelector);
        if (element) {
          console.log("[AI Glance] Legacy actionBarSelector found element");
          this._lastUsedActionBarSelector = this._currentAdapter.actionBarSelector;
          return element;
        }
      } catch (e) {
        console.warn("[AI Glance] Error with legacy actionBarSelector:", e);
      }
    }

    // 策略3: 尝试查找常见的导航栏
    console.log("[AI Glance] Trying fallback navigation selectors...");
    
    const fallbackSelectors = [
      'nav',
      'header',
      '[class*="nav"]',
      '[class*="header"]',
      '[class*="toolbar"]',
      '[class*="input"]',
      '[role="navigation"]',
      '[role="banner"]',
    ];
    
    for (const selector of fallbackSelectors) {
      try {
        const element = document.querySelector(selector);
        if (element) {
          console.log(`[AI Glance] Fallback selector "${selector}" found element`);
          this._lastUsedActionBarSelector = selector;
          return element;
        }
      } catch (e) {
        // 忽略
      }
    }

    console.warn("[AI Glance] Failed to find any action bar, returning document.body");
    return document.body;
  }

  /**
   * 获取最后使用的选择器（用于调试）
   */
  getLastUsedSelectors() {
    return {
      turnSelector: this._lastUsedSelector,
      actionBarSelector: this._lastUsedActionBarSelector,
    };
  }
}
