import type { Dict } from '../i18n/en';
import { DEGREES, GAISHI_SCORES, QUALIFICATIONS, SENIORITIES, type AgeFields, type Filters, type RowKey, type SavedSearch } from '../types';
import { ANY_AGE } from './ageRange';
import { withoutDegree } from './filters';

/** Human-readable descriptions of filters: chips, summaries, suggested names. */

/** Caption under the age slider: "Any age" | "30s, 40s" | "Ages 35 to 44". */
export function ageCaption(f: AgeFields, t: Dict): string {
  if (f.ageMode === 'decades' && f.decades.length)
    return [...f.decades]
      .sort((a, b) => a - b)
      .map(t.decade)
      .join(', ');
  if (f.ageMode === 'range') return t.ageRange(f.ageMin, f.ageMax);
  return t.anyAge;
}

export interface ActiveChip {
  id: string;
  label: string;
  /** The filter row it belongs to (to show it as required or nice to have). */
  row: RowKey;
}

/** One chip per ticked choice, in panel order (Candidate, Role, Gaishi fit, Education). */
export function activeChips(f: Filters, t: Dict): ActiveChip[] {
  const out: ActiveChip[] = [];
  const s = (v: string) => v.trim();
  const add = (id: string, label: string, row: RowKey) => out.push({ id, label, row });

  if (s(f.lastName)) add('last', t.chip.last(s(f.lastName)), 'name');
  if (s(f.firstName)) add('first', t.chip.first(s(f.firstName)), 'name');
  if (s(f.currentCompany)) add('current', t.chip.current(s(f.currentCompany)), 'company');
  f.previousCompanies.forEach((p, i) => {
    if (s(p)) add(`prev-${i}`, t.chip.previous(s(p)), 'company');
  });
  if ((f.ageMode === 'decades' && f.decades.length) || f.ageMode === 'range') add('age', ageCaption(f, t), 'age');
  for (const g of f.genders) add(`g-${g}`, t.gender[g], 'gender');
  for (const k of SENIORITIES) if (f.seniority.includes(k)) add(`s-${k}`, t.seniorityShort[k], 'seniority');
  for (const i of f.industries) add(`i-${i}`, t.industry[i], 'industry');
  for (const p of f.positions) add(`p-${p}`, t.position[p], 'position');
  for (const g of GAISHI_SCORES) if (f.gaishiScores.includes(g)) add(`gs-${g}`, t.chip.gaishi(g), 'gaishi');
  if (f.englishMin !== 'any') add('en', t.chip.english(f.englishMin, f.toeic), 'english');
  if (f.japaneseMin !== 'any') add('ja', t.chip.japanese(f.japaneseMin, f.jlpt), 'japanese');
  if (f.overseas !== 'any') add('overseas', t.chip.overseas(f.overseas), 'overseas');
  if (f.foreign !== 'any') add('foreign', t.chip.foreign(f.foreign), 'foreign');
  for (const d of DEGREES) if (f.degrees.includes(d)) add(`d-${d}`, t.chip.degree(d, f.majorFor[d]), 'degree');
  for (const r of f.schoolRatings) add(`r-${r}`, t.chip.schoolRating(r), 'schoolRating');
  if (f.gpaMin) add('gpa', t.chip.gpa(f.gpaMin), 'gpa');
  for (const q of QUALIFICATIONS) if (f.qualifications.includes(q)) add(`q-${q}`, t.qualification[q], 'qualification');
  if (s(f.qualText)) add('qt', t.chip.qualText(s(f.qualText)), 'qualification');
  if (s(f.schoolName)) add('school', t.chip.school(s(f.schoolName)), 'school');
  return out;
}

/** The filters with one chip removed (see activeChips for the ids). Unknown ids change nothing. */
export function removeChip(f: Filters, id: string): Filters {
  const dash = id.indexOf('-');
  const prefix = dash < 0 ? id : id.slice(0, dash);
  const value = dash < 0 ? '' : id.slice(dash + 1);
  const without = <T>(arr: T[]) => arr.filter((x) => String(x) !== value);
  switch (prefix) {
    case 'last':
      return { ...f, lastName: '' };
    case 'first':
      return { ...f, firstName: '' };
    case 'current':
      return { ...f, currentCompany: '' };
    case 'prev': {
      // Extra boxes go away; the first box is just emptied.
      const i = Number(value);
      return { ...f, previousCompanies: i === 0 ? ['', ...f.previousCompanies.slice(1)] : f.previousCompanies.filter((_, j) => j !== i) };
    }
    case 'age':
      return { ...f, ...ANY_AGE };
    case 'g':
      return { ...f, genders: without(f.genders) };
    case 's':
      return { ...f, seniority: without(f.seniority) };
    case 'i':
      return { ...f, industries: without(f.industries) };
    case 'p':
      return { ...f, positions: without(f.positions) };
    case 'gs':
      return { ...f, gaishiScores: without(f.gaishiScores) };
    // A level chip also clears the TOEIC score or JLPT level that set it.
    case 'en':
      return { ...f, englishMin: 'any', toeic: null };
    case 'ja':
      return { ...f, japaneseMin: 'any', jlpt: null };
    case 'overseas':
      return { ...f, overseas: 'any' };
    case 'foreign':
      return { ...f, foreign: 'any' };
    case 'd': {
      const d = DEGREES.find((x) => x === value);
      return d ? withoutDegree(f, d) : f;
    }
    case 'r':
      return { ...f, schoolRatings: without(f.schoolRatings) };
    case 'gpa':
      return { ...f, gpaMin: null };
    case 'q':
      return { ...f, qualifications: without(f.qualifications) };
    case 'qt':
      return { ...f, qualText: '' };
    case 'school':
      return { ...f, schoolName: '' };
    default:
      return f;
  }
}

/** Short chip labels for one step, in panel order. */
export const filterChips = (f: Filters, t: Dict): string[] => activeChips(f, t).map((c) => c.label);

export const countActiveFilters = (f: Filters, t: Dict) => activeChips(f, t).length;

/** One-line summary in the saved-searches lists. */
export function savedSummary(s: Pick<SavedSearch, 'steps'>, t: Dict): string {
  if (s.steps.length > 1) return t.searchesInRow(s.steps.length);
  const chips = s.steps[0] ? filterChips(s.steps[0], t) : [];
  if (!chips.length) return t.chip.none;
  return chips.length > 4 ? `${chips.slice(0, 4).join(', ')} …` : chips.join(', ');
}

/** Suggest a name such as "Finance sector managers" from the filters of all steps. */
export function suggestName(steps: Filters[], t: Dict): string {
  const n = t.nameParts;
  const industries = steps.flatMap((f) => f.industries);
  const positions = steps.flatMap((f) => f.positions);
  const seniority = SENIORITIES.filter((k) => steps.some((f) => f.seniority.includes(k)));
  const decades = [...new Set(steps.flatMap((f) => (f.ageMode === 'decades' ? f.decades : [])))];
  const bilingual = steps.some(
    (f) => ['Business', 'Fluent', 'Native'].includes(f.englishMin) || f.gaishiScores.some((g) => g === 'A' || g === 'B'),
  );

  const parts: string[] = [];
  if (bilingual) parts.push(n.bilingual);
  if (industries.length) parts.push(n.industry[industries[0]]);
  else if (positions.length) parts.push(n.position[positions[0]]);
  // "Kachō, Buchō" reads as "managers": name the most junior level ticked.
  parts.push(seniority.length ? n.seniority[seniority[0]] : n.people);
  if (decades.length === 1) parts.push(n.inTheir(decades[0]));

  if (parts.length === 1 && parts[0] === n.people) return n.fallback;
  const name = parts.join(n.join);
  return name.charAt(0).toUpperCase() + name.slice(1);
}
