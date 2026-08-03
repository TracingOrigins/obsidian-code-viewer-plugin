import { App, Plugin, PluginSettingTab } from "obsidian";
import { t } from "../utils/i18n";

// ============================================================
// Settings
// ============================================================

export type EditOpenMode = "current" | "new";

export interface CodeViewerSettings {
  extensions: string;
  showLineNumbers: boolean;
  enableEdit: boolean;
  editOpenMode: EditOpenMode;
}

export const DEFAULT_SETTINGS: CodeViewerSettings = {
  extensions:
    "py,ps1,psm1,sh,bash,zsh,fish,ts,tsx,js,jsx,mjs,cjs,cs,cpp,cc,c,h,hpp,sql,yml,yaml,toml,rs,go,lua,gd,gdshader,bat,cmd,rb,php,pl,r,dart,kt,swift,vue,svelte,ini,conf,env,xml,html,css,scss,less,json5,jsonc,tf,tfvars,hcl,proto,graphql,gql",
  showLineNumbers: true,
  enableEdit: true,
  editOpenMode: "current",
};

export const VIEW_TYPE_CODE = "code-viewer";

// ============================================================
// Settings Tab
// ============================================================

export class CodeViewerSettingTab extends PluginSettingTab {
  plugin: Plugin & {
    settings: CodeViewerSettings;
    saveSettings: () => Promise<void>;
    notifyReloadRequired: () => void;
  };

  constructor(
    app: App,
    plugin: Plugin & {
      settings: CodeViewerSettings;
      saveSettings: () => Promise<void>;
      notifyReloadRequired: () => void;
    },
  ) {
    super(app, plugin);
    this.plugin = plugin;
  }

  getSettingDefinitions() {
    return [
      {
        key: "extensions",
        name: t("file_extensions"),
        desc: t("file_extensions_desc"),
        control: {
          type: "textarea" as const,
          key: "extensions",
          defaultValue: DEFAULT_SETTINGS.extensions,
        },
      },
      {
        key: "showLineNumbers",
        name: t("show_line_numbers"),
        desc: t("show_line_numbers_desc"),
        control: {
          type: "toggle" as const,
          key: "showLineNumbers",
          defaultValue: true,
        },
      },
      {
        type: "group" as const,
        heading: t("advanced"),
        items: [
          {
            key: "enableEdit",
            name: t("enable_edit"),
            desc: t("enable_edit_desc"),
            control: {
              type: "toggle" as const,
              key: "enableEdit",
              defaultValue: true,
            },
          },
          {
            key: "editOpenMode",
            name: t("edit_open_mode"),
            desc: t("edit_open_mode_desc"),
            control: {
              type: "dropdown" as const,
              key: "editOpenMode",
              defaultValue: "split",
              options: {
                current: t("edit_mode_current"),
                new: t("edit_mode_new"),
              },
            },
          },
        ],
      },
    ];
  }

  getControlValue(key: string): unknown {
    return (this.plugin.settings as unknown as Record<string, unknown>)[key];
  }

  async setControlValue(key: string, value: unknown): Promise<void> {
    (this.plugin.settings as unknown as Record<string, unknown>)[key] = value;
    await this.plugin.saveSettings();
    if (key === "extensions") {
      this.plugin.notifyReloadRequired();
    }
  }
}
