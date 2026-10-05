import { createContext, useContext } from 'react';
import type { Lang } from '../types';
import { en, type Dict } from './en';

export interface I18nValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Dict;
}

export const I18nContext = createContext<I18nValue>({ lang: 'en', setLang: () => {}, t: en });

/** The labels in the current language, and the language switch. */
export const useI18n = () => useContext(I18nContext);
