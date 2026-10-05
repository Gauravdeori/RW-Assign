import type { Degree, GaishiScore, Industry, Jlpt, Level, Major, Position, Qualification, SchoolRating, Seniority } from './candidate';

/** The search filters of one step. Empty lists, 'any' and '' mean "row not used". */

export const DECADES = [20, 30, 40, 50, 60] as const;
export const AGE_MIN = 20;
export const AGE_MAX = 69;
/**
 * When a typed or dragged age range lights a decade button: only when the range covers MOST of that decade.
 * The upper end must reach the decade's 6th year (50s: 56 or more), and the lower end must start no later than
 * 10 - 6 = 4 years in (40s: 44 or less). 50-55 leaves the 50s unlit; 50-56 lights it. Change this one number to tune.
 */
export const AGE_LIGHT = 6;

/** Minimum GPA filter: 0.1 to 4.0 in steps of 0.1 (every GPA is normalised to a 4.0 scale). */
export const GPA_MAX = 4;
export const GPA_STEP = 0.1;

export const FILTER_GENDERS = ['male', 'female'] as const;
export type FilterGender = (typeof FILTER_GENDERS)[number];

export const FOREIGN_FILTERS = ['any', 'never', 'once', 'twice'] as const;
export type ForeignFilter = (typeof FOREIGN_FILTERS)[number];

export const OVERSEAS_FILTERS = ['any', 'yes', 'no'] as const;
export type OverseasFilter = (typeof OVERSEAS_FILTERS)[number];

export type AgeMode = 'any' | 'decades' | 'range';
export type LevelFilter = 'any' | Level;

export interface Filters {
  lastName: string;
  firstName: string;
  currentCompany: string;
  previousCompanies: string[];
  ageMode: AgeMode;
  decades: number[];
  ageMin: number;
  ageMax: number;
  genders: FilterGender[];
  seniority: Seniority[];
  industries: Industry[];
  positions: Position[];
  gaishiScores: GaishiScore[];
  foreign: ForeignFilter;
  englishMin: LevelFilter;
  /** TOEIC score typed by the recruiter; it sets englishMin (the level is what filters). */
  toeic: number | null;
  japaneseMin: LevelFilter;
  /** JLPT level picked by the recruiter; it sets japaneseMin (the level is what filters). */
  jlpt: Jlpt | null;
  overseas: OverseasFilter;
  degrees: Degree[];
  /** Major picked for a ticked degree (never for MBA). Matches only that same degree. */
  majorFor: Partial<Record<Degree, Major>>;
  schoolRatings: SchoolRating[];
  /** Minimum GPA on a 4.0 scale; null = any. */
  gpaMin: number | null;
  qualifications: Qualification[];
  /** Free text matched against every qualification on the CV. */
  qualText: string;
  schoolName: string;
  /**
   * Filter rows marked "nice to have" (their Required box unticked). They do not leave anyone out;
   * candidates who match them rank first. Every other row is required. Empty = all required.
   */
  optional: RowKey[];
}

/** One filter row: the unit that can be required or nice to have. */
export const ROW_KEYS = [
  'name',
  'company',
  'age',
  'gender',
  'seniority',
  'industry',
  'position',
  'gaishi',
  'foreign',
  'english',
  'japanese',
  'overseas',
  'degree',
  'schoolRating',
  'gpa',
  'qualification',
  'school',
] as const;
export type RowKey = (typeof ROW_KEYS)[number];

/** The four fields the age control reads and writes. */
export type AgeFields = Pick<Filters, 'ageMode' | 'decades' | 'ageMin' | 'ageMax'>;

/** The fields typed into text boxes: they apply shortly after the last key press. */
export const TEXT_FIELDS = ['lastName', 'firstName', 'currentCompany', 'previousCompanies', 'schoolName', 'qualText'] as const;
export type TextField = (typeof TEXT_FIELDS)[number];
