import { loadSettings } from '../lib/settings';
import { readString, writeString } from '../lib/storage';
import type { Lang } from '../types';
import type { Dict } from './en';

const LANG_KEY = 'resumeFinder.lang';

/** The language this person picked; if they never picked one, the Admin page's default for new users. */
export function storedLang(): Lang {
  const v = readString(LANG_KEY);
  if (v === 'ja' || v === 'en') return v;
  return loadSettings().defaultLang;
}

export const storeLang = (l: Lang) => writeString(LANG_KEY, l);

// Japanese labels are a separate chunk, fetched the first time they are needed.
let jaDict: Dict | null = null;
let jaLoading: Promise<Dict> | null = null;

export function loadJa(): Promise<Dict> {
  jaLoading ??= import('./ja').then((m) => (jaDict = m.ja));
  return jaLoading;
}

/** The Japanese labels when already loaded (no wait). */
export const loadedJa = () => jaDict;
