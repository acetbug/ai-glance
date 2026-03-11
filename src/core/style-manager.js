/**
 * 风格管理器 — 管理图片渲染风格的预设和自定义
 * 使用 chrome.storage.local 持久化用户选择
 */

/** 风格预设 */
export const STYLE_PRESETS = {
  light: {
    id: "light",
    name: "浅色",
    bg: "#ffffff",
    text: "#1a1a1a",
    promptBg: "#f0f4ff",
    promptBorder: "#c8d4f0",
    promptText: "#2c3e6b",
    codeBg: "#f6f8fa",
    codeText: "#24292e",
    codeBorder: "#e1e4e8",
    accent: "#4a90d9",
    fontFamily: '-apple-system, "Segoe UI", Roboto, "Noto Sans SC", sans-serif',
    fontSize: "15px",
    borderRadius: "12px",
    padding: "28px",
    watermark: "AI Glance",
  },
  dark: {
    id: "dark",
    name: "深色",
    bg: "#1e1e2e",
    text: "#cdd6f4",
    promptBg: "#313244",
    promptBorder: "#45475a",
    promptText: "#bac2de",
    codeBg: "#181825",
    codeText: "#a6e3a1",
    codeBorder: "#313244",
    accent: "#89b4fa",
    fontFamily: '-apple-system, "Segoe UI", Roboto, "Noto Sans SC", sans-serif',
    fontSize: "15px",
    borderRadius: "12px",
    padding: "28px",
    watermark: "AI Glance",
  },
  warm: {
    id: "warm",
    name: "暖色",
    bg: "#fdf6e3",
    text: "#073642",
    promptBg: "#eee8d5",
    promptBorder: "#d4c9a8",
    promptText: "#586e75",
    codeBg: "#eee8d5",
    codeText: "#586e75",
    codeBorder: "#d4c9a8",
    accent: "#b58900",
    fontFamily: 'Georgia, "Noto Serif SC", serif',
    fontSize: "15px",
    borderRadius: "12px",
    padding: "28px",
    watermark: "AI Glance",
  },
  ocean: {
    id: "ocean",
    name: "海洋",
    bg: "#0d1b2a",
    text: "#e0e1dd",
    promptBg: "#1b263b",
    promptBorder: "#415a77",
    promptText: "#a8b2c1",
    codeBg: "#0d1b2a",
    codeText: "#7ec8e3",
    codeBorder: "#1b263b",
    accent: "#7ec8e3",
    fontFamily: '-apple-system, "Segoe UI", Roboto, "Noto Sans SC", sans-serif',
    fontSize: "15px",
    borderRadius: "12px",
    padding: "28px",
    watermark: "AI Glance",
  },
};

const STORAGE_KEY = "ai-glance-style";

export class StyleManager {
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
