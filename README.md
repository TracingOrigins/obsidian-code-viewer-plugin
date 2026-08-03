<div align="center">
    <h1>Code Viewer</h1>
    <p>
        <img src="https://img.shields.io/badge/dynamic/json?logo=obsidian&color=%23483699&label=downloads&query=%24%5B%22code-viewer%22%5D.downloads&url=https%3A%2F%2Fraw.githubusercontent.com%2Fobsidianmd%2Fobsidian-releases%2Fmaster%2Fcommunity-plugin-stats.json" alt="Obsidian Downloads">
        <img src="https://img.shields.io/github/downloads/TracingOrigins/obsidian-code-viewer-plugin/total?logo=github" alt="GitHub Downloads">
    </p>
    <p>[<a href="https://github.com/TracingOrigins/obsidian-code-viewer-plugin/blob/master/README.zh.md">中文</a> | English | <a href="https://github.com/TracingOrigins/obsidian-code-viewer-plugin/blob/master/README.ru.md">Русский</a>]</p>
</div>

Code Viewer is an Obsidian plugin for **viewing and editing** code files. Click any supported file to open it with native syntax highlighting, or use the inline editor to make quick changes — no external dependencies.

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
| **File extensions** | 50+ extensions | Comma-separated list of extensions to open with Code Viewer |
| **Show line numbers** | On | Toggle line number gutter |
| **Enable code editing** | On | Show edit button for inline source editing |
| **Edit open mode** | Current tab | Where to open the editor: current tab or new tab |

> **Requirements:** Obsidian 1.13.0 or later.
>
> **Note:** Changing the extension list requires an Obsidian reload (Ctrl+R) to take effect.

## Supported Languages

Python, PowerShell, Bash, TypeScript, TSX, JavaScript, JSX, C#, C, C++, SQL, YAML, TOML, Rust, Go, Lua, GDScript, Batch, Ruby, PHP, Perl, R, Dart, Kotlin, Swift, Vue, Svelte, INI, Dockerfile, Makefile, CMake, XML, HTML, CSS, SCSS, Less, JSON, JSON5, HCL, Protobuf, GraphQL, and more.

## Installation

### From Obsidian Community Plugins

1. Open **Settings → Community plugins**
2. Disable **Safe mode**
3. Click **Browse** and search for "Code Viewer"
4. Install and enable

### Manual

```bash
cd /path/to/vault/.obsidian/plugins
git clone https://github.com/TracingOrigins/obsidian-code-viewer-plugin.git code-viewer
cd code-viewer
npm install && npm run build
```

Then enable the plugin in **Settings → Community plugins**.

## Development

1. Copy `.env.example` to `.env` and set `VAULT_PATH` to your Obsidian vault path:
   ```
   VAULT_PATH=C:/Users/YourName/Documents/MyVault
   ```
2. Install dependencies and start developing:

```bash
npm install        # install dependencies
npm run dev        # watch mode (auto-deploys to vault)
npm run build      # production build (auto-deploys to vault)
npm run lint       # run eslint
```
