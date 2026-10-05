import { describe, expect, it } from 'vitest';
import { emptyFilters } from '../../../lib/filters';
import { filters } from '../../../test/fixtures';
import {
  canSearchWithin,
  initialSearchState,
  isOnResults,
  searchReducer,
  stepsToSave,
  type SearchAction,
  type SearchState,
} from './searchReducer';

const start = () => initialSearchState({ steps: [], draft: emptyFilters(), sort: 'best', screen: 'search' });
const apply = (s: SearchState, ...actions: SearchAction[]) => actions.reduce(searchReducer, s);

describe('secondary search (steps)', () => {
  it('locks the current filters as a step and starts the next one empty', () => {
    const s = apply(
      start(),
      { type: 'patch', patch: { industries: ['technology'] }, at: 0 },
      { type: 'showResults' },
      { type: 'searchWithin' },
      { type: 'patch', patch: { seniority: ['K'] }, at: 1 },
      { type: 'searchWithin' },
      { type: 'patch', patch: { gaishiScores: ['A'] }, at: 2 },
    );
    expect(s.steps).toEqual([filters({ industries: ['technology'] }), filters({ seniority: ['K'] })]);
    expect(s.draft.gaishiScores).toEqual(['A']);
    expect(isOnResults(s)).toBe(true);
  });

  it('does not add an empty step', () => {
    const s = apply(start(), { type: 'patch', patch: { optional: ['industry'] }, at: 0 });
    expect(canSearchWithin(s)).toBe(false);
    expect(apply(s, { type: 'searchWithin' }).steps).toEqual([]);
  });

  it('jumps back to a step: its filters are edited again and later steps go', () => {
    const s = apply(
      start(),
      { type: 'patch', patch: { industries: ['technology'] }, at: 0 },
      { type: 'searchWithin' },
      { type: 'patch', patch: { seniority: ['K'] }, at: 1 },
      { type: 'searchWithin' },
      { type: 'jumpTo', step: 0 },
    );
    expect(s.steps).toEqual([]);
    expect(s.draft.industries).toEqual(['technology']);
    expect(apply(s, { type: 'jumpTo', step: -1 })).toMatchObject({ steps: [], screen: 'search' });
  });

  it('loads a saved search: several steps open the split view', () => {
    const s = apply(start(), {
      type: 'load',
      steps: [filters({ industries: ['financial'] }), filters({ seniority: ['B'] })],
      savedId: 'x',
    });
    expect(s).toMatchObject({ steps: [filters({ industries: ['financial'] })], currentSavedId: 'x', screen: 'results' });
    expect(stepsToSave(s)).toHaveLength(2);
  });
});

describe('undo', () => {
  it('undoes click by click', () => {
    const s = apply(
      start(),
      { type: 'patch', patch: { industries: ['technology'] }, at: 0 },
      { type: 'patch', patch: { seniority: ['K'] }, at: 5000 },
    );
    const once = searchReducer(s, { type: 'undo' });
    expect(once.draft).toEqual(filters({ industries: ['technology'] }));
    expect(searchReducer(once, { type: 'undo' }).draft).toEqual(emptyFilters());
  });

  it('merges a burst of typing into one undo step', () => {
    const s = apply(
      start(),
      { type: 'patch', patch: { lastName: 'S' }, at: 0 },
      { type: 'patch', patch: { lastName: 'Sa' }, at: 300 },
      { type: 'patch', patch: { lastName: 'Sat' }, at: 600 },
    );
    expect(s.history).toHaveLength(1);
    expect(searchReducer(s, { type: 'undo' }).draft.lastName).toBe('');
  });

  it('removes a chip and clears all as undoable steps', () => {
    const s = apply(
      start(),
      { type: 'patch', patch: { industries: ['technology', 'energy'] }, at: 0 },
      { type: 'removeChip', id: 'i-energy' },
      { type: 'clear' },
    );
    expect(s.draft).toEqual(emptyFilters());
    expect(searchReducer(s, { type: 'undo' }).draft.industries).toEqual(['technology']);
  });
});
