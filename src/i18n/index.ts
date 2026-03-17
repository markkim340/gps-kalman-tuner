import { create } from 'zustand';
import type { Locale, Translations } from './types';
import { ko } from './ko';
import { en } from './en';
import { ja } from './ja';

export type { Locale, Translations };
export { ko, en, ja };

const LOCALES: Record<Locale, Translations> = { ko, en, ja };

export const LOCALE_OPTIONS: { locale: Locale; flag: string; label: string }[] = [
  { locale: 'ko', flag: '🇰🇷', label: '한국어' },
  { locale: 'en', flag: '🇺🇸', label: 'English' },
  { locale: 'ja', flag: '🇯🇵', label: '日本語' },
];

const STORAGE_KEY = 'gps-kalman-tuner-locale';

function getInitialLocale(): Locale {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'ko' || stored === 'en' || stored === 'ja') return stored;
  const lang = navigator.language.toLowerCase();
  if (lang.startsWith('ko')) return 'ko';
  if (lang.startsWith('ja')) return 'ja';
  return 'en';
}

interface I18nStore {
  locale: Locale;
  t: Translations;
  setLocale: (locale: Locale) => void;
}

export const useI18n = create<I18nStore>((set) => ({
  locale: getInitialLocale(),
  t: LOCALES[getInitialLocale()],
  setLocale: (locale) => {
    localStorage.setItem(STORAGE_KEY, locale);
    set({ locale, t: LOCALES[locale] });
  },
}));
