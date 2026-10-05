import { useApiQuery } from '../../hooks/useApiQuery';
import { api } from '../../lib/api';
import type { Filters } from '../../types';

/**
 * The live count (locked steps, then the current filters) and the trail's counts after each locked step, from the
 * API. While a new count loads, the previous one stays on screen; `undefined` only before the very first answer.
 */
export function useSearchCounts(steps: Filters[], filters: Filters) {
  const stepsKey = JSON.stringify(steps);
  const count = useApiQuery(`count|${stepsKey}|${JSON.stringify(filters)}`, () => api.countCandidates({ steps, filters }));
  const stepCounts = useApiQuery(`steps|${stepsKey}`, () => api.countSteps(steps));
  return { count: count.data, countError: count.error, retryCount: count.retry, stepCounts: stepCounts.data };
}
