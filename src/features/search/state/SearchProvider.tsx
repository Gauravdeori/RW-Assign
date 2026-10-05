import { useEffect, useLayoutEffect, useMemo, useReducer, useRef, type ReactNode } from 'react';
import { useLiveFilters } from '../../../hooks/useLiveFilters';
import { readSearchState, writeSearchState } from '../../../lib/urlState';
import type { Filters } from '../../../types';
import { useSavedSearches } from './SavedSearchesContext';
import { SearchActionsContext, SearchContext, type SearchActions } from './SearchContext';
import { initialSearchState, isOnResults, searchReducer } from './searchReducer';

/**
 * Holds the search (see searchReducer) for the whole app and keeps the URL in step with it, so a search can be
 * shared, refreshed and stepped through with the browser's Back / Forward buttons.
 */
export function SearchProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(searchReducer, undefined, () => initialSearchState(readSearchState()));
  const liveDraft = useLiveFilters(state.draft, state.draftVersion);
  const onResults = isOnResults(state);
  const { addRecent } = useSavedSearches();

  // Actions read the latest state from a ref, so they keep one identity and memoised panels skip re-rendering.
  const latest = useRef(state);
  useLayoutEffect(() => {
    latest.current = state;
  });

  const actions = useMemo<SearchActions>(
    () => ({
      patch: (patch) => dispatch({ type: 'patch', patch, at: Date.now() }),
      fill: (patch) => dispatch({ type: 'fill', patch }),
      clear: () => dispatch({ type: 'clear' }),
      undo: () => dispatch({ type: 'undo' }),
      setRequired: (row, required) => dispatch({ type: 'setRequired', row, required }),
      removeChip: (id) => dispatch({ type: 'removeChip', id }),
      showResults: () => {
        addRecent([latest.current.draft]);
        dispatch({ type: 'showResults' });
      },
      showAllFilters: () => dispatch({ type: 'showAllFilters' }),
      searchWithin: () => {
        const { steps, draft } = latest.current;
        addRecent([...steps, draft]);
        dispatch({ type: 'searchWithin' });
      },
      newSearch: () => dispatch({ type: 'newSearch' }),
      jumpTo: (step) => dispatch({ type: 'jumpTo', step }),
      load: (steps: Filters[], savedId?: string) => dispatch({ type: 'load', steps, savedId }),
      setSort: (sort) => dispatch({ type: 'setSort', sort }),
      setSavedId: (id) => dispatch({ type: 'setSavedId', id }),
    }),
    [addRecent],
  );

  // URL: a new step or a change of screen adds a history entry (Back returns to it); filter clicks replace it.
  const navKey = `${state.steps.length}|${onResults}`;
  const lastNav = useRef(navKey);
  const restoring = useRef(false);
  useEffect(() => {
    const mode = navKey !== lastNav.current && !restoring.current ? 'push' : 'replace';
    lastNav.current = navKey;
    restoring.current = false;
    writeSearchState({ steps: state.steps, draft: liveDraft, sort: state.sort, screen: onResults ? 'results' : 'search' }, mode);
  }, [navKey, state.steps, liveDraft, state.sort, onResults]);
  useEffect(() => {
    const onPop = () => {
      restoring.current = true;
      dispatch({ type: 'restore', state: readSearchState() });
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const value = useMemo(() => ({ state, liveDraft, onResults, actions }), [state, liveDraft, onResults, actions]);
  return (
    <SearchActionsContext.Provider value={actions}>
      <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
    </SearchActionsContext.Provider>
  );
}
