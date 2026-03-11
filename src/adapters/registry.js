import { ChatGPTAdapter } from "./chatgpt.js";
import { GeminiAdapter } from "./gemini.js";
import { ClaudeAdapter } from "./claude.js";

/** 所有已注册适配器 */
const adapters = [ChatGPTAdapter, GeminiAdapter, ClaudeAdapter];

/**
 * 根据当前页面 URL 自动检测并返回适配器实例
 * @returns {import('./base.js').BaseAdapter | null}
 */
export function detectAdapter() {
  const url = location.href;
  for (const AdapterClass of adapters) {
    if (AdapterClass.matches(url)) {
      return new AdapterClass();
    }
  }
  return null;
}

/**
 * 注册自定义适配器（供扩展者使用）
 */
export function registerAdapter(AdapterClass) {
  adapters.push(AdapterClass);
}
