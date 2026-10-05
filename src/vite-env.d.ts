/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the candidate API, e.g. https://api.example.com/resume-finder. Empty = built-in mock data. */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
