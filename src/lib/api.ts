import { API_BASE_URL } from '../config';
import type { CandidateApi } from './apiContract';
import { createHttpApi } from './httpApi';

export { ApiError, type CandidateApi } from './apiContract';

/**
 * The mock (sample data + in-browser search engine) as its own chunk: fetched only when no backend is configured,
 * so a build that talks to the real API never downloads it.
 */
function lazyMockApi(): CandidateApi {
  let loading: Promise<CandidateApi> | null = null;
  const mock = () => (loading ??= import('./mockApi').then((m) => m.createMockApi()));
  return {
    warmUp: async () => (await mock()).warmUp(),
    countCandidates: async (q) => (await mock()).countCandidates(q),
    countSteps: async (steps) => (await mock()).countSteps(steps),
    searchCandidates: async (q, page) => (await mock()).searchCandidates(q, page),
    getCv: async (id) => (await mock()).getCv(id),
    exportCandidates: async (q) => (await mock()).exportCandidates(q),
  };
}

/**
 * The candidate API the app uses: the real backend when VITE_API_BASE_URL is set, otherwise the built-in mock data.
 * See lib/apiContract.ts for the functions and lib/httpApi.ts for the endpoints.
 */
export const api: CandidateApi = API_BASE_URL ? createHttpApi(API_BASE_URL) : lazyMockApi();
