import type { Candidate, CandidatePage, CountQuery, Filters, PageRequest, SearchQuery } from '../types';

/**
 * The one door between the UI and candidate data. Components and hooks only call `api`; they never read the sample
 * data or the search engine directly. To connect the real backend, set VITE_API_BASE_URL (see .env.example) and
 * make the server answer the endpoints in lib/httpApi.ts; nothing in the components changes.
 */
export interface CandidateApi {
  /** Ready to answer (mock: builds the sample data and indexes). Called once before the first render. */
  warmUp(): Promise<void>;
  /** How many candidates match the locked steps and then the current filters. */
  countCandidates(query: CountQuery): Promise<number>;
  /** Counts for the search trail: index 0 is everyone, index i+1 is after locked step i. */
  countSteps(steps: Filters[]): Promise<number[]>;
  /** One page of sorted results. */
  searchCandidates(query: SearchQuery, page: PageRequest): Promise<CandidatePage>;
  /** The full CV for the preview. */
  getCv(id: string): Promise<Candidate>;
  /** Every result in order, for File > Export results (CSV). */
  exportCandidates(query: SearchQuery): Promise<Candidate[]>;
}

/** Raised when the backend answers with an error (or not at all). */
export class ApiError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}
