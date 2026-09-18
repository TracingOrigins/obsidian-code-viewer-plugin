<div align="center">
    <h1>Code Viewer</h1>
    <p>
        <img src="https://img.shields.io/badge/dynamic/json?logo=obsidian&color=%23483699&label=downloads&query=%24%5B%22code-viewer%22%5D.downloads&url=https%3A%2F%2Fraw.githubusercontent.com%2Fobsidianmd%2Fobsidian-releases%2Fmaster%2Fcommunity-plugin-stats.json" alt="Obsidian Downloads">
        <img src="https://img.shields.io/github/downloads/TracingOrigins/obsidian-code-viewer-plugin/total?logo=github" alt="GitHub Downloads">
    </p>
    <p>[<a href="https://github.com/TracingOrigins/obsidian-code-viewer-plugin/blob/master/README.zh.md">中文</a> | English | <a href="https://github.com/TracingOrigins/obsidian-code-viewer-plugin/blob/master/README.ru.md">Русский</a>]</p>
    <p><a href="https://community.obsidian.md/account/plugins/code-viewer" target="_blank">Code Viewer</a> is an Obsidian plugin for viewing and editing code files. Click any supported file to open it with native syntax highlighting, or use the inline editor to make quick changes — no external dependencies.</p>
</div>

## Features

- **Native syntax highlighting** — uses Obsidian's built-in `MarkdownRenderer`, so colors always match your current theme
- **Automatic extension registration** — `.py`, `.ts`, `.js`, `.sh`, `.rs`, `.go`, and 50+ more extensions open directly in Code Viewer
- **Line numbers** — optional gutter with configurable line numbers
- **Zero dependencies** — no external libraries at runtime, only Obsidian APIs
- **Read-only by design** — prevents accidental edits to source files
- **Optional code editing** — edit source files in-place via a temporary markdown file, with save and view controls
- **Declarative settings** — uses Obsidian 1.13+ settings API for native search and consistency
- **Multi-language UI** — English, 中文, Русский support

## Usage

1. Install and enable the plugin
2. Click any supported file (`.py`, `.ts`, `.sh`, etc.) in the file explorer
3. The file opens in a read-only Code View with syntax highlighting
4. Click the **edit button** (top-right) to create a temporary `.md` file for editing
5. Use **Save** and **View** buttons in the editor to sync changes back

You can customize which extensions are handled via **Settings → Code Viewer**.

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| **File extensions** | 50+ extensions | Comma-separated list of file extensions to open with Code Viewer |
| **Show line numbers** | On | Toggle the line number gutter |
| **Enable code editing** | On | Show the edit button for inline source editing |
| **Edit open mode** | Current tab | Where the editor opens: current tab or a new tab |

> **Requirements:** Obsidian 1.13.0 or later.
>
> **Note:** Changing the extension list requires reloading Obsidian (Ctrl+R) to take effect.

## Supported Languages

Python, PowerShell, Bash, TypeScript, TSX, JavaScript, JSX, C#, C, C++, SQL, YAML, TOML, Rust, Go, Lua, GDScript, Batch, Ruby, PHP, Perl, R, Dart, Kotlin, Swift, Vue, Svelte, INI, XML, HTML, CSS, SCSS, Less, JSON, JSON5, HCL, Protobuf, GraphQL, and more.

## Installation

### From the Official Community Plugin Market (Recommended)

1. Open Obsidian and go to **Settings → Community plugins**
2. Turn off **Safe mode**
3. Click **Browse** and search for "Code Viewer"
4. Click **Install**, then **Enable**

### Manual Installation

1. Download the latest `main.js`, `manifest.json` and `styles.css` from [Releases](https://github.com/TracingOrigins/obsidian-code-viewer-plugin/releases)
2. Create a `code-viewer` folder in your vault's plugin directory (e.g. `YourVault/.obsidian/plugins/code-viewer/`) and place the three files inside
3. Enable the plugin in **Settings → Community plugins**

### Install via BRAT (Recommended for Testers)

1. Install the [BRAT](https://github.com/TfTHacker/obsidian42-brat) plugin
2. Open BRAT settings and click **Add Beta plugin**
3. Enter `TracingOrigins/obsidian-code-viewer-plugin`
4. Enable the plugin

## Development Guide

1. Clone the repository:

    ```bash
    git clone https://github.com/TracingOrigins/obsidian-code-viewer-plugin.git
    cd obsidian-code-viewer-plugin
    ```

2. Copy `.env.example` to `.env` and set `VAULT_PATH` to your Obsidian vault path:

    ```
    VAULT_PATH=C:/Users/YourName/Documents/MyVault
    ```

3. Install dependencies and start developing:

    ```bash
    npm install          # install dependencies
    npm run dev          # watch mode (auto-deploys to vault)
    npm run build        # production build (auto-deploys to vault)
    npm run lint         # run eslint
    ```

## Support & Feedback

If this plugin helps you, please consider:

- ⭐ **Star the repository**
- 🐛 Report bugs using the [bug report template](https://github.com/TracingOrigins/obsidian-code-viewer-plugin/issues/new?template=bug_report.md)
- 💡 Request features using the [feature request template](https://github.com/TracingOrigins/obsidian-code-viewer-plugin/issues/new?template=feature_request.md)
- ❓ Ask questions or share ideas in [GitHub Issues](https://github.com/TracingOrigins/obsidian-code-viewer-plugin/issues)
- 📝 Read the [contributing guide](https://github.com/TracingOrigins/obsidian-code-viewer-plugin/blob/master/docs/contributing/contributing.md) and contribute code or docs
- 💰 Donate to the developer at the [support page](https://support.tracingorigins.top/) (if available)
