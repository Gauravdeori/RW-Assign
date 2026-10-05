import { useSyncExternalStore } from 'react';
import { themeStore, type Theme } from '../lib/theme';

/** Light / dark theme and its setter (shared by the top-bar switch and the View menu). */
export function useTheme(): [Theme, (t: Theme) => void] {
  return [useSyncExternalStore(themeStore.subscribe, themeStore.get), themeStore.set];
}
