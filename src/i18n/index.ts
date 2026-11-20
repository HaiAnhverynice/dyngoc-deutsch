import { en } from './en';
import { vi, type TranslationKey } from './vi';

export type UiLanguage = 'vi' | 'en' | 'both';
export type { TranslationKey };
export type TFunction = (key: TranslationKey, params?: Record<string, string | number>) => string;

const interpolate = (s: string, params?: Record<string, string | number>) =>
  params ? s.replace(/\{(\w+)\}/g, (m, k: string) => (k in params ? String(params[k]) : m)) : s;

/** 'both' renders "Vietnamese / English" (identical strings are not repeated). */
export function createT(lang: UiLanguage): TFunction {
  return (key, params) => {
    const v = interpolate(vi[key], params);
    if (lang === 'vi') return v;
    const e = interpolate(en[key], params);
    if (lang === 'en' || e === v) return e;
    return `${v} / ${e}`;
  };
}

/** Locale used for date formatting. */
export const localeFor = (lang: UiLanguage) => (lang === 'en' ? 'en-GB' : 'vi-VN');
