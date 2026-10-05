import {
  DEGREES,
  FILTER_GENDERS,
  GAISHI_SCORES,
  INDUSTRIES,
  LEVELS,
  MAJORS,
  POSITIONS,
  QUALIFICATIONS,
  SCHOOL_RATINGS,
  SENIORITIES,
  type Candidate,
  type Filters,
  type GaishiScore,
  type RowKey,
  type SchoolRating,
  type Seniority,
  type SortKey,
} from '../types';
import { decadeOf } from './ageRange';
import { activeRowKeys } from './filters';
import { gpaHundredths, gpaOn4 } from './gpa';
import { QUAL_TERMS } from './qualifications';

/**
 * The reference search rules, as pure functions over a candidate list (no UI, no network).
 *
 * Rules: inside one row ticked choices join with OR; different rows join with AND; an empty row does not filter.
 * "At least" levels include every higher level. Text matches part of a word, ignoring case. A row marked nice to
 * have does not filter; candidates who match it rank first under Best CVs.
 *
 * Speed: each candidate's fields become small integers in typed arrays (built once per candidate list), so one pass
 * over thousands of candidates is a tight loop of array reads and bit tests. A result set is a Uint32Array of
 * indexes into the list.
 */

export interface Preferences {
  /** How many nice-to-have rows each candidate matches, indexed by candidate. */
  scores: Uint8Array;
  /** Nice-to-have rows in use. */
  total: number;
}

export interface SearchIndex {
  candidates: readonly Candidate[];
  /** Every candidate, in list order. */
  all: Uint32Array;
  /** Apply one step's required rows to a result set. */
  runFilter: (input: Uint32Array, f: Filters) => Uint32Array;
  /** Index 0 is everyone; index i+1 is step i applied to index i. */
  chainSteps: (steps: Filters[]) => Uint32Array[];
  /** Nice-to-have matches for the candidates in `set`, over all steps; null when none is used. */
  preferenceScores: (set: Uint32Array, steps: Filters[]) => Preferences | null;
  /** Best CVs (with nice-to-have matches first) or newest CV first. */
  sortResults: (set: Uint32Array, key: SortKey, prefs?: Preferences | null) => Uint32Array;
}

const NO_MAJOR = 255;
const NO_GPA = 0xffff;
const GAISHI_RANK: Record<GaishiScore, number> = { A: 0, B: 1, C: 2, D: 3 };
/** Placeholder quality order for Best CVs: overseas schools count like A. */
const RATING_RANK: Record<SchoolRating, number> = { S: 0, A: 1, Overseas: 1, B: 2, C: 3 };
const SENIORITY_RANK: Record<Seniority, number> = { Y: 0, B: 1, K: 2, 'S+': 3, S: 4 };
const GENDER_LIST = [...FILTER_GENDERS, 'not_stated'] as const;

const indexOf = <T>(list: readonly T[]) => new Map(list.map((v, i) => [v, i]));

/** Bitmask of the ticked values (bit = index in the list); 0 means "row not used". */
function mask<T>(selected: readonly T[], list: readonly T[]): number {
  let m = 0;
  for (const v of selected) {
    const i = list.indexOf(v);
    if (i >= 0) m |= 1 << i;
  }
  return m;
}

function buildColumns(list: readonly Candidate[]) {
  const n = list.length;
  const col = () => new Uint8Array(n);
  const ix = {
    age: col(),
    gender: col(),
    seniority: col(),
    industry: col(),
    position: col(),
    english: col(),
    japanese: col(),
    gaishi: col(),
    /** Bit per degree held (bit = index in DEGREES). */
    degrees: col(),
    /** Major held with each degree (index in MAJORS), NO_MAJOR when none (MBA, or degree not held). */
    majorOf: DEGREES.map(() => col().fill(NO_MAJOR)),
    /** Bit per school rating over all the candidate's schools. */
    ratings: col(),
    /** The best rating (RATING_RANK), for Best CVs. */
    bestRating: col().fill(255),
    /** Best GPA on a 4.0 scale, in hundredths (0-400); NO_GPA when none is stated. */
    gpa: new Uint16Array(n).fill(NO_GPA),
    /** Bit per qualification. */
    quals: new Uint16Array(n),
    foreign: col(),
    overseas: col(),
    /** Lower-cased copies for partial, case-insensitive text matching. */
    text: list.map((c) => ({
      last: c.lastName.toLowerCase(),
      first: c.firstName.toLowerCase(),
      current: c.currentCompany.toLowerCase(),
      prev: c.previousCompanies.map((p) => p.company.toLowerCase()),
      schools: c.education.map((e) => e.school.toLowerCase()),
      // Qualification search words in English and Japanese, so "公認会計士" or "certified public" find a CPA.
      quals: [...c.qualifications.map((q) => QUAL_TERMS[q] ?? q), ...c.otherQualifications].join('|').toLowerCase(),
    })),
  };
  const sen = indexOf(SENIORITIES);
  const ind = indexOf(INDUSTRIES);
  const pos = indexOf(POSITIONS);
  const lvl = indexOf(LEVELS);
  const gs = indexOf(GAISHI_SCORES);
  const deg = indexOf(DEGREES);
  const rat = indexOf(SCHOOL_RATINGS);
  const maj = indexOf(MAJORS);
  const qual = indexOf(QUALIFICATIONS);
  const gen = indexOf<string>(GENDER_LIST);
  list.forEach((c, i) => {
    ix.age[i] = Math.max(0, Math.min(255, c.age));
    ix.gender[i] = gen.get(c.gender) ?? 2;
    ix.seniority[i] = sen.get(c.seniority) ?? 0;
    ix.industry[i] = ind.get(c.industry) ?? 0;
    ix.position[i] = pos.get(c.position) ?? 0;
    ix.english[i] = lvl.get(c.englishLevel) ?? 0;
    ix.japanese[i] = lvl.get(c.japaneseLevel) ?? 0;
    ix.gaishi[i] = gs.get(c.gaishiScore) ?? 3;
    for (const e of c.education) {
      const d = deg.get(e.degree);
      if (d === undefined) continue;
      ix.degrees[i] |= 1 << d;
      const m = e.major ? maj.get(e.major) : undefined;
      if (m !== undefined) ix.majorOf[d][i] = m;
      const r = rat.get(e.schoolRating);
      if (r !== undefined) ix.ratings[i] |= 1 << r;
      ix.bestRating[i] = Math.min(ix.bestRating[i], RATING_RANK[e.schoolRating] ?? 255);
      const g = gpaOn4(e);
      if (g !== null) ix.gpa[i] = ix.gpa[i] === NO_GPA ? gpaHundredths(g) : Math.max(ix.gpa[i], gpaHundredths(g));
    }
    for (const q of c.qualifications) {
      const b = qual.get(q);
      if (b !== undefined) ix.quals[i] |= 1 << b;
    }
    ix.foreign[i] = Math.max(0, Math.min(255, c.foreignCompanyCount));
    ix.overseas[i] = Math.max(0, Math.min(255, c.yearsOverseas));
  });
  return ix;
}

type Columns = ReturnType<typeof buildColumns>;
type RowTest = { key: RowKey; test: (i: number) => boolean };

/** One test per filter row that has something chosen (see activeRowKeys). */
function rowTests(f: Filters, ix: Columns): RowTest[] {
  const q = (s: string) => s.trim().toLowerCase();
  const bits = (m: number, col: Uint8Array) => (i: number) => ((m >> col[i]) & 1) === 1;
  const tests: Record<RowKey, () => (i: number) => boolean> = {
    name: () => {
      const last = q(f.lastName);
      const first = q(f.firstName);
      return (i) => (!last || ix.text[i].last.includes(last)) && (!first || ix.text[i].first.includes(first));
    },
    company: () => {
      const current = q(f.currentCompany);
      // Every filled "previous company" box must match one of the candidate's previous companies.
      const prev = f.previousCompanies.map(q).filter(Boolean);
      return (i) => (!current || ix.text[i].current.includes(current)) && prev.every((p) => ix.text[i].prev.some((x) => x.includes(p)));
    },
    age: () => {
      if (f.ageMode === 'decades') {
        const decades = f.decades;
        return (i) => decades.includes(decadeOf(ix.age[i]));
      }
      const lo = f.ageMin;
      const hi = f.ageMax;
      return (i) => ix.age[i] >= lo && ix.age[i] <= hi;
    },
    gender: () => bits(mask(f.genders, GENDER_LIST), ix.gender),
    seniority: () => bits(mask(f.seniority, SENIORITIES), ix.seniority),
    industry: () => bits(mask(f.industries, INDUSTRIES), ix.industry),
    position: () => bits(mask(f.positions, POSITIONS), ix.position),
    gaishi: () => bits(mask(f.gaishiScores, GAISHI_SCORES), ix.gaishi),
    foreign: () => {
      if (f.foreign === 'never') return (i) => ix.foreign[i] === 0;
      const min = f.foreign === 'once' ? 1 : 2;
      return (i) => ix.foreign[i] >= min;
    },
    english: () => {
      const min = f.englishMin === 'any' ? 0 : LEVELS.indexOf(f.englishMin);
      return (i) => ix.english[i] >= min;
    },
    japanese: () => {
      const min = f.japaneseMin === 'any' ? 0 : LEVELS.indexOf(f.japaneseMin);
      return (i) => ix.japanese[i] >= min;
    },
    overseas: () => (f.overseas === 'yes' ? (i) => ix.overseas[i] !== 0 : (i) => ix.overseas[i] === 0),
    // Holds any ticked degree; where a major is picked for it, with that major for that same degree.
    degree: () => {
      const wanted = f.degrees.map((d) => {
        const at = DEGREES.indexOf(d);
        const major = f.majorFor[d];
        return { bit: 1 << at, majors: ix.majorOf[at], major: major ? MAJORS.indexOf(major) : -1 };
      });
      return (i) => wanted.some((w) => (ix.degrees[i] & w.bit) !== 0 && (w.major < 0 || w.majors[i] === w.major));
    },
    // Any of the candidate's schools has a ticked rating.
    schoolRating: () => {
      const m = mask(f.schoolRatings, SCHOOL_RATINGS);
      return (i) => (ix.ratings[i] & m) !== 0;
    },
    // Best GPA (normalised to 4.0) at least the minimum; candidates with no GPA on the CV drop out.
    gpa: () => {
      const min = gpaHundredths(f.gpaMin ?? 0);
      return (i) => ix.gpa[i] !== NO_GPA && ix.gpa[i] >= min;
    },
    // Any ticked qualification, or the typed text found in any qualification on the CV.
    qualification: () => {
      const m = mask(f.qualifications, QUALIFICATIONS);
      const typed = q(f.qualText);
      return (i) => (ix.quals[i] & m) !== 0 || (!!typed && ix.text[i].quals.includes(typed));
    },
    school: () => {
      const school = q(f.schoolName);
      return (i) => ix.text[i].schools.some((s) => s.includes(school));
    },
  };
  return activeRowKeys(f).map((key) => ({ key, test: tests[key]() }));
}

/** Build the indexes and sort orders for a candidate list. Done once; every search after that reuses them. */
export function createSearchIndex(list: readonly Candidate[]): SearchIndex {
  const ix = buildColumns(list);
  const all = Uint32Array.from({ length: list.length }, (_, i) => i);
  const member = new Uint8Array(list.length);

  const byDate = (a: number, b: number) =>
    list[a].cvUpdatedAt < list[b].cvUpdatedAt ? 1 : list[a].cvUpdatedAt > list[b].cvUpdatedAt ? -1 : 0;
  /** "Best CVs" is a placeholder rank: gaishi score, best school rating, seniority, then newest CV. */
  const byBest = (a: number, b: number) =>
    GAISHI_RANK[list[a].gaishiScore] - GAISHI_RANK[list[b].gaishiScore] ||
    ix.bestRating[a] - ix.bestRating[b] ||
    SENIORITY_RANK[list[a].seniority] - SENIORITY_RANK[list[b].seniority] ||
    byDate(a, b);
  // Two global orders computed once; a result set is then ordered by picking its members (O(n), no re-sorting).
  const order: Record<SortKey, Uint32Array> = { best: all.slice().sort(byBest), new: all.slice().sort(byDate) };

  const runFilter = (input: Uint32Array, f: Filters): Uint32Array => {
    const optional = new Set(f.optional);
    const tests = rowTests(f, ix)
      .filter((r) => !optional.has(r.key))
      .map((r) => r.test);
    if (!tests.length) return input;
    const out = new Uint32Array(input.length);
    let n = 0;
    next: for (let k = 0; k < input.length; k++) {
      const i = input[k];
      for (const test of tests) if (!test(i)) continue next;
      out[n++] = i;
    }
    return out.subarray(0, n);
  };

  const chainSteps = (steps: Filters[]): Uint32Array[] => {
    const out: Uint32Array[] = [all];
    for (const s of steps) out.push(runFilter(out[out.length - 1], s));
    return out;
  };

  const preferenceScores = (set: Uint32Array, steps: Filters[]): Preferences | null => {
    const tests = steps.flatMap((f) => {
      const optional = new Set(f.optional);
      return rowTests(f, ix)
        .filter((r) => optional.has(r.key))
        .map((r) => r.test);
    });
    if (!tests.length) return null;
    const scores = new Uint8Array(list.length);
    for (let k = 0; k < set.length; k++) {
      const i = set[k];
      let s = 0;
      for (const test of tests) if (test(i)) s++;
      scores[i] = s;
    }
    return { scores, total: tests.length };
  };

  const sortResults = (set: Uint32Array, key: SortKey, prefs?: Preferences | null): Uint32Array => {
    member.fill(0);
    for (let k = 0; k < set.length; k++) member[set[k]] = 1;
    const ord = order[key];
    const out = new Uint32Array(set.length);
    let n = 0;
    for (let k = 0; k < ord.length && n < set.length; k++) if (member[ord[k]]) out[n++] = ord[k];
    if (!prefs || key !== 'best') return out;
    // Stable bucket sort by nice-to-have matches, most first (keeps the usual order within each group).
    const { scores, total } = prefs;
    const starts = new Uint32Array(total + 2);
    for (let k = 0; k < out.length; k++) starts[total - scores[out[k]] + 1]++;
    for (let b = 1; b < starts.length; b++) starts[b] += starts[b - 1];
    const ranked = new Uint32Array(out.length);
    for (let k = 0; k < out.length; k++) ranked[starts[total - scores[out[k]]]++] = out[k];
    return ranked;
  };

  return { candidates: list, all, runFilter, chainSteps, preferenceScores, sortResults };
}
