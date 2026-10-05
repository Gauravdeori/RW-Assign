import { CONFIG } from '../config';
import type { SavedSearch } from '../types';
import { emptyFilters, sanitizeFilters } from './filters';
import { readJson, removeKey, writeJson } from './storage';

const KEY = 'resumeFinder.savedSearches.v1';

function seed(): SavedSearch[] {
  return [
    {
      id: 'seed-1',
      name: 'Middle managers in their 40s',
      createdAt: '2026-09-28',
      steps: [{ ...emptyFilters(), ageMode: 'decades', decades: [40], ageMin: 40, ageMax: 49, seniority: ['K'] }],
    },
    {
      id: 'seed-2',
      name: 'Bilingual finance leaders',
      createdAt: '2026-09-25',
      steps: [
        { ...emptyFilters(), industries: ['financial'], englishMin: 'Business' },
        { ...emptyFilters(), seniority: ['K', 'B'], japaneseMin: 'Native' },
      ],
    },
  ];
}

/**
 * Saved searches as stored (JSON), checked one by one: entries without a name or steps are dropped, and every
 * step's filters are sanitised (older versions, hand-edited storage).
 */
export function parseSaved(raw: unknown): SavedSearch[] | null {
  if (!Array.isArray(raw)) return null;
  return raw.flatMap((s: unknown) => {
    if (!s || typeof s !== 'object') return [];
    const { id, name, steps, createdAt } = s as Record<string, unknown>;
    if (typeof name !== 'string' || !name.trim() || !Array.isArray(steps) || steps.length === 0) return [];
    return [
      {
        id: typeof id === 'string' && id ? id : newSavedId(),
        name: name.trim().slice(0, CONFIG.searchNameMaxLength),
        steps: steps.map(sanitizeFilters),
        createdAt: typeof createdAt === 'string' ? createdAt : '',
      },
    ];
  });
}

export const loadSaved = (): SavedSearch[] => readJson(KEY, seed, parseSaved);
export const storeSaved = (list: SavedSearch[]) => writeJson(KEY, list);
/** Forget stored data so the next load returns the seed data ("Reset demo data" in Admin). */
export const clearStoredSaved = () => removeKey(KEY);

export const newSavedId = () => `s-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;
