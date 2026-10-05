import type { Candidate, CandidatePage } from '../types';
import { ApiError, type CandidateApi } from './apiContract';

/**
 * The candidate API over HTTP, for the real backend. JSON in, JSON out; filters are sent exactly as the UI holds
 * them (see types/filters.ts), and lib/searchEngine.ts is the reference for what each filter means.
 *
 *   POST {base}/candidates/count        { steps, filters }                    -> { count: number }
 *   POST {base}/candidates/count-steps  { steps }                             -> { counts: number[] }
 *   POST {base}/candidates/search       { steps, filters, sort, offset, limit } -> CandidatePage
 *   GET  {base}/candidates/{id}                                               -> Candidate
 *   POST {base}/candidates/export       { steps, filters, sort }              -> { items: Candidate[] }
 *
 * Sign-in: the request carries the browser's cookies (credentials: 'include'); no keys or tokens live in this code.
 */
export function createHttpApi(baseUrl: string, fetchImpl: typeof fetch = (...args) => fetch(...args)): CandidateApi {
  const base = baseUrl.replace(/\/+$/, '');

  async function request<T>(path: string, body?: unknown): Promise<T> {
    let res: Response;
    try {
      res = await fetchImpl(`${base}${path}`, {
        method: body === undefined ? 'GET' : 'POST',
        credentials: 'include',
        headers: body === undefined ? { Accept: 'application/json' } : { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch (e) {
      throw new ApiError(e instanceof Error ? e.message : 'Network error', 0);
    }
    if (!res.ok) throw new ApiError(`${res.status} ${res.statusText} for ${path}`, res.status);
    return (await res.json()) as T;
  }

  return {
    warmUp: async () => {},
    countCandidates: async (query) => (await request<{ count: number }>('/candidates/count', query)).count,
    countSteps: async (steps) => (await request<{ counts: number[] }>('/candidates/count-steps', { steps })).counts,
    searchCandidates: (query, page) => request<CandidatePage>('/candidates/search', { ...query, ...page }),
    getCv: (id) => request<Candidate>(`/candidates/${encodeURIComponent(id)}`),
    exportCandidates: async (query) => (await request<{ items: Candidate[] }>('/candidates/export', query)).items,
  };
}
