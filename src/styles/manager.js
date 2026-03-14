/**
 * 风格管理器 — 管理图片渲染风格的预设和自定义
 * 使用 chrome.storage.local 持久化用户选择
 */
import STYLE_PRESETS from "./presets.js";

const STORAGE_KEY = "ai-glance-style";

export default class StyleManager {
  constructor() {
    this._current = null;
  }

  /** 获取所有预设列表 */
  getPresets() {
    return Object.values(STYLE_PRESETS);
  }

  /** 获取当前保存的风格（含自定义覆盖） */
  async getCurrentStyle() {
    if (this._current) return this._current;

    try {
      const data = await chrome.storage.local.get(STORAGE_KEY);
      if (data[STORAGE_KEY]) {
        this._current = data[STORAGE_KEY];
        return this._current;
      }
    } catch {
      // storage 不可用时降级到默认
    }

    this._current = { ...STYLE_PRESETS.light };
    return this._current;
  }

  /** 保存风格选择 */
  async saveStyle(style) {
    this._current = { ...style };
    try {
      await chrome.storage.local.set({ [STORAGE_KEY]: this._current });
    } catch {
      // 静默失败
    }
  }

  /** 应用预设 */
  async applyPreset(presetId) {
    const preset = STYLE_PRESETS[presetId];
    if (!preset) return;
    await this.saveStyle(preset);
    return preset;
  }

  /** 更新单个属性 */
  async updateProperty(key, value) {
    const current = await this.getCurrentStyle();
    current[key] = value;
    await this.saveStyle(current);
    return current;
  }
}
