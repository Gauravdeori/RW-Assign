import { describe, expect, it } from 'vitest';
import { candidate, filters } from '../test/fixtures';
import { createMockApi } from './mockApi';

describe('mock candidate API', () => {
  const list = [
    candidate('a', { industry: 'technology', gaishiScore: 'A', cvUpdatedAt: '2026-01-01' }),
    candidate('b', { industry: 'technology', gaishiScore: 'C', cvUpdatedAt: '2026-05-01' }),
    candidate('c', { industry: 'financial', gaishiScore: 'B', cvUpdatedAt: '2026-03-01' }),
  ];
  const api = createMockApi(async () => list);

  it('counts the current filters within the locked steps', async () => {
    expect(await api.countCandidates({ steps: [], filters: filters({ industries: ['technology'] }) })).toBe(2);
    expect(await api.countCandidates({ steps: [filters({ industries: ['technology'] })], filters: filters({ gaishiScores: ['A'] }) })).toBe(
      1,
    );
    expect(await api.countSteps([filters({ industries: ['technology'] })])).toEqual([3, 2]);
  });

  it('returns one sorted page at a time', async () => {
    const page = await api.searchCandidates({ steps: [], filters: filters(), sort: 'new' }, { offset: 1, limit: 1 });
    expect(page).toMatchObject({ total: 3, offset: 1, niceTotal: 0 });
    expect(page.items.map((x) => x.candidate.id)).toEqual(['c']);
    const best = await api.searchCandidates({ steps: [], filters: filters(), sort: 'best' }, { offset: 0, limit: 10 });
    expect(best.items.map((x) => x.candidate.id)).toEqual(['a', 'c', 'b']);
  });

  it('reports nice-to-have matches per result', async () => {
    const page = await api.searchCandidates(
      { steps: [], filters: filters({ industries: ['financial'], optional: ['industry'] }), sort: 'best' },
      { offset: 0, limit: 10 },
    );
    expect(page.niceTotal).toBe(1);
    expect(page.items[0]).toMatchObject({ niceMatched: 1 });
    expect(page.items[0].candidate.id).toBe('c');
  });

  it('gets a CV by id, and fails clearly for an unknown one', async () => {
    expect((await api.getCv('b')).id).toBe('b');
    await expect(api.getCv('zzz')).rejects.toMatchObject({ name: 'ApiError', status: 404 });
  });

  it('exports every result in order', async () => {
    const rows = await api.exportCandidates({ steps: [], filters: filters({ industries: ['technology'] }), sort: 'new' });
    expect(rows.map((c) => c.id)).toEqual(['b', 'a']);
  });
});
