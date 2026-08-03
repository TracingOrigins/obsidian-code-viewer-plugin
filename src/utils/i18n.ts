// i18n.ts — 多语言国际化工具函数
import zhRaw from "../locales/zh.json";
import enRaw from "../locales/en.json";
import ruRaw from "../locales/ru.json";
import { getLanguage } from "obsidian";

function asLocale<T extends Record<string, string>>(v: T): T {
  return v;
}

const zh = asLocale(zhRaw);
const en = asLocale(enRaw);
const ru = asLocale(ruRaw);

const locales: Record<string, Record<string, string>> = {
  zh,
  en,
  ru,
};

function getCurrentLang(): string {
  try {
    const obsidianLang = getLanguage();
    if (obsidianLang?.startsWith("zh")) return "zh";
    if (obsidianLang?.startsWith("ru")) return "ru";
  } catch {
    // fallback to en
  }
  return "en";
}

export function t(key: string): string {
  const lang = getCurrentLang();
  return locales[lang]?.[key] || locales["en"]?.[key] || key;
}
