import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { DEFAULT_SETTINGS, loadSettings, storeSettings } from '../../lib/settings';
import type { AppSettings } from '../../types';
import { SettingsContext } from './SettingsContext';

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  useEffect(() => storeSettings(settings), [settings]);
  const updateSettings = useCallback((patch: Partial<AppSettings>) => setSettings((s) => ({ ...s, ...patch })), []);
  const resetSettings = useCallback(() => setSettings(DEFAULT_SETTINGS), []);
  const value = useMemo(() => ({ settings, updateSettings, resetSettings }), [settings, updateSettings, resetSettings]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
