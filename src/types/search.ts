import type { Candidate } from './candidate';
import type { Filters } from './filters';

export const SORT_KEYS = ['best', 'new'] as const;
/** "Best CVs" (placeholder rank) or "New CVs" (newest CV first). */
export type SortKey = (typeof SORT_KEYS)[number];

/** First step: the full-screen search. After "Show candidates": the split view with results. */
export type Screen = 'search' | 'results';

/** What to count: the locked steps (each applied to the previous step's results), then the current filters. */
export interface CountQuery {
  steps: Filters[];
  filters: Filters;
}

export interface SearchQuery extends CountQuery {
  sort: SortKey;
}

export interface PageRequest {
  offset: number;
  limit: number;
}

/** One result with how many of the nice-to-have filters it matches. */
export interface PagedCandidate {
  candidate: Candidate;
  niceMatched: number;
}

export interface CandidatePage {
  /** Every result of the query, not just this page. */
  total: number;
  offset: number;
  items: PagedCandidate[];
  /** Nice-to-have filters in use (over all steps); 0 when every filter is required. */
  niceTotal: number;
}

/** A saved search keeps its name and every step's filters, never the result list. */
export interface SavedSearch {
  id: string;
  name: string;
  steps: Filters[];
  createdAt: string;
}

/** A search the recruiter ran ("Show candidates" or "Search within"), newest first. Kept in this browser only. */
export interface RecentSearch {
  key: string;
  steps: Filters[];
  at: string;
}

export type Density = 'compact' | 'comfortable';
export type ResultsView = 'list' | 'grid';
export type CardVariant = 'row' | 'tile';

/** View menu choices, remembered in this browser. */
export interface ViewPrefs {
  density: Density;
  /** Results as a 3-column grid (default) or a 1-column list. */
  results: ResultsView;
}
