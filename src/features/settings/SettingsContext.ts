import { createContext, useContext } from 'react';
import { DEFAULT_SETTINGS } from '../../lib/settings';
import type { AppSettings } from '../../types';

export interface SettingsValue {
  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => void;
  resetSettings: () => void;
}

export const SettingsContext = createContext<SettingsValue>({
  settings: DEFAULT_SETTINGS,
  updateSettings: () => {},
  resetSettings: () => {},
});

/** Admin settings that change the Search page (gender filter, job description panel, default language). */
export const useSettings = () => useContext(SettingsContext);
