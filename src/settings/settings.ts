import { App, Plugin, PluginSettingTab, SettingDefinitionItem } from "obsidian";
import { t } from "../utils/i18n";

// 编辑入口模式：在当前 leaf 内切换，或新开一个 tab
export type EditOpenMode = "current" | "new";

export interface CodeViewerSettings {
  // 以逗号分隔的扩展名白名单，决定哪些文件用本插件视图打开
  extensions: string;
  // 是否在代码左侧渲染自建行号
  showLineNumbers: boolean;
  // 是否显示"编辑"按钮（临时文件双向同步编辑）
  enableEdit: boolean;
  // 点击编辑后以何种方式打开临时文件
  editOpenMode: EditOpenMode;
}

export const DEFAULT_SETTINGS: CodeViewerSettings = {
  extensions:
    "py,ps1,psm1,sh,bash,zsh,fish,ts,tsx,js,jsx,mjs,cjs,cs,cpp,cc,c,h,hpp,sql,yml,yaml,toml,rs,go,lua,gd,gdshader,bat,cmd,rb,php,pl,r,dart,kt,swift,vue,svelte,ini,conf,env,xml,html,css,scss,less,json5,jsonc,tf,tfvars,hcl,proto,graphql,gql",
  showLineNumbers: true,
  enableEdit: true,
  editOpenMode: "current",
};

// 本插件视图的唯一类型标识，注册视图与扩展名时共用
export const VIEW_TYPE_CODE = "code-viewer";

// 设置面板所需的插件能力接口（结构化子集），用 Like 后缀表示：
// 只要对象具备这些成员即可，避免与 main.ts 形成循环依赖时重复声明整套类型
interface CodeViewerPluginLike extends Plugin {
  settings: CodeViewerSettings;
  saveSettings: () => Promise<void>;
  notifyReloadRequired: () => void;
  refreshCodeViews: () => void;
}

export class CodeViewerSettingTab extends PluginSettingTab {
  plugin: CodeViewerPluginLike;
  icon: string = "file-code-2";

  constructor(app: App, plugin: CodeViewerPluginLike) {
    super(app, plugin);
    this.plugin = plugin;
  }

  // 用 Obsidian 原生设置定义描述界面，文案走 i18n
  getSettingDefinitions(): SettingDefinitionItem<string>[] {
    return [
      {
        name: t("file_extensions"),
        desc: t("file_extensions_desc"),
        control: {
          type: "textarea" as const,
          key: "extensions",
          defaultValue: DEFAULT_SETTINGS.extensions,
        },
      },
      {
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
            name: t("enable_edit"),
            desc: t("enable_edit_desc"),
            control: {
              type: "toggle" as const,
              key: "enableEdit",
              defaultValue: true,
            },
          },
          {
            name: t("edit_open_mode"),
            desc: t("edit_open_mode_desc"),
            control: {
              type: "dropdown" as const,
              key: "editOpenMode",
              defaultValue: "current",
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

  getControlValue(key: keyof CodeViewerSettings): unknown {
    return this.plugin.settings[key];
  }

  // 写入单个设置项并落盘；随后按字段触发副作用：
  // - extensions 变更需重载才能生效，提示用户
  // - showLineNumbers / enableEdit 变更需即时刷新已打开的 CodeView
  async setControlValue(
    key: keyof CodeViewerSettings,
    value: CodeViewerSettings[keyof CodeViewerSettings],
  ): Promise<void> {
    (this.plugin.settings[key] as unknown) = value;
    await this.plugin.saveSettings();
    if (key === "extensions") {
      this.plugin.notifyReloadRequired();
    }
    if (key === "showLineNumbers" || key === "enableEdit") {
      this.plugin.refreshCodeViews();
    }
  }
}
