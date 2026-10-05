import type { Candidate, CountQuery, Filters, SearchQuery } from '../types';
import { ApiError, type CandidateApi } from './apiContract';
import { generateCandidates } from './mock/candidates';
import { createSearchIndex, type SearchIndex } from './searchEngine';

/** Small least-recently-used cache: the count, the trail and the results page ask about the same query. */
function lru<V>(max: number) {
  const map = new Map<string, V>();
  return (key: string, make: () => V): V => {
    const hit = map.get(key);
    if (hit !== undefined) {
      map.delete(key);
      map.set(key, hit);
      return hit;
    }
    const value = make();
    map.set(key, value);
    if (map.size > max) map.delete(map.keys().next().value as string);
    return value;
  };
}

const keyOf = (steps: Filters[]) => JSON.stringify(steps);

/**
 * The candidate API over invented sample data, searched in the browser with the reference engine (lib/searchEngine).
 * Answers like a server would: asynchronously, one page at a time.
 */
export function createMockApi(load: () => Promise<Candidate[]> = generateCandidates): CandidateApi {
  let ready: Promise<{ index: SearchIndex; byId: Map<string, Candidate> }> | null = null;
  const db = () => (ready ??= load().then((list) => ({ index: createSearchIndex(list), byId: new Map(list.map((c) => [c.id, c])) })));
  const chains = lru<Uint32Array[]>(20);
  const results = lru<Uint32Array>(40);
  const sorted = lru<{ order: Uint32Array; scores: Uint8Array | null; niceTotal: number }>(20);

  const matching = async ({ steps, filters }: CountQuery) => {
    const { index } = await db();
    const chain = chains(keyOf(steps), () => index.chainSteps(steps));
    const set = results(keyOf([...steps, filters]), () => index.runFilter(chain[chain.length - 1], filters));
    return { index, set };
  };

  const ordered = async (query: SearchQuery) => {
    const { index, set } = await matching(query);
    return sorted(`${query.sort}|${keyOf([...query.steps, query.filters])}`, () => {
      const prefs = index.preferenceScores(set, [...query.steps, query.filters]);
      return { order: index.sortResults(set, query.sort, prefs), scores: prefs?.scores ?? null, niceTotal: prefs?.total ?? 0 };
    });
  };

  return {
    warmUp: async () => {
      await db();
    },
    countCandidates: async (query) => (await matching(query)).set.length,
    countSteps: async (steps) => {
      const { index } = await db();
      return chains(keyOf(steps), () => index.chainSteps(steps)).map((s) => s.length);
    },
    searchCandidates: async (query, { offset, limit }) => {
      const { index } = await db();
      const { order, scores, niceTotal } = await ordered(query);
      const start = Math.max(0, Math.min(offset, order.length));
      const items = Array.from(order.subarray(start, start + Math.max(0, limit)), (i) => ({
        candidate: index.candidates[i],
        niceMatched: scores ? scores[i] : 0,
      }));
      return { total: order.length, offset: start, items, niceTotal };
    },
    getCv: async (id) => {
      const cv = (await db()).byId.get(id);
      if (!cv) throw new ApiError(`No CV with id ${id}`, 404);
      return cv;
    },
    exportCandidates: async (query) => {
      const { index } = await db();
      const { order } = await ordered(query);
      return Array.from(order, (i) => index.candidates[i]);
    },
  };
}
