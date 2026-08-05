import { Plugin, Notice } from "obsidian";
import { t } from "./utils/i18n";
import {
  CodeViewerSettings,
  DEFAULT_SETTINGS,
  VIEW_TYPE_CODE,
  CodeViewerSettingTab,
} from "./settings/settings";
import { parseExtensions } from "./utils/lang";
import { CodeView } from "./ui/view";

// ============================================================
// Plugin
// ============================================================

export default class CodeViewerPlugin extends Plugin {
  settings: CodeViewerSettings = DEFAULT_SETTINGS;
  // 已打开的 CodeView 实例集合。
  // 不依赖 leaf 的当前视图类型：current 编辑模式下，临时编辑会把同一
  // leaf 切换成 MarkdownView，导致按 leaf 类型找不到原 CodeView，故用
  // 实例集合来稳定追踪，供设置变更时统一刷新。
  private codeViews = new Set<CodeView>();

  async onload(): Promise<void> {
    await this.loadSettings();

    this.registerView(VIEW_TYPE_CODE, (leaf) => new CodeView(leaf, this));
    this.registerExtensionsSafe(parseExtensions(this.settings.extensions));
    this.addSettingTab(new CodeViewerSettingTab(this.app, this));
  }

  // CodeView 在构造/析构时登记/注销自己
  registerCodeView(view: CodeView): void {
    this.codeViews.add(view);
  }

  unregisterCodeView(view: CodeView): void {
    this.codeViews.delete(view);
  }

  // 合并磁盘数据与默认值为最终设置；缺字段时使用默认值
  async loadSettings(): Promise<void> {
    const loaded =
      (await this.loadData()) as Partial<CodeViewerSettings> | null;
    this.settings = { ...DEFAULT_SETTINGS, ...(loaded ?? {}) };
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  // 逐个注册扩展名；单个失败（如与已有视图冲突）不阻断其余，仅告警
  registerExtensionsSafe(exts: string[]): void {
    const failed: string[] = [];
    for (const ext of exts) {
      try {
        this.registerExtensions([ext], VIEW_TYPE_CODE);
      } catch {
        failed.push(ext);
      }
    }
    if (failed.length) {
      console.warn(
        `[code-viewer] could not register: ${failed.join(", ")}`,
      );
    }
  }

  // 扩展名等需重启才能生效的变更，提示用户重载
  notifyReloadRequired(): void {
    new Notice(t("reload_notice"), 5000);
  }

  // 设置变更后，让所有打开的 CodeView 重新渲染（例如行号开关、编辑按钮）
  refreshCodeViews(): void {
    for (const view of this.codeViews) {
      view.refresh();
    }
  }
}
