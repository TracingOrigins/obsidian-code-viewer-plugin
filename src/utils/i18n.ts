// i18n.ts — 多语言国际化工具函数
import zh from "../locales/zh.json";
import en from "../locales/en.json";
import ru from "../locales/ru.json";
import { getLanguage } from "obsidian";

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
