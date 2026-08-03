import {
  TextFileView,
  WorkspaceLeaf,
  Notice,
  MarkdownRenderer,
  MarkdownView,
  TFile,
  setIcon,
} from "obsidian";
import { t } from "../utils/i18n";
import { VIEW_TYPE_CODE, EditOpenMode } from "../settings/settings";
import { languageFor } from "../utils/lang";
import type CodeViewerPlugin from "../main";

// ============================================================
// CodeView — TextFileView
// ============================================================

export class CodeView extends TextFileView {
  private codeRoot: HTMLElement | null = null;
  private gutterEl: HTMLElement | null = null;
  private editBtn: HTMLElement | null = null;
  private plugin: CodeViewerPlugin;
  private tempFile: TFile | null = null;
  private switchingToEdit = false;

  constructor(leaf: WorkspaceLeaf, plugin: CodeViewerPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType(): string {
    return VIEW_TYPE_CODE;
  }

  getDisplayText(): string {
    return this.file?.basename ?? "Code";
  }

  getIcon(): string {
    return "file-code-2";
  }

  getViewData(): string {
    return this.data;
  }

  setViewData(data: string, _clear: boolean): void {
    this.data = data;
    void this.render();
  }

  clear(): void {
    this.data = "";
    if (this.codeRoot) this.codeRoot.empty();
  }

  onOpen(): Promise<void> {
    this.contentEl.empty();
    this.contentEl.addClass("code-viewer-host");

    if (this.plugin.settings.enableEdit) {
      this.editBtn = this.contentEl.createEl("button", {
        cls: "code-viewer-edit-btn clickable-icon",
        attr: { "aria-label": t("edit") },
      });
      setIcon(this.editBtn, "edit");
      this.editBtn.addEventListener("click", () => void this.startEditing());
    }

    this.codeRoot = this.contentEl.createDiv({
      cls: "code-viewer-container",
    });
    return Promise.resolve();
  }

  async onClose(): Promise<void> {
    if (!this.switchingToEdit) {
      await this.cleanupTempFile();
    }
  }

  private async render(): Promise<void> {
    if (!this.codeRoot) return;
    this.codeRoot.empty();

    const ext = this.file?.extension ?? "txt";
    const lang = languageFor(ext);

    const wrap = this.codeRoot.createDiv({ cls: "code-viewer-wrap" });
    const lines = this.data.split("\n");

    if (this.plugin.settings.showLineNumbers) {
      this.gutterEl = wrap.createDiv({ cls: "code-viewer-gutter" });
      const width = String(lines.length).length;
      for (let i = 1; i <= lines.length; i++) {
        this.gutterEl.createDiv({
          text: String(i).padStart(width, " "),
        });
      }
    }

    const codeBlockEl = wrap.createDiv({ cls: "code-viewer-code-block" });
    const fence = lang
      ? `\`\`\`${lang}\n${this.data}\n\`\`\``
      : `\`\`\`\n${this.data}\n\`\`\``;

    await MarkdownRenderer.render(
      this.app,
      fence,
      codeBlockEl,
      this.file?.path ?? "",
      this,
    );
  }

  // ============================================================
  // Edit mode
  // ============================================================

  private async startEditing(): Promise<void> {
    if (!this.file) return;
    const sourceFile = this.file;

    if (this.tempFile) {
      const isCurrent = this.plugin.settings.editOpenMode === "current";
      const leaf = isCurrent ? this.leaf : this.getEditLeaf();
      await leaf.openFile(this.tempFile, { state: { mode: "source" } });
      this.addReturnButton(leaf, sourceFile);
      return;
    }

    const ext = this.file.extension;
    const lang = languageFor(ext);
    const dir = this.file.parent?.path ?? "";
    const tempName = `${this.file.basename}.${ext}.md`;
    const tempPath = dir ? `${dir}/${tempName}` : tempName;

    const existing = this.app.vault.getAbstractFileByPath(tempPath);
    if (existing instanceof TFile) {
      this.tempFile = null;
      await this.app.fileManager.trashFile(existing);
    }

    const mdContent = `\`\`\`${lang || ""}\n${this.data}\n\`\`\`\n`;
    this.tempFile = await this.app.vault.create(tempPath, mdContent);

    const mode = this.plugin.settings.editOpenMode;

    // 监听临时文件修改 → 同步到源文件
    const modifyRef = this.app.vault.on("modify", async (file) => {
      if (file !== this.tempFile) return;
      const newContent = await this.app.vault.read(this.tempFile);
      const code = this.extractCodeFromMarkdown(newContent);
      if (code !== null) {
        const currentSource = await this.app.vault.read(sourceFile);
        if (code !== currentSource) {
          await this.app.vault.modify(sourceFile, code);
        }
      }
    });
    this.plugin.registerEvent(modifyRef);

    // 监听源文件外部修改 → 更新临时文件
    const sourceRef = this.app.vault.on("modify", async (file) => {
      if (file !== sourceFile || !this.tempFile) return;
      const sourceContent = await this.app.vault.read(sourceFile);
      const tempContent = await this.app.vault.read(this.tempFile);
      const currentCode = this.extractCodeFromMarkdown(tempContent);
      if (currentCode !== null && currentCode !== sourceContent) {
        const lang = languageFor(ext);
        const updated = `\`\`\`${lang || ""}\n${sourceContent}\n\`\`\`\n`;
        await this.app.vault.modify(this.tempFile, updated);
      }
    });
    this.plugin.registerEvent(sourceRef);

    const isCurrent = mode === "current";
    if (isCurrent) this.switchingToEdit = true;
    const leaf = isCurrent ? this.leaf : this.getEditLeaf();
    await leaf.openFile(this.tempFile, { state: { mode: "source" } });

    this.addReturnButton(leaf, sourceFile);

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

  private getEditLeaf(): WorkspaceLeaf {
    const m: EditOpenMode = this.plugin.settings.editOpenMode;
    if (m === "new") return this.app.workspace.getLeaf("tab");
    return this.leaf;
  }

  private addReturnButton(leaf: WorkspaceLeaf, _sourceFile: TFile): void {
    const view = leaf.view;
    if (!(view instanceof MarkdownView)) return;

    window.setTimeout(() => {
      const sizer = view.contentEl.querySelector(".cm-sizer");
      if (!(sizer instanceof HTMLElement)) return;

      // 隐藏代码块首尾标记对应的 gutter 行号
      const gutter = view.contentEl.querySelector(".cm-gutter.cm-lineNumbers");
      if (gutter) {
        const children = gutter.children;
        if (children.length > 0) children[0].addClass("code-viewer-gutter-hidden");
        if (children.length > 1) children[children.length - 1].addClass("code-viewer-gutter-hidden");
      }

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

  private async syncFromTemp(): Promise<void> {
    if (!this.tempFile || !this.file) return;
    const content = await this.app.vault.read(this.tempFile);
    const code = this.extractCodeFromMarkdown(content);
    if (code !== null) {
      await this.app.vault.modify(this.file, code);
      new Notice(t("saved"));
    }
  }

  private extractCodeFromMarkdown(md: string): string | null {
    const match = md.match(/```[\w-]*\n([\s\S]*?)\n```/);
    return match?.[1] ?? null;
  }

  private async cleanupTempFile(): Promise<void> {
    if (!this.tempFile) return;
    const sourceFile = this.file;
    try {
      if (sourceFile) {
        const content = await this.app.vault.read(this.tempFile);
        const code = this.extractCodeFromMarkdown(content);
        if (code !== null && code !== this.data) {
          await this.app.vault.modify(sourceFile, code);
        }
      }
      await this.app.fileManager.trashFile(this.tempFile);
    } catch {
      // ignore
    }
    this.tempFile = null;
  }
}
