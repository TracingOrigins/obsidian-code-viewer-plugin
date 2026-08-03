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

  async onload(): Promise<void> {
    await this.loadSettings();

    this.registerView(VIEW_TYPE_CODE, (leaf) => new CodeView(leaf, this));
    this.registerExtensionsSafe(parseExtensions(this.settings.extensions));
    this.addSettingTab(new CodeViewerSettingTab(this.app, this));
  }

  async loadSettings(): Promise<void> {
    const loaded =
      (await this.loadData()) as Partial<CodeViewerSettings> | null;
    this.settings = { ...DEFAULT_SETTINGS, ...(loaded ?? {}) };
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

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

  notifyReloadRequired(): void {
    new Notice(t("reload_notice"), 5000);
  }
}
