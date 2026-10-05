import { createContext, useContext } from 'react';
import type { Filters, RowKey, SortKey } from '../../../types';
import type { SearchState } from './searchReducer';

export interface SearchActions {
  patch: (p: Partial<Filters>) => void;
  fill: (p: Partial<Filters>) => void;
  clear: () => void;
  undo: () => void;
  setRequired: (row: RowKey, required: boolean) => void;
  removeChip: (id: string) => void;
  showResults: () => void;
  showAllFilters: () => void;
  searchWithin: () => void;
  newSearch: () => void;
  jumpTo: (step: number) => void;
  load: (steps: Filters[], savedId?: string) => void;
  setSort: (sort: SortKey) => void;
  setSavedId: (id: string | null) => void;
}

export interface SearchValue {
  state: SearchState;
  /** The draft to search with: clicks at once, typed text after a short pause. */
  liveDraft: Filters;
  /** The split view with results is shown. */
  onResults: boolean;
  /** Stable for the whole session: safe to pass to memoised components. */
  actions: SearchActions;
}

export const SearchContext = createContext<SearchValue | null>(null);
/** The actions alone: they never change, so components that only act on the search do not re-render with it. */
export const SearchActionsContext = createContext<SearchActions | null>(null);

/** The current search (steps, filters, sort, screen) and everything that changes it. */
export function useSearch(): SearchValue {
  const v = useContext(SearchContext);
  if (!v) throw new Error('useSearch must be used inside SearchProvider');
  return v;
}

/** Only the actions (stable): use this where the search state itself is not shown. */
export function useSearchActions(): SearchActions {
  const v = useContext(SearchActionsContext);
  if (!v) throw new Error('useSearchActions must be used inside SearchProvider');
  return v;
}
