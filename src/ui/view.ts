import {
  TextFileView,
  WorkspaceLeaf,
  MarkdownRenderer,
  setIcon,
} from "obsidian";
import { t } from "../utils/i18n";
import { VIEW_TYPE_CODE } from "../settings/settings";
import { languageFor } from "../utils/lang";
import type CodeViewerPlugin from "../main";
import { EditController } from "./edit";

// CodeView：以只读方式渲染代码文件（自建行号 + Markdown 代码块高亮）。
// 继承自 TextFileView，由插件按扩展名白名单接管打开。
export class CodeView extends TextFileView {
  private codeRoot: HTMLElement | null = null;
  private editBtn: HTMLElement | null = null;
  private plugin: CodeViewerPlugin;
  private editor: EditController;

  constructor(leaf: WorkspaceLeaf, plugin: CodeViewerPlugin) {
    super(leaf);
    this.plugin = plugin;
    this.editor = new EditController(this, plugin);
    this.plugin.registerCodeView(this);
  }

  getViewType(): string {
    return VIEW_TYPE_CODE;
  }

  // 设置变更等外部触发时调用：重建编辑按钮并重新渲染内容
  refresh(): void {
    this.renderEditButton();
    void this.render();
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

  // Obsidian 加载文件内容时回调；_clear 由基类传入但本视图无需特殊处理
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

    this.renderEditButton();

    this.codeRoot = this.contentEl.createDiv({
      cls: "code-viewer-container",
    });
    return Promise.resolve();
  }

  // 依据 enableEdit 设置创建或移除编辑按钮；
  // 先清掉旧按钮再按需重建，保证设置变更后能即时增删
  private renderEditButton(): void {
    if (this.editBtn) {
      this.editBtn.remove();
      this.editBtn = null;
    }
    if (this.plugin.settings.enableEdit) {
      this.editBtn = this.contentEl.createEl("button", {
        cls: "code-viewer-edit-btn clickable-icon",
        attr: { "aria-label": t("edit") },
      });
      setIcon(this.editBtn, "edit");
      this.editBtn.addEventListener("click", () => void this.editor.startEditing());
    }
  }

  async onClose(): Promise<void> {
    this.plugin.unregisterCodeView(this);
    // 若是因为进入临时编辑而关闭（switchingToEdit），不清理临时文件，
    // 交由编辑会话结束时的 cleanupTempFile 处理，避免误删未保存内容
    if (!this.editor.switchingToEdit) {
      await this.editor.cleanupTempFile();
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
      const gutterEl = wrap.createDiv({ cls: "code-viewer-gutter" });
      // 行号列宽按总行数的位数取齐（如 99 行宽 2、100 行宽 3），
      // 用 padStart 右对齐，保证换行后宽度一致
      const width = String(lines.length).length;
      for (let i = 1; i <= lines.length; i++) {
        gutterEl.createDiv({
          text: String(i).padStart(width, " "),
        });
      }
    }

    const codeBlockEl = wrap.createDiv({ cls: "code-viewer-code-block" });
    // 用 fence 包裹源码交给 MarkdownRenderer 做语法高亮；
    // 无对应语言时退化为无高亮代码块
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
}
