import { createContext, useContext } from 'react';
import type { Filters, RecentSearch, SavedSearch } from '../../../types';

export interface SavedSearchesValue {
  saved: SavedSearch[];
  recent: RecentSearch[];
  /** Save the steps under a new name; returns the new entry. */
  addSaved: (name: string, steps: Filters[]) => SavedSearch;
  /** File > Save: replace the steps of an existing saved search. */
  updateSaved: (id: string, steps: Filters[]) => void;
  deleteSaved: (id: string) => void;
  addRecent: (steps: Filters[]) => void;
  /** Admin > Reset demo data: back to the seeded saved searches. */
  resetSaved: () => void;
}

export const SavedSearchesContext = createContext<SavedSearchesValue | null>(null);

/** Saved searches (named, kept in this browser) and recent searches (the last few run). */
export function useSavedSearches(): SavedSearchesValue {
  const v = useContext(SavedSearchesContext);
  if (!v) throw new Error('useSavedSearches must be used inside SavedSearchesProvider');
  return v;
}
