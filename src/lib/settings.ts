import type { AppSettings } from '../types';
import { readJson, removeKey, writeJson } from './storage';

const SETTINGS_KEY = 'resumeFinder.admin.settings.v1';

export const DEFAULT_SETTINGS: AppSettings = { showGender: true, showJdFill: true, defaultLang: 'en' };

/** Admin settings that change the Search page, with defaults for anything missing or invalid. */
export function loadSettings(): AppSettings {
  return readJson<AppSettings>(
    SETTINGS_KEY,
    () => DEFAULT_SETTINGS,
    (v) => {
      if (!v || typeof v !== 'object') return null;
      const s = v as Partial<Record<keyof AppSettings, unknown>>;
      return {
        showGender: typeof s.showGender === 'boolean' ? s.showGender : DEFAULT_SETTINGS.showGender,
        showJdFill: typeof s.showJdFill === 'boolean' ? s.showJdFill : DEFAULT_SETTINGS.showJdFill,
        defaultLang: s.defaultLang === 'ja' || s.defaultLang === 'en' ? s.defaultLang : DEFAULT_SETTINGS.defaultLang,
      };
    },
  );
}

export const storeSettings = (v: AppSettings) => writeJson(SETTINGS_KEY, v);
export const clearStoredSettings = () => removeKey(SETTINGS_KEY);
