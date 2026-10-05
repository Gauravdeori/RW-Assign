import { emptyFilters } from '../lib/filters';
import type { Candidate, Education, Filters } from '../types';

/** A plain candidate for tests; override only what the test is about. */
export function candidate(id: string, over: Partial<Candidate> = {}): Candidate {
  return {
    id,
    lastName: 'Sato',
    firstName: 'Yuki',
    dateOfBirth: '1990-01-01',
    age: 35,
    gender: 'female',
    currentCompany: 'Sony',
    currentTitle: 'Engineer',
    currentStartYear: 2020,
    currentIsForeign: false,
    previousCompanies: [],
    seniority: 'S',
    industry: 'technology',
    position: 'it',
    englishLevel: 'Business',
    japaneseLevel: 'Native',
    foreignCompanyCount: 0,
    yearsOverseas: 0,
    gaishiScore: 'C',
    toeicScore: null,
    jlpt: null,
    education: [degree("Bachelor's", 'engineering')],
    qualifications: [],
    otherQualifications: [],
    cvUpdatedAt: '2026-01-01',
    yearsExperience: 10,
    ...over,
  };
}

export function degree(d: Education['degree'], major: Education['major'], over: Partial<Education> = {}): Education {
  return { degree: d, major, school: 'Keio University', schoolRating: 'S', gpa: null, gpaScale: 4, ...over };
}

/** Filters with only the given fields set. */
export const filters = (over: Partial<Filters> = {}): Filters => ({ ...emptyFilters(), ...over });
