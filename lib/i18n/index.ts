import en, { type Dictionary } from './en';
import es from './es';
import type { Locale } from './types';
import { DEFAULT_LOCALE } from './types';

export type { Locale, Dictionary };
export { LOCALES, DEFAULT_LOCALE, LOCALE_STORAGE_KEY } from './types';

const dictionaries: Record<Locale, Dictionary> = { en, es };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
}

export type TranslationKey = string;

function getByPath(obj: unknown, path: string): string | undefined {
  const parts = path.split('.');
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return typeof cur === 'string' ? cur : undefined;
}

export type TParams = Record<string, string | number>;

export function translate(
  locale: Locale,
  key: TranslationKey,
  params?: TParams
): string {
  const dict = getDictionary(locale);
  let text = getByPath(dict, key) ?? getByPath(en, key) ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(v));
    }
  }
  return text;
}
