import { CONFIG } from '../config';
import {
  AGE_MAX,
  AGE_MIN,
  DECADES,
  DEGREES,
  DEGREES_WITH_MAJOR,
  FILTER_GENDERS,
  FOREIGN_FILTERS,
  GAISHI_SCORES,
  GPA_MAX,
  INDUSTRIES,
  JLPT_LEVELS,
  LEVELS,
  MAJORS,
  OVERSEAS_FILTERS,
  POSITIONS,
  QUALIFICATIONS,
  ROW_KEYS,
  SCHOOL_RATINGS,
  SENIORITIES,
  type Degree,
  type Filters,
  type LevelFilter,
  type Major,
  type RowKey,
} from '../types';
import { JLPT_LEVEL, TOEIC_MAX, TOEIC_MIN, toeicLevel } from './languageTests';

export function emptyFilters(): Filters {
  return {
    lastName: '',
    firstName: '',
    currentCompany: '',
    previousCompanies: [''],
    ageMode: 'any',
    decades: [],
    ageMin: AGE_MIN,
    ageMax: AGE_MAX,
    genders: [],
    seniority: [],
    industries: [],
    positions: [],
    gaishiScores: [],
    foreign: 'any',
    englishMin: 'any',
    toeic: null,
    japaneseMin: 'any',
    jlpt: null,
    overseas: 'any',
    degrees: [],
    majorFor: {},
    schoolRatings: [],
    gpaMin: null,
    qualifications: [],
    qualText: '',
    schoolName: '',
    optional: [],
  };
}

export const cloneFilters = (f: Filters): Filters => structuredClone(f);

// ---------- sanitising: links, saved and recent searches can hold anything ----------

const isRecord = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const oneOf = <T extends string>(list: readonly T[], v: unknown, fallback: T): T =>
  (list as readonly unknown[]).includes(v) ? (v as T) : fallback;
const text = (v: unknown) => (typeof v === 'string' ? v.slice(0, CONFIG.textInputMaxLength) : '');
/** Known values only, each once, in the list's own order. */
const subset = <T extends string>(list: readonly T[], v: unknown): T[] => (Array.isArray(v) ? list.filter((x) => v.includes(x)) : []);
const LEVEL_FILTERS: readonly LevelFilter[] = ['any', ...LEVELS];

/**
 * Any stored or shared filters (a link, a saved search from an older version, hand-edited storage) as valid Filters:
 * unknown values are dropped, numbers are range-checked, and a TOEIC score or JLPT level that does not match its
 * language level is cleared. Also moves "school class" (older versions) to "school rating".
 */
export function sanitizeFilters(input: unknown): Filters {
  const f = emptyFilters();
  if (!isRecord(input)) return f;
  const v = input;

  f.lastName = text(v.lastName);
  f.firstName = text(v.firstName);
  f.currentCompany = text(v.currentCompany);
  f.schoolName = text(v.schoolName);
  f.qualText = text(v.qualText);
  const previous = Array.isArray(v.previousCompanies) ? v.previousCompanies.map(text).slice(0, CONFIG.maxPreviousCompanies) : [];
  f.previousCompanies = previous.length ? previous : [''];

  // Age: decades must be known and form one continuous range (gaps are filled, as the decade buttons do); a typed
  // range must be whole years inside 20-69 (the full range means "any").
  if (v.ageMode === 'decades') {
    const picked = DECADES.filter((d) => Array.isArray(v.decades) && v.decades.includes(d));
    const decades = picked.length ? DECADES.filter((d) => d >= picked[0] && d <= picked[picked.length - 1]) : [];
    if (decades.length) Object.assign(f, { ageMode: 'decades', decades, ageMin: decades[0], ageMax: decades[decades.length - 1] + 9 });
  } else if (v.ageMode === 'range') {
    const lo = Number(v.ageMin);
    const hi = Number(v.ageMax);
    const ok = Number.isInteger(lo) && Number.isInteger(hi) && lo >= AGE_MIN && hi <= AGE_MAX && lo <= hi;
    if (ok && !(lo === AGE_MIN && hi === AGE_MAX)) Object.assign(f, { ageMode: 'range', ageMin: lo, ageMax: hi });
  }

  f.genders = subset(FILTER_GENDERS, v.genders);
  f.seniority = subset(SENIORITIES, v.seniority);
  f.industries = subset(INDUSTRIES, v.industries);
  f.positions = subset(POSITIONS, v.positions);
  f.gaishiScores = subset(GAISHI_SCORES, v.gaishiScores);
  f.foreign = oneOf(FOREIGN_FILTERS, v.foreign, 'any');
  f.overseas = oneOf(OVERSEAS_FILTERS, v.overseas, 'any');
  f.englishMin = oneOf(LEVEL_FILTERS, v.englishMin, 'any');
  f.japaneseMin = oneOf(LEVEL_FILTERS, v.japaneseMin, 'any');

  const toeic = Number(v.toeic);
  if (v.toeic !== null && Number.isInteger(toeic) && toeic >= TOEIC_MIN && toeic <= TOEIC_MAX && toeicLevel(toeic) === f.englishMin)
    f.toeic = toeic;
  const jlpt = oneOf([...JLPT_LEVELS, ''], v.jlpt, '');
  if (jlpt && JLPT_LEVEL[jlpt] === f.japaneseMin) f.jlpt = jlpt;

  f.degrees = subset(DEGREES, v.degrees);
  if (isRecord(v.majorFor))
    for (const d of DEGREES_WITH_MAJOR) {
      const m = v.majorFor[d];
      if (f.degrees.includes(d) && (MAJORS as readonly unknown[]).includes(m)) f.majorFor[d] = m as Major;
    }
  f.schoolRatings = subset(SCHOOL_RATINGS, v.schoolRatings ?? v.schoolClasses);
  const gpa = Number(v.gpaMin);
  if (v.gpaMin !== null && Number.isFinite(gpa) && gpa > 0 && gpa <= GPA_MAX) f.gpaMin = Math.round(gpa * 10) / 10;
  f.qualifications = subset(QUALIFICATIONS, v.qualifications);

  const optional = Array.isArray(v.optional) ? v.optional.map((r) => (r === 'schoolClass' ? 'schoolRating' : r)) : [];
  f.optional = subset(ROW_KEYS, optional);
  return f;
}

// ---------- which rows are in use ----------

const filled = (s: string) => s.trim() !== '';

/** The filter rows that have something chosen, in panel order. Rows left empty do not filter. */
export function activeRowKeys(f: Filters): RowKey[] {
  const on: Record<RowKey, boolean> = {
    name: filled(f.lastName) || filled(f.firstName),
    company: filled(f.currentCompany) || f.previousCompanies.some(filled),
    age: (f.ageMode === 'decades' && f.decades.length > 0) || f.ageMode === 'range',
    gender: f.genders.length > 0,
    seniority: f.seniority.length > 0,
    industry: f.industries.length > 0,
    position: f.positions.length > 0,
    gaishi: f.gaishiScores.length > 0,
    foreign: f.foreign !== 'any',
    english: f.englishMin !== 'any',
    japanese: f.japaneseMin !== 'any',
    overseas: f.overseas !== 'any',
    degree: f.degrees.length > 0,
    schoolRating: f.schoolRatings.length > 0,
    gpa: f.gpaMin !== null && f.gpaMin > 0,
    qualification: f.qualifications.length > 0 || filled(f.qualText),
    school: filled(f.schoolName),
  };
  return ROW_KEYS.filter((k) => on[k]);
}

/** True when at least one row filters (an unticked Required box on an empty row does not count). */
export const hasActiveFilters = (f: Filters) => activeRowKeys(f).length > 0;

/** Nice-to-have rows in use over all steps: they rank results under Best CVs. */
export const niceRowCount = (steps: Filters[]) =>
  steps.reduce((n, f) => n + activeRowKeys(f).filter((k) => f.optional.includes(k)).length, 0);

/** With the gender filter switched off in Admin, any gender choice is ignored, including in saved searches. */
export const applyGenderSetting = (f: Filters, showGender: boolean): Filters =>
  showGender || !f.genders.length ? f : { ...f, genders: [] };

/** Drop a degree and the major picked for it. */
export function withoutDegree(f: Filters, d: Degree): Filters {
  const majorFor = { ...f.majorFor };
  delete majorFor[d];
  return { ...f, degrees: f.degrees.filter((x) => x !== d), majorFor };
}
