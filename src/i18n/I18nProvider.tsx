import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Lang } from '../types';
import { I18nContext } from './context';
import { en, type Dict } from './en';
import { loadJa, loadedJa, storeLang, storedLang } from './lang';

/**
 * EN / 日本語. English is built in; Japanese loads on demand. main.tsx preloads Japanese before the first render when
 * it is the stored choice, so there is no English flash.
 */
export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(storedLang);
  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    storeLang(l);
  }, []);
  const [ja, setJa] = useState<Dict | null>(loadedJa);
  useEffect(() => {
    if (lang !== 'ja' || ja) return;
    let live = true;
    loadJa()
      .then((d) => live && setJa(d))
      .catch(() => {
        /* chunk failed to load (offline): stay in English */
      });
    return () => {
      live = false;
    };
  }, [lang, ja]);
  const t = lang === 'ja' && ja ? ja : en;
  const shown: Lang = t === en ? 'en' : 'ja';
  useEffect(() => {
    document.documentElement.lang = shown;
  }, [shown]);
  const value = useMemo(() => ({ lang: shown, setLang, t }), [shown, setLang, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
