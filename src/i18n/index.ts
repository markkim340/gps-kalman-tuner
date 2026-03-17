import { create } from 'zustand';
import type { Locale, Translations } from './types';
import { ko } from './ko';
import { en } from './en';

export type { Locale, Translations };
export { ko, en };

const LOCALES: Record<Locale, Translations> = { ko, en };

const STORAGE_KEY = 'gps-kalman-tuner-locale';

function getInitialLocale(): Locale {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'ko' || stored === 'en') return stored;
  const browserLang = navigator.language.toLowerCase();
  return browserLang.startsWith('ko') ? 'ko' : 'en';
}

interface I18nStore {
  locale: Locale;
  t: Translations;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
}

export const useI18n = create<I18nStore>((set, get) => ({
  locale: getInitialLocale(),
  t: LOCALES[getInitialLocale()],
  setLocale: (locale) => {
    localStorage.setItem(STORAGE_KEY, locale);
    set({ locale, t: LOCALES[locale] });
  },
  toggleLocale: () => {
    const next = get().locale === 'ko' ? 'en' : 'ko';
    localStorage.setItem(STORAGE_KEY, next);
    set({ locale: next, t: LOCALES[next] });
  },
}));
