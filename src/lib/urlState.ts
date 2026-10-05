import { SORT_KEYS, type Filters, type Screen, type SortKey } from '../types';
import { sanitizeFilters } from './filters';

/**
 * Search state <-> URL query string, so a search can be shared, refreshed, and stepped through with Back / Forward.
 *   ?s=<locked step 1>&s=<locked step 2>&f=<current filters>&sort=new&v=results
 * v=results: the split view (results) for the first step; with locked steps it is always the split view.
 * Each step is "key.value~key.value", lists joined with ",", e.g. f=ind.financial~gs.A,B~age.d40
 * Majors per degree: dm.Master's:engineering,PhD:science. GPA in tenths: gpa.30 = 3.0 or higher.
 * Decoding never trusts the link: everything goes through sanitizeFilters.
 */

type ListKey = 'genders' | 'seniority' | 'industries' | 'positions' | 'gaishiScores' | 'degrees' | 'schoolRatings' | 'qualifications';
type TextKey = 'lastName' | 'firstName' | 'currentCompany' | 'schoolName' | 'qualText';
type ChoiceKey = 'foreign' | 'englishMin' | 'japaneseMin' | 'overseas';

const LISTS: [string, ListKey][] = [
  ['g', 'genders'],
  ['sen', 'seniority'],
  ['ind', 'industries'],
  ['pos', 'positions'],
  ['gs', 'gaishiScores'],
  ['deg', 'degrees'],
  // "cls" from when it was called school class, so older links still open.
  ['cls', 'schoolRatings'],
  ['q', 'qualifications'],
];
const TEXTS: [string, TextKey][] = [
  ['ln', 'lastName'],
  ['fn', 'firstName'],
  ['cc', 'currentCompany'],
  ['sch', 'schoolName'],
  ['qt', 'qualText'],
];
const CHOICES: [string, ChoiceKey][] = [
  ['fc', 'foreign'],
  ['en', 'englishMin'],
  ['ja', 'japaneseMin'],
  ['ov', 'overseas'],
];

// Values may contain any character; escape the separators we use.
const enc = (v: string) => encodeURIComponent(v).replace(/~/g, '%7E').replace(/\./g, '%2E');
const dec = (v: string) => {
  try {
    return decodeURIComponent(v);
  } catch {
    return '';
  }
};

export function encodeFilters(f: Filters): string {
  const parts: string[] = [];
  for (const [k, field] of TEXTS) if (f[field].trim()) parts.push(`${k}.${enc(f[field].trim())}`);
  const prev = f.previousCompanies.map((p) => p.trim()).filter(Boolean);
  if (prev.length) parts.push(`pc.${prev.map(enc).join(',')}`);
  if (f.ageMode === 'decades' && f.decades.length) parts.push(`age.d${f.decades.join(',')}`);
  if (f.ageMode === 'range') parts.push(`age.r${f.ageMin}-${f.ageMax}`);
  for (const [k, field] of LISTS) if (f[field].length) parts.push(`${k}.${(f[field] as string[]).map(enc).join(',')}`);
  for (const [k, field] of CHOICES) if (f[field] !== 'any') parts.push(`${k}.${enc(f[field])}`);
  const majors = f.degrees.flatMap((d) => (f.majorFor[d] ? [`${enc(d)}:${f.majorFor[d]}`] : []));
  if (majors.length) parts.push(`dm.${majors.join(',')}`);
  if (f.toeic !== null) parts.push(`toeic.${f.toeic}`);
  if (f.jlpt) parts.push(`jlpt.${f.jlpt}`);
  if (f.gpaMin) parts.push(`gpa.${Math.round(f.gpaMin * 10)}`);
  if (f.optional.length) parts.push(`opt.${f.optional.join(',')}`);
  return parts.join('~');
}

export function decodeFilters(s: string): Filters {
  const raw: Record<string, unknown> = {};
  for (const part of s.split('~')) {
    const dot = part.indexOf('.');
    if (dot < 1) continue;
    const k = part.slice(0, dot);
    const v = part.slice(dot + 1);
    const text = TEXTS.find(([key]) => key === k);
    const list = LISTS.find(([key]) => key === k);
    const choice = CHOICES.find(([key]) => key === k);
    if (text) raw[text[1]] = dec(v);
    else if (list) raw[list[1]] = v.split(',').map(dec).filter(Boolean);
    else if (choice) raw[choice[1]] = dec(v);
    else if (k === 'pc') raw.previousCompanies = v.split(',').map(dec).filter(Boolean);
    else if (k === 'dm') raw.majorFor = Object.fromEntries(v.split(',').map((pair) => [dec(pair.split(':')[0]), pair.split(':')[1]]));
    else if (k === 'toeic') raw.toeic = Number(v);
    else if (k === 'jlpt') raw.jlpt = v;
    else if (k === 'gpa') raw.gpaMin = Number(v) / 10;
    else if (k === 'opt') raw.optional = v.split(',');
    else if (k === 'age' && v.startsWith('d')) Object.assign(raw, { ageMode: 'decades', decades: v.slice(1).split(',').map(Number) });
    else if (k === 'age' && v.startsWith('r')) {
      const [lo, hi] = v.slice(1).split('-').map(Number);
      Object.assign(raw, { ageMode: 'range', ageMin: lo, ageMax: hi });
    }
  }
  return sanitizeFilters(raw);
}

export interface UrlSearchState {
  steps: Filters[];
  draft: Filters;
  sort: SortKey;
  /** Full-screen search, or the split view with results. */
  screen: Screen;
}

export function readSearchState(search = window.location.search): UrlSearchState {
  const params = new URLSearchParams(search);
  const sort = params.get('sort');
  return {
    steps: params.getAll('s').map(decodeFilters),
    draft: decodeFilters(params.get('f') ?? ''),
    sort: (SORT_KEYS as readonly (string | null)[]).includes(sort) ? (sort as SortKey) : 'best',
    screen: params.get('v') === 'results' || params.has('s') ? 'results' : 'search',
  };
}

export function searchStateUrl({ steps, draft, sort, screen }: UrlSearchState, path: string, hash: string): string {
  const params = new URLSearchParams();
  for (const s of steps) params.append('s', encodeFilters(s));
  const f = encodeFilters(draft);
  if (f) params.set('f', f);
  if (sort !== 'best') params.set('sort', sort);
  if (screen === 'results' && !steps.length) params.set('v', 'results');
  const qs = params.toString();
  return `${path}${qs ? `?${qs}` : ''}${hash}`;
}

/**
 * Keep the URL in step with the search. 'push' (a new search step, showing results, jumping back) adds a history
 * entry so Back returns to it; 'replace' (ticking a filter) does not, so Back is not flooded with every click.
 */
export function writeSearchState(state: UrlSearchState, mode: 'push' | 'replace'): void {
  const { pathname, search, hash } = window.location;
  const url = searchStateUrl(state, pathname, hash);
  if (url === `${pathname}${search}${hash}`) return;
  if (mode === 'push') window.history.pushState(null, '', url);
  else window.history.replaceState(null, '', url);
}
