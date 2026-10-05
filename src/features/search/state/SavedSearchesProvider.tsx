import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { CONFIG } from '../../../config';
import { cloneFilters } from '../../../lib/filters';
import { addRecent as withRecent, loadRecent, storeRecent } from '../../../lib/recentSearches';
import { clearStoredSaved, loadSaved, newSavedId, storeSaved } from '../../../lib/savedSearches';
import type { Filters, RecentSearch, SavedSearch } from '../../../types';
import { SavedSearchesContext } from './SavedSearchesContext';

export function SavedSearchesProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState<SavedSearch[]>(loadSaved);
  useEffect(() => storeSaved(saved), [saved]);
  const [recent, setRecent] = useState<RecentSearch[]>(loadRecent);
  useEffect(() => storeRecent(recent), [recent]);

  const addSaved = useCallback((name: string, steps: Filters[]) => {
    const entry: SavedSearch = {
      id: newSavedId(),
      name: name.trim().slice(0, CONFIG.searchNameMaxLength),
      steps: steps.map(cloneFilters),
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setSaved((list) => [entry, ...list]);
    return entry;
  }, []);
  const updateSaved = useCallback(
    (id: string, steps: Filters[]) => setSaved((list) => list.map((s) => (s.id === id ? { ...s, steps: steps.map(cloneFilters) } : s))),
    [],
  );
  const deleteSaved = useCallback((id: string) => setSaved((list) => list.filter((s) => s.id !== id)), []);
  const addRecent = useCallback((steps: Filters[]) => setRecent((list) => withRecent(list, steps)), []);
  const resetSaved = useCallback(() => {
    clearStoredSaved();
    setSaved(loadSaved());
  }, []);

  const value = useMemo(
    () => ({ saved, recent, addSaved, updateSaved, deleteSaved, addRecent, resetSaved }),
    [saved, recent, addSaved, updateSaved, deleteSaved, addRecent, resetSaved],
  );
  return <SavedSearchesContext.Provider value={value}>{children}</SavedSearchesContext.Provider>;
}
