import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import en from "./locales/en.json";
import {
  FALLBACK_LOCALE,
  Locale,
  SUPPORTED_LOCALES,
  isSupportedLocale,
} from "./types";

const resources = {
  en: { translation: en },
} as const;

export async function initI18n(): Promise<void> {
  const deviceLocale = Localization.getLocales()[0]?.languageCode ?? FALLBACK_LOCALE;
  const initial = isSupportedLocale(deviceLocale) ? deviceLocale : FALLBACK_LOCALE;

  if (i18next.isInitialized) return;

  await i18next.use(initReactI18next).init({
    resources,
    lng: initial,
    fallbackLng: FALLBACK_LOCALE,
    supportedLngs: SUPPORTED_LOCALES as unknown as string[],
    interpolation: { escapeValue: false },
    returnNull: false,
  });
}

export function t(key: string, options?: Record<string, unknown>): string {
  return i18next.t(key, options ?? {}) as string;
}

export function getCurrentLocale(): Locale {
  const current = i18next.language;
  return isSupportedLocale(current) ? current : FALLBACK_LOCALE;
}

export async function setLocale(locale: Locale): Promise<void> {
  if (!isSupportedLocale(locale)) {
    await i18next.changeLanguage(FALLBACK_LOCALE);
    return;
  }
  await i18next.changeLanguage(locale);
}
