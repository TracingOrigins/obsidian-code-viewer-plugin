import { WorkspaceLeaf, MarkdownView, TFile, setIcon, Notice } from "obsidian";
import { t } from "../utils/i18n";
import { languageFor } from "../utils/lang";
import type CodeViewerPlugin from "../main";
import type { CodeView } from "./view";

// EditController：管理"临时编辑"会话。
// 思路是把源码包进一层 fence 写入同名 .md 临时文件，用 Obsidian 原生
// Markdown 编辑器打开，并双向同步临时文件与源文件。与 CodeView 解耦，
// 仅通过 view 的公开成员（file/leaf/data）获取上下文。
export class EditController {
  // 当前编辑会话对应的临时文件；为 null 表示没有进行中的编辑
  tempFile: TFile | null = null;
  // 标记本次关闭是否因进入临时编辑所致，避免 onClose 误删临时文件
  switchingToEdit = false;

  constructor(
    private view: CodeView,
    private plugin: CodeViewerPlugin,
  ) {}

  get app() {
    return this.plugin.app;
  }

  // 入口：若已有临时文件则直接重开；否则先创建临时文件、注册双向同步、
  // 打开编辑页并挂上返回/保存栏
  async startEditing(): Promise<void> {
    const sourceFile = this.view.file;
    if (!sourceFile) return;

    // 已有会话：直接复用临时文件重开，无需重建同步监听
    if (this.tempFile) {
      const isCurrent = this.plugin.settings.editOpenMode === "current";
      const leaf = isCurrent ? this.view.leaf : this.getEditLeaf();
      await leaf.openFile(this.tempFile, { state: { mode: "source" } });
      this.addReturnButton(leaf, sourceFile);
      return;
    }

    const ext = sourceFile.extension;
    const lang = languageFor(ext);
    const dir = sourceFile.parent?.path ?? "";
    const tempName = `${sourceFile.basename}.${ext}.md`;
    const tempPath = dir ? `${dir}/${tempName}` : tempName;

    // 同名临时文件残留则先丢进回收站，保证从最新源码重建
    const existing = this.app.vault.getAbstractFileByPath(tempPath);
    if (existing instanceof TFile) {
      this.tempFile = null;
      await this.app.fileManager.trashFile(existing);
    }

    const mdContent = this.wrapSingleFence(this.view.data, lang);
    this.tempFile = await this.app.vault.create(tempPath, mdContent);

    const mode = this.plugin.settings.editOpenMode;

    // 单个监听器处理双向同步：
    // - 临时文件被改 → 提取代码写回源文件（无 fence 时补一层）
    // - 源文件被改 → 更新临时文件（始终包一层）
    const modifyRef = this.app.vault.on("modify", async (file) => {
      if (!this.tempFile) return;

      if (file === this.tempFile) {
        const newContent = await this.app.vault.read(this.tempFile);
        let code = this.extractCodeFromMarkdown(newContent);
        if (code === null) {
          // 没有 fence 包裹：整段当作代码，补一层回去
          await this.app.vault.modify(
            this.tempFile,
            this.wrapSingleFence(newContent, lang),
          );
          code = newContent;
        }
        const currentSource = await this.app.vault.read(sourceFile);
        if (code !== currentSource) {
          await this.app.vault.modify(sourceFile, code);
        }
        return;
      }

      if (file === sourceFile) {
        const sourceContent = await this.app.vault.read(sourceFile);
        const tempContent = await this.app.vault.read(this.tempFile);
        const currentCode = this.extractCodeFromMarkdown(tempContent);
        if (currentCode !== null && currentCode !== sourceContent) {
          await this.app.vault.modify(
            this.tempFile,
            this.wrapSingleFence(sourceContent, lang),
          );
        }
      }
    });
    this.plugin.registerEvent(modifyRef);

    const isCurrent = mode === "current";
    // current 模式会复用同一 leaf，使 CodeView 关闭，故置位标记以免误清理
    if (isCurrent) this.switchingToEdit = true;
    const leaf = isCurrent ? this.view.leaf : this.getEditLeaf();
    await leaf.openFile(this.tempFile, { state: { mode: "source" } });

    this.addReturnButton(leaf, sourceFile);

    // 监听布局变化：临时文件被关掉（用户直接关 leaf）时自动收尾清理
    const layoutRef = this.app.workspace.on("layout-change", () => {
      if (!this.tempFile) return;
      const leaves = this.app.workspace.getLeavesOfType("markdown");
      const stillOpen = leaves.some(
        (l) => (l.view as { file?: TFile }).file === this.tempFile,
      );
      if (!stillOpen) {
        void this.cleanupTempFile();
      }
    });
    this.plugin.registerEvent(layoutRef);
  }

  // 按编辑模式选择承载临时文件的 leaf：new 开新 tab，current 复用当前 leaf
  private getEditLeaf(): WorkspaceLeaf {
    return this.plugin.settings.editOpenMode === "new"
      ? this.app.workspace.getLeaf("tab")
      : this.view.leaf;
  }

  // 在编辑页顶部注入"保存/返回"工具条。
  // _sourceFile 当前未使用，保留以表明此处处于某源文件的编辑上下文；
  // setTimeout 等待 CodeMirror 完成挂载后再插入按钮
  private addReturnButton(leaf: WorkspaceLeaf, _sourceFile: TFile): void {
    const view = leaf.view;
    if (!(view instanceof MarkdownView)) return;

    window.setTimeout(() => {
      const sizer = view.contentEl.querySelector(".cm-sizer");
      if (!(sizer instanceof HTMLElement)) return;

      const bar = sizer.createDiv({ cls: "code-viewer-editor-bar" });

      const saveBtn = bar.createEl("button", {
        cls: "code-viewer-editor-btn clickable-icon",
        attr: { "aria-label": t("save") },
      });
      setIcon(saveBtn, "save");
      saveBtn.addEventListener("click", () => void this.syncFromTemp());

      const viewBtn = bar.createEl("button", {
        cls: "code-viewer-editor-btn clickable-icon",
        attr: { "aria-label": t("view") },
      });
      setIcon(viewBtn, "view");
      viewBtn.addEventListener("click", () => void this.cleanupTempFile());
    }, 50);
  }

  // 手动保存：把临时文件里的代码（去掉 fence）写回源文件
  async syncFromTemp(): Promise<void> {
    if (!this.tempFile || !this.view.file) return;
    const content = await this.app.vault.read(this.tempFile);
    let code = this.extractCodeFromMarkdown(content);
    if (code === null) {
      // 没有 fence 包裹：补一层，整段当作代码写回
      await this.app.vault.modify(
        this.tempFile,
        this.wrapSingleFence(content, languageFor(this.view.file.extension)),
      );
      code = content;
    }
    await this.app.vault.modify(this.view.file, code);
    new Notice(t("saved"));
  }

  // 从 markdown 中提取首个 fence 内的代码；无 fence 返回 null
  private extractCodeFromMarkdown(md: string): string | null {
    const match = md.match(/```[\w-]*\n([\s\S]*?)\n```/);
    return match?.[1] ?? null;
  }

  // 把代码包成一层 fence：去掉尾随换行，避免与闭合 ``` 间出现空行
  private wrapSingleFence(code: string, lang: string): string {
    const body = code.replace(/\n+$/, "");
    return `\`\`\`${lang || ""}\n${body}\n\`\`\``;
  }

  // 结束编辑：把临时文件内容（去掉 fence，失败则取整段）最后一次写回源文件，
  // 然后把临时文件丢进回收站；异常静默忽略，避免阻断卸载
  async cleanupTempFile(): Promise<void> {
    if (!this.tempFile) return;
    const sourceFile = this.view.file;
    try {
      if (sourceFile) {
        const content = await this.app.vault.read(this.tempFile);
        const code = this.extractCodeFromMarkdown(content) ?? content;
        if (code !== this.view.data) {
          await this.app.vault.modify(sourceFile, code);
        }
      }
      await this.app.fileManager.trashFile(this.tempFile);
    } catch {
      // 临时文件可能已不存在或已移动到回收站，忽略
    }
    this.tempFile = null;
  }
}
