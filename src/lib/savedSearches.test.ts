// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { filters } from '../test/fixtures';
import { addRecent, loadRecent, parseRecent } from './recentSearches';
import { loadSaved, parseSaved, storeSaved } from './savedSearches';

describe('saved search serialisation', () => {
  const entry = {
    id: 's-1',
    name: 'Bilingual managers',
    createdAt: '2026-10-01',
    steps: [filters({ seniority: ['K'] }), filters({ englishMin: 'Business' })],
  };

  it('round-trips through storage', () => {
    storeSaved([entry]);
    expect(loadSaved()).toEqual([entry]);
  });

  it('drops entries without a name or steps, and sanitises the rest', () => {
    const parsed = parseSaved([
      { id: 'a', name: '', steps: [{}] },
      { id: 'b', name: 'No steps', steps: [] },
      { id: 'c', name: '  Old one  ', steps: [{ schoolClasses: ['S'], foreign: 'zzz' }], createdAt: '2025-01-01' },
      'garbage',
    ]);
    expect(parsed).toHaveLength(1);
    expect(parsed?.[0]).toMatchObject({ id: 'c', name: 'Old one' });
    expect(parsed?.[0].steps[0]).toMatchObject({ schoolRatings: ['S'], foreign: 'any' });
  });

  it('falls back to the sample searches when storage is broken or unavailable', () => {
    localStorage.setItem('resumeFinder.savedSearches.v1', '{not json');
    expect(loadSaved().map((s) => s.id)).toEqual(['seed-1', 'seed-2']);
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(loadSaved()).toHaveLength(2);
    expect(loadRecent()).toEqual([]);
  });

  it('keeps recent searches newest first, without duplicates or empty searches', () => {
    let list = addRecent([], [filters({ industries: ['technology'] })], '2026-10-01');
    list = addRecent(list, [filters({ seniority: ['K'] })], '2026-10-02');
    list = addRecent(list, [filters({ industries: ['technology'] })], '2026-10-03');
    list = addRecent(list, [filters({ optional: ['industry'] })], '2026-10-04');
    expect(list.map((r) => r.at)).toEqual(['2026-10-03', '2026-10-02']);
    expect(parseRecent([{ key: 'k', steps: [{ industries: ['nope'] }] }])?.[0].steps[0].industries).toEqual([]);
  });
});
