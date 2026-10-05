import type { ViewPrefs } from '../types';
import { readString, writeJson } from './storage';

/** v2: the default became the 3-column grid. v1 only contributes the density choice. */
const KEY = 'resumeFinder.view.v2';
const OLD_KEY = 'resumeFinder.view.v1';
export const DEFAULT_VIEW: ViewPrefs = { density: 'compact', results: 'grid' };

export function loadView(): ViewPrefs {
  const current = readString(KEY);
  const raw = current ?? readString(OLD_KEY);
  if (raw === null) return DEFAULT_VIEW;
  try {
    const v = JSON.parse(raw) as Partial<ViewPrefs> | null;
    return {
      density: v?.density === 'comfortable' ? 'comfortable' : 'compact',
      results: current !== null && v?.results === 'list' ? 'list' : 'grid',
    };
  } catch {
    return DEFAULT_VIEW;
  }
}

export const storeView = (v: ViewPrefs) => writeJson(KEY, v);
