# Resume Finder

Candidate search module for Resume Studio (Kenja × Robert Walters Japan), with the Upload Resume, Dashboard, Assignment,
Analytics and Admin pages.
React 19 + TypeScript (strict) + Vite + Tailwind CSS 4. Runs on built-in sample data (4,860 invented candidates, seeded so
they are the same on every load) until a backend is connected.

## Setup

Requires Node 20 or newer.

```bash
npm install
cp .env.example .env.local   # optional: only needed to point at a real backend
npm run dev                  # http://localhost:5173
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server with hot reload |
| `npm run build` | Type-check, then build a static site into `dist/` (relative paths: works on any static host) |
| `npm run preview` | Serve the built site locally |
| `npm run lint` | ESLint (TypeScript, React, React Hooks, jsx-a11y) with zero warnings allowed, then Prettier check |
| `npm run format` | Format everything with Prettier |
| `npm run test` | Unit and component tests (Vitest + React Testing Library) |
| `npm run test:watch` | Tests in watch mode |
| `npm run typecheck` | TypeScript only |

Deploy: any static host (Netlify, Vercel, Render) with build command `npm run build` and publish directory `dist`. Set
`VITE_API_BASE_URL` in the host's environment settings to use a real backend.

## Folder structure

```
src/
  main.tsx              Start-up: get the API ready, then render <Root />
  Root.tsx              Providers (i18n, error boundary, settings, saved searches, search state) around <App />
  App.tsx               Page switching (#/search, #/upload, #/dashboard, #/assignment, #/analytics, #/admin)
  config.ts             Tunable numbers (debounce, list sizes, fit scale...) and the API URL from the environment
  types/                Shared types: candidate, filters, search (queries, pages, saved searches), studio/admin
  i18n/                 en.ts and ja.ts (every visible word), formatting, provider and useI18n hook
  styles/index.css      Colour tokens (light and dark), density, label grid
  lib/                  Pure logic, no React:
    api.ts                The one data door: picks the HTTP client or the mock
    apiContract.ts        CandidateApi interface and ApiError
    httpApi.ts            Real backend client (endpoints documented in the file)
    mockApi.ts            Mock backend over the sample data (loaded only when no backend is set)
    mock/candidates.ts    Sample data generator
    searchEngine.ts       Reference search rules (filters, steps, nice-to-have ranking, sorting)
    filters.ts            Empty filters, sanitising untrusted filters, active rows
    ageRange.ts gaishi.ts gpa.ts languageTests.ts qualifications.ts   Domain rules
    urlState.ts savedSearches.ts recentSearches.ts viewPrefs.ts settings.ts storage.ts   Persistence (safe storage)
    describe.ts jdParser.ts exportCsv.ts   Chips and names, job description parser, CSV
    assignment.ts         Assignment page rules: status (red / orange / green), views, filters, search, assign, reassign
    assignmentMock.ts     Assignment page sample data: recruiters, ~30 candidates, open times, the demo clock
  hooks/                useApiQuery, useLiveFilters, useFitBoxes, useDebouncedCommit, useToast, useTheme...
  components/           Shared UI, one component per file: Toggle, Segmented, Chip, CheckTile, FilterRow, Modal,
                        InfoPopover, ErrorBoundary, MenuBar, icons/...
  features/
    search/             Resume Finder: SearchPage, state/ (reducer, providers), filters/ (panel, rows, age),
                        results/ (pane, cards, chips, trail), cv/, side/ (left column, phone sheet), dialogs/, jd/
    shell/              Top bar
    settings/           Admin settings context
    upload/ dashboard/ admin/ studio/   Resume Studio pages and their shared pieces
    assignment/         Assignment page: sidebar (count, view switch, status), table and row, Assign box, Reassign and
                        Schedule dialogs, progress steps, status tag
    analytics/          Analytics placeholder ("Coming soon")
  test/                 Test setup, fixtures and the main-flow test
```

## How the data flows

```
components ──> hooks (useApiQuery: latest answer wins, last answer shown while loading, retry on error)
                 │
                 ▼
             lib/api.ts ──> httpApi.ts  (VITE_API_BASE_URL set)
                       └──> mockApi.ts  (otherwise: sample data + lib/searchEngine.ts in the browser)
```

The search itself (locked steps, the step being edited, sort, screen, undo history) is one pure reducer,
`features/search/state/searchReducer.ts`, provided through `SearchProvider`. Components read it with `useSearch()`, or
`useSearchActions()` when they only need the (stable) actions. The URL mirrors the search, so a search can be shared,
refreshed, and stepped through with the browser's Back and Forward buttons. Every link, saved search and recent search
goes through `sanitizeFilters` before use, so hand-edited or old data cannot break the page.

## Connecting the backend (for Deepanker)

1. Set `VITE_API_BASE_URL` (in `.env.local` for development, or in the host's settings for a deployment).
2. Make the server answer the endpoints listed at the top of `src/lib/httpApi.ts`:

   | Endpoint | Body | Answer |
   | --- | --- | --- |
   | `POST /candidates/count` | `{ steps, filters }` | `{ count }` |
   | `POST /candidates/count-steps` | `{ steps }` | `{ counts }` (index 0 = everyone) |
   | `POST /candidates/search` | `{ steps, filters, sort, offset, limit }` | `CandidatePage` (`types/search.ts`) |
   | `GET /candidates/{id}` |  | `Candidate` (`types/candidate.ts`) |
   | `POST /candidates/export` | `{ steps, filters, sort }` | `{ items: Candidate[] }` |

3. Filters arrive exactly as the UI holds them (`types/filters.ts`). `src/lib/searchEngine.ts` and its tests
   (`searchEngine.test.ts`) are the reference for what each filter means; match them so counts agree.
4. Requests send cookies (`credentials: 'include'`). Do not put API keys in the frontend: every `VITE_` variable is
   public.

Nothing in `components/` or `features/` needs to change. `parseJobDescription` in `lib/jdParser.ts` returns
`{ patch, filled }`; its body can be swapped for an AI call that returns the same shape.

## Assignment page (proof of concept)

`#/assignment`, from the Assignment button in the top bar. UI only: sample data, no emails, no calendar invites.
Assign, Reassign and Schedule change the page's own copy of the data instantly; leaving the page puts the sample data
back.

- Three views share one table: My assignments (rows assigned to, or handed on by, Takeshi Kondo, the signed-in
  recruiter), Finance hiring team, and All Robert Walters (every new resume, including the pool).
- Status: Hired once all five steps are done; Reassigned (orange) until the next recruiter does a step; Unassigned while
  in the pool; Not acted on (red) when assigned at least `CONFIG.assignmentReturnHours` (48) hours ago with no step
  done; otherwise In progress.
- Statuses are worked out against a fixed demo clock (`ASSIGNMENT_NOW`, 5 Oct 2026 21:00 JST), so the red rows stay red
  whenever the demo runs. The return to the pool after 48 hours is shown as text only.
- Every number on the page (count card, status counts, "4 open", "Showing 8 of 30") is counted from the sample rows, so
  they agree with the table and change as people assign and reassign.
- To connect a backend: replace `sampleAssignments()`, `RECRUITERS` and `OPEN_TIMES` in `lib/assignmentMock.ts`, and call
  the server from the three actions in `features/assignment/useAssignments.ts`. The rules in `lib/assignment.ts` and their
  tests (`assignment.test.ts`) say what each status means.

## Search rules

- Within one row, ticked choices join with OR; different rows join with AND; an empty row does not filter.
- A row with its Required box unticked is nice to have: nobody is left out, and candidates who match more nice-to-haves
  rank first under Best CVs.
- English level and Japanese level mean "this level or higher". A TOEIC score only sets the English level (under 400
  Basic, 400-599 Conversational, 600-779 Business, 780+ Fluent; never Native). A JLPT level only sets the Japanese level
  (N5, N4 Basic; N3 Conversational; N2 Business; N1 Fluent; native speakers have no JLPT), and picking a level lights
  the matching JLPT. Typed numbers apply after a short pause; numbers outside their range are refused with a message.
- Degree: a candidate matches a ticked degree when they hold it and, if a major is picked, that major for that same
  degree. School rating and school name match any of the candidate's schools.
- GPA compares the candidate's best GPA normalised to 4.0 (GPA / scale x 4, capped at 4.0); candidates with no GPA drop
  out when a minimum is set.
- Other qualifications: any ticked one, or the typed text found in any qualification (English or Japanese names).
- Every filled previous-company box must match one of the candidate's previous companies.
- A search step is its filters applied to the previous step's results.
- "Best CVs" is a placeholder rank (gaishi score, best school rating, seniority, CV date).

## Quality

- TypeScript strict, no `any`. ESLint (typescript-eslint, react, react-hooks, jsx-a11y) and Prettier pass with zero
  warnings; `react/jsx-no-literals` keeps every visible word in `i18n/`.
- Tests: rules (OR / AND, at-least levels, degree + major, GPA, qualifications), age range and decade lighting, gaishi
  score, TOEIC / JLPT mapping, steps and undo (reducer), URL and saved-search serialisation, sanitising, the mock API,
  the job description parser, and the main flow in React Testing Library.
- Accessibility: keyboard everywhere (menu bar and tabs with arrow keys), visible focus ring, `aria-pressed` on toggles,
  labelled inputs, dialogs trap focus and close on Esc, colour contrast checked against WCAG AA in light and dark.
- Performance: results are fetched and rendered one page at a time; filter rows are memoised and get stable callbacks;
  typing is debounced; the CV preview, job description panel, Japanese labels, the other pages and the mock data load on
  demand.
- An error boundary shows a friendly page instead of a blank screen; all browser storage goes through `lib/storage.ts`
  (works in private windows and when storage is blocked).

TypeScript is pinned to 6.0: typescript-eslint does not support TypeScript 7 yet.

## Assumptions to confirm with Ted / Aaron

- Gender filter shows Male / Female only; "not stated" candidates drop out when either is ticked. Admin can switch the
  filter off per country; it is then ignored everywhere.
- "Worked at a foreign company" counts the current company too.
- "Edit filters" edits the last step; earlier steps stay as they are.
- School ratings, lists and Japanese labels are drafts (Japanese needs a native check). Older saved searches and links
  that used "school class" still open as school rating.
- The Gaishi score is made of English, foreign companies and time overseas; Japanese is shown with its parts but does
  not count towards it.
