/**
 * 全局配置管理器
 * 管理主题切换、导出配置、历史记录等
 */

const STORAGE_KEY_THEME = "ai-glance-theme";
const STORAGE_KEY_CONFIG = "ai-glance-export-config";
const STORAGE_KEY_HISTORY = "ai-glance-history";

const DEFAULT_EXPORT_CONFIG = {
  width: 420,
  quality: "high",
  scale: 2,
  watermark: "AI Glance",
  watermarkEnabled: true,
  title: "",
  titleEnabled: false,
};

const MAX_HISTORY = 20;

export default class ConfigManager {
  constructor() {
    this._theme = null;
    this._exportConfig = null;
    this._listeners = new Set();
  }

  /** 获取当前主题 */
  async getTheme() {
    if (this._theme !== null) return this._theme;

    try {
      const data = await chrome.storage.local.get(STORAGE_KEY_THEME);
      if (data[STORAGE_KEY_THEME]) {
        this._theme = data[STORAGE_KEY_THEME];
      } else {
        const prefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)",
        ).matches;
        this._theme = prefersDark ? "dark" : "light";
      }
    } catch {
      this._theme = "light";
    }

    return this._theme;
  }

  /** 设置主题 */
  async setTheme(theme) {
    const oldTheme = this._theme;
    this._theme = theme;

    try {
      await chrome.storage.local.set({ [STORAGE_KEY_THEME]: theme });
    } catch {
      // 静默失败
    }

    this.applyTheme(theme);
    this.notify("theme", { old: oldTheme, new: theme });
  }

  /** 应用主题到DOM */
  applyTheme(theme) {
    if (theme === "dark") {
      document.documentElement.setAttribute("data-aig-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-aig-theme");
    }
  }

  /** 切换主题 */
  async toggleTheme() {
    const current = await this.getTheme();
    const newTheme = current === "light" ? "dark" : "light";
    await this.setTheme(newTheme);
    return newTheme;
  }

  /** 获取导出配置 */
  async getExportConfig() {
    if (this._exportConfig !== null)
      return { ...DEFAULT_EXPORT_CONFIG, ...this._exportConfig };

    try {
      const data = await chrome.storage.local.get(STORAGE_KEY_CONFIG);
      if (data[STORAGE_KEY_CONFIG]) {
        this._exportConfig = data[STORAGE_KEY_CONFIG];
      } else {
        this._exportConfig = { ...DEFAULT_EXPORT_CONFIG };
      }
    } catch {
      this._exportConfig = { ...DEFAULT_EXPORT_CONFIG };
    }

    return { ...DEFAULT_EXPORT_CONFIG, ...this._exportConfig };
  }

  /** 保存导出配置 */
  async saveExportConfig(config) {
    this._exportConfig = { ...this._exportConfig, ...config };

    try {
      await chrome.storage.local.set({
        [STORAGE_KEY_CONFIG]: this._exportConfig,
      });
    } catch {
      // 静默失败
    }

    this.notify("exportConfig", this._exportConfig);
  }

  /** 获取历史记录 */
  async getHistory() {
    try {
      const data = await chrome.storage.local.get(STORAGE_KEY_HISTORY);
      return data[STORAGE_KEY_HISTORY] || [];
    } catch {
      return [];
    }
  }

  /** 添加历史记录 */
  async addHistory(entry) {
    const history = await this.getHistory();
    const newEntry = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      ...entry,
    };

    history.unshift(newEntry);
    if (history.length > MAX_HISTORY) {
      history.splice(MAX_HISTORY);
    }

    try {
      await chrome.storage.local.set({ [STORAGE_KEY_HISTORY]: history });
    } catch {
      // 静默失败
    }

    this.notify("history", history);
    return newEntry;
  }

  /** 清空历史记录 */
  async clearHistory() {
    try {
      await chrome.storage.local.remove(STORAGE_KEY_HISTORY);
    } catch {
      // 静默失败
    }
    this.notify("history", []);
  }

  /** 订阅配置变更 */
  subscribe(callback) {
    this._listeners.add(callback);
    return () => this._listeners.delete(callback);
  }

  /** 通知订阅者 */
  notify(type, data) {
    this._listeners.forEach((cb) => cb(type, data));
  }

  /** 初始化主题 */
  async initTheme() {
    const theme = await this.getTheme();
    this.applyTheme(theme);
    return theme;
  }
}
