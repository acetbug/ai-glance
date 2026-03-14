# AI Glance ✨

一键将 AI 对话导出为精美风格化图片的浏览器扩展。

## 项目总览

AI Glance 采用 Manifest V3 架构，核心流程是：

1. content script 在对话页注入主按钮。
2. 用户进入多选模式，勾选要导出的轮次。
3. 选择预设/自定义风格。
4. 将选中内容清洗后拼装为独立容器。
5. 通过 background + offscreen 文档使用 snapdom 渲染为 PNG。
6. 返回 Blob 并写入系统剪贴板。

## 主要功能

- 多轮对话选择导出（支持全选、取消、计数提示）。
- 4 套风格预设：浅色、深色、暖色、海洋。
- 自定义颜色项：背景、文字、强调色、Prompt 背景、代码背景、代码文字。
- 风格可保存到 chrome.storage.local，作为默认样式复用。
- 统一清洗导出内容（移除脚本、按钮、事件属性等非内容元素）。
- 使用 offscreen 渲染，减少页面卡顿。

## 已支持站点

| 站点 | 状态 |
| --- | --- |
| ChatGPT (`chatgpt.com`) | ✅ |
| Claude (`claude.ai`) | ✅ |
| DeepSeek (`chat.deepseek.com`) | ✅ |
| 豆包 (`www.doubao.com`) | ✅ |
| Gemini (`gemini.google.com`) | ✅ |
| Grok (`grok.com`) | ✅ |
| 通义千问 (`chat.qwen.ai`) | ✅ |

## 目录结构（当前实现）

```text
.
├─ build.mjs                 # 构建脚本（esbuild 打包 + 静态资源拷贝）
├─ manifest.json             # Chrome 扩展清单（MV3）
├─ src/
│  ├─ content.js             # 内容脚本入口，初始化 Core
│  ├─ content.css            # 注入样式（按钮/工具栏/选择器/Toast）
│  ├─ background.js          # 后台转发与 offscreen 生命周期管理
│  ├─ offscreen.html         # offscreen 文档页面
│  ├─ offscreen.js           # snapdom 实际渲染执行
│  ├─ adapters/              # 各站点选择器适配
│  │  ├─ manager.js
│  │  ├─ chatgpt.js
│  │  ├─ claude.js
│  │  ├─ deepseek.js
│  │  ├─ doubao.js
│  │  ├─ gemini.js
│  │  ├─ grok.js
│  │  └─ qwen.js
│  ├─ core/
│  │  ├─ core.js             # 主流程编排（模式切换、生成、状态）
│  │  └─ runtime.js          # 选择态与 DOM 清洗工具
│  ├─ render/
│  │  └─ renderer.js         # 向后台发起渲染请求并获取 PNG Blob
│  ├─ styles/
│  │  ├─ manager.js          # 风格存储与读写
│  │  ├─ presets.js          # 风格预设数据
│  │  ├─ rules.js            # 样式规则表
│  │  └─ stylizer.js         # 构建并应用样式容器
│  └─ ui/
│     ├─ main-button.js
│     ├─ toolbar.js
│     ├─ style-picker.js
│     └─ toast.js
└─ icons/
```

## 技术栈

- JavaScript (ESM)
- Chrome Extensions Manifest V3
- esbuild
- @zumer/snapdom

## 本地开发

```bash
# 安装依赖
npm install

# 生产构建（输出 dist/）
npm run build

# 开发监听（增量构建）
npm run watch

# 清理构建产物
npm run clean
```

## 加载到 Chrome

1. 执行 `npm run build`。
2. 打开 `chrome://extensions/`。
3. 开启“开发者模式”。
4. 选择“加载已解压的扩展程序”。
5. 选择项目下的 `dist/` 目录。

## 新增站点适配步骤

当前实现采用“对象式适配器 + 管理器检测”模式（不是继承基类）。

1. 在 `src/adapters/` 新建一个 `xxx.js`，导出对象：
	- `name`
	- `urlPattern`（`new URLPattern(...)`）
	- `turnSelector`
	- `actionBarSelector`
2. 在 `src/core/core.js` 中引入并传给 `new AdapterManager(...)`。
3. 在 `manifest.json` 的 `content_scripts.matches` 中加入站点 URL。
4. 执行 `npm run build` 并在对应站点验证按钮注入、选择与生成流程。

## 已知限制

- 依赖站点 DOM 结构，若页面改版需要更新适配器选择器。
- 当前导出目标是“复制到剪贴板”，未内置“下载图片”按钮。
- 渲染质量与页面内容复杂度相关，超长内容可能耗时更久。
