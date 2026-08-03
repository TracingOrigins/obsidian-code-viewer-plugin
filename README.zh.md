<div align="center">
    <h1>Code Viewer</h1>
    <p>
        <img src="https://img.shields.io/badge/dynamic/json?logo=obsidian&color=%23483699&label=downloads&query=%24%5B%22code-viewer%22%5D.downloads&url=https%3A%2F%2Fraw.githubusercontent.com%2Fobsidianmd%2Fobsidian-releases%2Fmaster%2Fcommunity-plugin-stats.json" alt="Obsidian Downloads">
        <img src="https://img.shields.io/github/downloads/TracingOrigins/obsidian-code-viewer-plugin/total?logo=github" alt="GitHub Downloads">
    </p>
    <p>[中文 | <a href="https://github.com/TracingOrigins/obsidian-code-viewer-plugin/blob/master/README.md">English</a> | <a href="https://github.com/TracingOrigins/obsidian-code-viewer-plugin/blob/master/README.ru.md">Русский</a>]</p>
</div>

Code Viewer 是一个用于**查看和编辑**代码文件的 Obsidian 插件。点击任意支持的代码文件即可使用原生语法高亮查看，也可通过内联编辑器快速修改 — 无需外部依赖。

## 功能特性

- **原生语法高亮** — 使用 Obsidian 内置的 `MarkdownRenderer`，配色始终跟随当前主题
- **自动扩展名注册** — `.py`、`.ts`、`.js`、`.sh`、`.rs`、`.go` 等 50+ 种扩展名可直接在 Code Viewer 中打开
- **行号显示** — 可选的行号栏，可配置开关
- **零依赖** — 运行时无外部库，仅使用 Obsidian API
- **只读设计** — 防止意外编辑代码文件
- **可选代码编辑** — 通过临时 Markdown 文件原地编辑代码，提供保存和查看控件
- **声明式设置** — 使用 Obsidian 1.13+ 设置 API，支持原生搜索和一致性
- **多语言界面** — 支持 English、中文、Русский

## 使用方法

1. 安装并启用插件
2. 在文件浏览器中点击任意支持的文件（如 `.py`、`.ts`、`.sh`）
3. 文件将以只读代码视图打开，并带有语法高亮
4. 点击右上角**编辑按钮**创建临时 `.md` 文件进行编辑
5. 使用编辑器中的**保存**和**查看**按钮将更改同步回源文件

可通过 **设置 → Code Viewer** 自定义处理的扩展名列表。

## 设置

| 设置项 | 默认值 | 说明 |
|---------|---------|------|
| **File extensions** | 50+ 种扩展名 | 以逗号分隔的扩展名列表，这些文件将使用 Code Viewer 打开 |
| **Show line numbers** | 开启 | 切换行号栏显示 |
| **Enable code editing** | 开启 | 显示编辑按钮，支持内联代码编辑 |
| **Edit open mode** | 当前标签页 | 编辑器打开方式：当前标签页或新标签页 |

> **系统要求：** Obsidian 1.13.0 或更高版本。
>
> **注意：** 修改扩展名列表后需要重载 Obsidian（Ctrl+R）才能生效。

## 支持的语言

Python、PowerShell、Bash、TypeScript、TSX、JavaScript、JSX、C#、C、C++、SQL、YAML、TOML、Rust、Go、Lua、GDScript、Batch、Ruby、PHP、Perl、R、Dart、Kotlin、Swift、Vue、Svelte、INI、Dockerfile、Makefile、CMake、XML、HTML、CSS、SCSS、Less、JSON、JSON5、HCL、Protobuf、GraphQL 等。

## 安装

### 从 Obsidian 社区插件安装

1. 打开 **设置 → 第三方插件**
2. 关闭**安全模式**
3. 点击**浏览**，搜索 "Code Viewer"
4. 安装并启用

### 手动安装

```bash
cd /path/to/vault/.obsidian/plugins
git clone https://github.com/TracingOrigins/obsidian-code-viewer-plugin.git code-viewer
cd code-viewer
npm install && npm run build
```

然后在 **设置 → 第三方插件** 中启用该插件。

## 开发

1. 将 `.env.example` 复制为 `.env`，并设置 `VAULT_PATH` 为你的 Obsidian Vault 路径：
   ```
   VAULT_PATH=C:/Users/YourName/Documents/MyVault
   ```
2. 安装依赖并开始开发：

```bash
npm install        # 安装依赖
npm run dev        # 监听模式（自动部署到 Vault）
npm run build      # 生产构建（自动部署到 Vault）
npm run lint       # 运行 eslint
```
