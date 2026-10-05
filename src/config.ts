/**
 * Tunable numbers in one place. Domain rules (TOEIC bands, GPA scale, gaishi points) live next to their logic in lib/.
 * Environment settings come from Vite env variables (see .env.example).
 */
export const CONFIG = {
  /** Typing in a text box applies this long after the last key press. */
  textDebounceMs: 250,
  /** Changes to one box (or one slider drag) within this time count as one step for "Undo last filter". */
  undoMergeMs: 1500,
  /** How many earlier versions "Undo last filter" keeps. */
  undoKeep: 50,
  /** How long a confirmation toast stays on screen. */
  toastMs: 2600,
  /** Desktop layout (full-screen search beside saved searches; split view with the filter side panel). */
  desktopQuery: '(min-width: 1024px)',
  /** Saved and recent searches listed in the left column before "Show all". */
  sideListMax: 4,
  /** Recent searches kept in this browser. */
  recentKeep: 8,
  /** Previous-company boxes (more would not fit the screen). */
  maxPreviousCompanies: 3,
  /** Smallest scale the filter boxes shrink to on short screens before scrolling inside. */
  fitMinScale: 0.72,
  /** Results grid: gap between cards and the narrowest a column may get before dropping to fewer columns. */
  resultsGap: 10,
  minTileWidth: 280,
  /** Room kept for the "+N more" button after the active-filter chips. */
  chipMoreWidth: 84,
  /** Longest saved-search name and text-box entry. */
  searchNameMaxLength: 80,
  textInputMaxLength: 120,
  /** Undo message on the dashboard after deleting a conversion. */
  undoNoticeMs: 6000,
  /** Admin notices. */
  noticeMs: 4000,
  /** Assignment page: an assigned candidate with no step done after this long turns red and returns to the pool. */
  assignmentReturnHours: 48,
  /** Assignment page: rows per page (8 fit one 1440 x 900 screen). */
  assignmentPageSize: 8,
} as const;

/** Where the candidate API lives. Empty: the built-in mock data (see lib/api.ts). */
export const API_BASE_URL: string = (import.meta.env.VITE_API_BASE_URL ?? '').trim();
