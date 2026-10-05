import { CONFIG } from '../config';
import type { Filters, RecentSearch } from '../types';
import { cloneFilters, hasActiveFilters, sanitizeFilters } from './filters';
import { readJson, writeJson } from './storage';
import { encodeFilters } from './urlState';

const KEY = 'resumeFinder.recent.v1';

export function parseRecent(raw: unknown): RecentSearch[] | null {
  if (!Array.isArray(raw)) return null;
  return raw.flatMap((r: unknown) => {
    if (!r || typeof r !== 'object') return [];
    const { key, steps, at } = r as Record<string, unknown>;
    if (typeof key !== 'string' || !Array.isArray(steps) || steps.length === 0) return [];
    return [{ key, steps: steps.map(sanitizeFilters), at: typeof at === 'string' ? at : '' }];
  });
}

export const loadRecent = (): RecentSearch[] => readJson(KEY, () => [], parseRecent);
export const storeRecent = (list: RecentSearch[]) => writeJson(KEY, list);

/** Add a search to the top of the list (moving it there if it is already in it). Searches with no filters are not kept. */
export function addRecent(list: RecentSearch[], steps: Filters[], at = new Date().toISOString()): RecentSearch[] {
  if (!steps.some(hasActiveFilters)) return list;
  const key = steps.map(encodeFilters).join('|');
  const entry: RecentSearch = { key, steps: steps.map(cloneFilters), at };
  return [entry, ...list.filter((r) => r.key !== key)].slice(0, CONFIG.recentKeep);
}
