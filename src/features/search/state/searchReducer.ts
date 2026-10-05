import { CONFIG } from '../../../config';
import { removeChip } from '../../../lib/describe';
import { cloneFilters, emptyFilters, hasActiveFilters } from '../../../lib/filters';
import type { UrlSearchState } from '../../../lib/urlState';
import { TEXT_FIELDS, type Filters, type RowKey, type Screen, type SortKey } from '../../../types';

/**
 * The whole search, as one pure reducer (no React, no browser): the locked steps, the step being edited (draft),
 * sort, which screen is shown, and the undo history for "Undo last filter".
 * Search within results: each locked step keeps its own filters; a step's results are its filters applied to the
 * previous step's results.
 */
export interface SearchState {
  steps: Filters[];
  draft: Filters;
  /** Changes whenever the whole draft is replaced, so typed text applies at once instead of after the pause. */
  draftVersion: number;
  sort: SortKey;
  /** First step: full-screen search. After "Show candidates" (or with locked steps): split view with results. */
  screen: Screen;
  /** Earlier versions of the draft, oldest first. */
  history: Filters[];
  /** The change that is still being merged into the last undo step (typing, dragging). */
  lastMerge: { key: string; at: number } | null;
  /** The saved search that is loaded now: File > Save updates it. */
  currentSavedId: string | null;
}

export type SearchAction =
  /** Change some filters of the draft. `at` (ms) lets quick bursts (typing, sliders) count as one undo step. */
  | { type: 'patch'; patch: Partial<Filters>; at: number }
  /** Job description fill: one undo step; typed text applies at once. */
  | { type: 'fill'; patch: Partial<Filters> }
  | { type: 'clear' }
  | { type: 'undo' }
  | { type: 'setRequired'; row: RowKey; required: boolean }
  | { type: 'removeChip'; id: string }
  | { type: 'showResults' }
  | { type: 'showAllFilters' }
  | { type: 'searchWithin' }
  | { type: 'newSearch' }
  /** Go back to locked step `step` (-1: all candidates, a new search). Later steps go. */
  | { type: 'jumpTo'; step: number }
  /** Load a saved or recent search. One step: full-screen search; more: split view. */
  | { type: 'load'; steps: Filters[]; savedId?: string }
  | { type: 'setSort'; sort: SortKey }
  | { type: 'setSavedId'; id: string | null }
  /** Browser Back / Forward: show the search the URL describes. */
  | { type: 'restore'; state: UrlSearchState };

export const initialSearchState = (from: UrlSearchState): SearchState => ({
  ...from,
  draftVersion: 0,
  history: [],
  lastMerge: null,
  currentSavedId: null,
});

/** Shown on the split view: after "Show candidates", or whenever there are locked steps. */
export const isOnResults = (s: SearchState) => s.screen === 'results' || s.steps.length > 0;

/** "Search within these results" is possible when the current step filters something. */
export const canSearchWithin = (s: SearchState) => hasActiveFilters(s.draft);

/** The steps a save keeps: the locked steps plus the current one (unless it is empty after locked steps). */
export const stepsToSave = (s: SearchState): Filters[] =>
  (s.steps.length && !hasActiveFilters(s.draft) ? s.steps : [...s.steps, s.draft]).map(cloneFilters);

/** Typing in one box or dragging a slider: the key that merges a burst of changes into one undo step. */
export function mergeKeyOf(p: Partial<Filters>): string | undefined {
  const keys = Object.keys(p);
  if (keys.length === 1 && (TEXT_FIELDS as readonly string[]).includes(keys[0])) return keys[0];
  if (p.ageMode === 'range') return 'age-range';
  if ('toeic' in p && p.toeic !== null) return 'toeic';
  if (keys.length === 1 && 'gpaMin' in p) return 'gpa';
  return undefined;
}

/** Remember the current draft as an undo step (unless this change continues the last one). */
function remember(s: SearchState, mergeKey?: string, at = 0): Pick<SearchState, 'history' | 'lastMerge'> {
  if (mergeKey && s.lastMerge?.key === mergeKey && at - s.lastMerge.at < CONFIG.undoMergeMs) {
    return { history: s.history, lastMerge: { key: mergeKey, at } };
  }
  return { history: [...s.history, s.draft].slice(-CONFIG.undoKeep), lastMerge: mergeKey ? { key: mergeKey, at } : null };
}

/** Replace the whole draft (typed text applies at once). */
const replaceDraft = (s: SearchState, draft: Filters, record: boolean): SearchState => ({
  ...s,
  ...(record ? remember(s) : { history: [], lastMerge: null }),
  draft,
  draftVersion: s.draftVersion + 1,
});

export function searchReducer(s: SearchState, a: SearchAction): SearchState {
  switch (a.type) {
    case 'patch':
      return { ...s, ...remember(s, mergeKeyOf(a.patch), a.at), draft: { ...s.draft, ...a.patch } };
    case 'fill':
      return replaceDraft(s, { ...s.draft, ...a.patch }, true);
    case 'clear':
      return hasActiveFilters(s.draft) || s.draft.optional.length ? replaceDraft(s, emptyFilters(), true) : s;
    case 'undo': {
      if (!s.history.length) return s;
      const draft = s.history[s.history.length - 1];
      return { ...s, history: s.history.slice(0, -1), lastMerge: null, draft, draftVersion: s.draftVersion + 1 };
    }
    case 'setRequired': {
      const optional = a.required ? s.draft.optional.filter((r) => r !== a.row) : [...new Set([...s.draft.optional, a.row])];
      return { ...s, ...remember(s), draft: { ...s.draft, optional } };
    }
    case 'removeChip':
      return replaceDraft(s, removeChip(s.draft, a.id), true);
    case 'showResults':
      return { ...s, screen: 'results' };
    case 'showAllFilters':
      return s.steps.length ? s : { ...s, screen: 'search' };
    case 'searchWithin':
      if (!canSearchWithin(s)) return s;
      return { ...replaceDraft(s, emptyFilters(), false), steps: [...s.steps, cloneFilters(s.draft)], screen: 'results' };
    case 'newSearch':
      return { ...replaceDraft(s, emptyFilters(), false), steps: [], screen: 'search', currentSavedId: null };
    case 'jumpTo':
      if (a.step < 0) return searchReducer(s, { type: 'newSearch' });
      if (a.step >= s.steps.length) return s;
      return { ...replaceDraft(s, cloneFilters(s.steps[a.step]), false), steps: s.steps.slice(0, a.step) };
    case 'load': {
      const copy = a.steps.map(cloneFilters);
      return {
        ...replaceDraft(s, copy[copy.length - 1] ?? emptyFilters(), false),
        steps: copy.slice(0, -1),
        currentSavedId: a.savedId ?? null,
        screen: copy.length > 1 ? 'results' : 'search',
      };
    }
    case 'setSort':
      return s.sort === a.sort ? s : { ...s, sort: a.sort };
    case 'setSavedId':
      return { ...s, currentSavedId: a.id };
    case 'restore':
      return { ...replaceDraft(s, a.state.draft, false), steps: a.state.steps, sort: a.state.sort, screen: a.state.screen };
  }
}
