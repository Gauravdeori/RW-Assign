/** Candidate data: the fields extracted from a converted CV. Shared by the search engine, the API and the UI. */

export const LEVELS = ['Basic', 'Conversational', 'Business', 'Fluent', 'Native'] as const;
export type Level = (typeof LEVELS)[number];

export const SENIORITIES = ['S', 'S+', 'K', 'B', 'Y'] as const;
export type Seniority = (typeof SENIORITIES)[number];

export const INDUSTRIES = [
  'technology',
  'financial',
  'healthcare',
  'manufacturing',
  'consumer',
  'telecoms',
  'professional',
  'energy',
] as const;
export type Industry = (typeof INDUSTRIES)[number];

export const POSITIONS = ['sales', 'marketing', 'finance', 'hr', 'it', 'legal', 'supply', 'gm'] as const;
export type Position = (typeof POSITIONS)[number];

export const MAJORS = ['business', 'engineering', 'science', 'law', 'humanities', 'infosci'] as const;
export type Major = (typeof MAJORS)[number];

export const DEGREES = ["Bachelor's", "Master's", 'MBA', 'PhD'] as const;
export type Degree = (typeof DEGREES)[number];

/** MBA has no major; Bachelor's, Master's and PhD each have their own. */
export const DEGREES_WITH_MAJOR: readonly Degree[] = ["Bachelor's", "Master's", 'PhD'];

/** School rating (draft list, to be confirmed by Robert Walters): S top, A strong, B solid, C other, Overseas outside Japan. */
export const SCHOOL_RATINGS = ['S', 'A', 'B', 'C', 'Overseas'] as const;
export type SchoolRating = (typeof SCHOOL_RATINGS)[number];

export const QUALIFICATIONS = ['cpa', 'uscpa', 'cfa', 'pmp', 'cia', 'bookkeeping', 'itcert', 'bengoshi', 'sharoushi'] as const;
export type Qualification = (typeof QUALIFICATIONS)[number];

/** JLPT, easiest (N5) to hardest (N1). */
export const JLPT_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'] as const;
export type Jlpt = (typeof JLPT_LEVELS)[number];

export const GAISHI_SCORES = ['A', 'B', 'C', 'D'] as const;
export type GaishiScore = (typeof GAISHI_SCORES)[number];

export const GENDERS = ['male', 'female', 'not_stated'] as const;
export type Gender = (typeof GENDERS)[number];

export interface PreviousCompany {
  company: string;
  title: string;
  startYear: number;
  endYear: number;
  isForeign: boolean;
}

/** One degree the candidate holds. GPA is on the school's own scale (gpaScale: 4.0, 4.3, 5.0 or 100); null = not stated. */
export interface Education {
  degree: Degree;
  /** null for an MBA (no major). */
  major: Major | null;
  school: string;
  schoolRating: SchoolRating;
  gpa: number | null;
  gpaScale: number;
}

export interface Candidate {
  id: string;
  lastName: string;
  firstName: string;
  dateOfBirth: string; // ISO date
  age: number; // computed from dateOfBirth on the search date
  gender: Gender;
  currentCompany: string;
  currentTitle: string;
  currentStartYear: number;
  currentIsForeign: boolean;
  previousCompanies: PreviousCompany[];
  seniority: Seniority;
  industry: Industry;
  position: Position;
  englishLevel: Level;
  japaneseLevel: Level;
  foreignCompanyCount: number;
  yearsOverseas: number;
  gaishiScore: GaishiScore;
  /** TOEIC score, when the CV states one. */
  toeicScore: number | null;
  /** JLPT level, when the CV states one (native Japanese speakers have none). */
  jlpt: Jlpt | null;
  /** Every degree held, in the order earned: the highest is last. */
  education: Education[];
  qualifications: Qualification[];
  /** Qualifications outside the standard list, as written on the CV. */
  otherQualifications: string[];
  cvUpdatedAt: string; // ISO date
  yearsExperience: number;
}
