# AI Glance ✨

一键将 AI 对话导出为精美风格化图片的浏览器扩展。

## 功能

- 在 AI 回复的操作栏中注入「复制图片」按钮
- 点击后弹出风格选择器，支持 4 种预设风格（浅色/深色/暖色/海洋）
- 支持自定义颜色（背景、文字、强调色、代码块等）
- 风格选择可保存为默认
- 自动提取 Prompt + AI 回复，重新渲染为精美图片并复制到剪贴板

## 支持的 AI 站点

| 站点                            | 状态      |
| ------------------------------- | --------- |
| ChatGPT (chatgpt.com)           | ✅ 已适配 |
| Gemini (gemini.google.com)      | ✅ 已适配 |
| Claude (claude.ai)              | ✅ 已适配 |
| Copilot (copilot.microsoft.com) | 🔜 待适配 |

> 架构设计为适配器模式，新增站点只需添加一个 adapter 文件。

## 架构

```
src/
├── adapters/          # 站点适配器（逻辑与选择器数据分离）
│   ├── base.js        # 基类接口
│   ├── chatgpt.js     # ChatGPT 选择器 & 定制逻辑
│   ├── gemini.js      # Gemini 选择器 & 定制逻辑
│   ├── claude.js      # Claude 选择器 & 定制逻辑
│   └── registry.js    # 适配器自动检测与注册
├── core/
│   ├── conversation-manager.js  # 对话监控 (MutationObserver)
│   ├── extractor.js             # 内容提取
│   ├── style-manager.js         # 风格预设与持久化
│   └── renderer.js              # HTML → 图片渲染
├── ui/
│   ├── copy-button.js   # 复制按钮组件
│   ├── style-picker.js  # 风格选择器气泡
│   └── ...
├── content.js           # 入口文件
└── content.css          # 注入样式
```

## 开发

```bash
# 安装依赖
npm install

# 构建（输出到 dist/）
npm run build

# 监听模式
npm run watch
```

## 安装到浏览器

1. 运行 `npm run build`
2. 打开 Chrome → `chrome://extensions/`
3. 开启「开发者模式」
4. 点击「加载已解压的扩展程序」
5. 选择 `dist/` 文件夹

## 添加新的 AI 站点适配器

1. 在 `src/adapters/` 新建文件，继承 `BaseAdapter`
2. 实现 `name`、`matches()`、各选择器和必要的方法覆盖
3. 在 `registry.js` 中注册
4. 在 `manifest.json` 的 `matches` 中添加站点 URL
