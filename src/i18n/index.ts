import en from "@/i18n/en.json";
import zh from "@/i18n/zh.json";

type TranslationKeys = keyof typeof en;

interface Translations {
    [key: string]: Record<TranslationKeys, string>;
}

const translations: Translations = {
    en,
    zh,
};

export function t(key: TranslationKeys): string {
    const lang = localStorage.getItem("language") || "en";
    return translations[lang] ? translations[lang][key] || translations.en[key] : translations.en[key];
}