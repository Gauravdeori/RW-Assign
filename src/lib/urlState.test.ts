import { describe, expect, it } from 'vitest';
import { filters } from '../test/fixtures';
import { decodeFilters, encodeFilters, readSearchState, searchStateUrl } from './urlState';

describe('URL state', () => {
  const full = filters({
    lastName: 'Tanaka',
    currentCompany: 'A.B~C',
    previousCompanies: ['Sony', 'NEC'],
    ageMode: 'range',
    ageMin: 35,
    ageMax: 44,
    genders: ['female'],
    seniority: ['K', 'B'],
    industries: ['financial'],
    gaishiScores: ['A'],
    foreign: 'once',
    englishMin: 'Fluent',
    toeic: 820,
    japaneseMin: 'Business',
    jlpt: 'N2',
    overseas: 'yes',
    degrees: ["Master's", 'MBA'],
    majorFor: { "Master's": 'engineering' },
    schoolRatings: ['S', 'Overseas'],
    gpaMin: 3.1,
    qualifications: ['cpa', 'cfa'],
    qualText: 'FRM',
    schoolName: 'Keio',
    optional: ['industry'],
  });

  it('round-trips every filter', () => {
    expect(decodeFilters(encodeFilters(full))).toEqual(full);
  });

  it('encodes nothing for empty filters', () => {
    expect(encodeFilters(filters())).toBe('');
  });

  it('survives a hand-edited or broken link', () => {
    const f = decodeFilters('ind.foo,technology~fc.zzz~en.Garbage~age.r-5-300~toeic.1200~gpa.99~cls.X~jlpt.N9~pc.%E0%A4%A');
    expect(f.industries).toEqual(['technology']);
    expect(f.foreign).toBe('any');
    expect(f.englishMin).toBe('any');
    expect(f.ageMode).toBe('any');
    expect(f.toeic).toBeNull();
    expect(f.gpaMin).toBeNull();
    expect(f.jlpt).toBeNull();
  });

  it('keeps older links that used school class (cls)', () => {
    expect(decodeFilters('cls.S,A').schoolRatings).toEqual(['S', 'A']);
  });

  it('reads and writes steps, sort and screen', () => {
    const url = searchStateUrl(
      { steps: [filters({ industries: ['technology'] })], draft: filters({ gaishiScores: ['A'] }), sort: 'new', screen: 'results' },
      '/',
      '#/search',
    );
    const state = readSearchState(url.slice(1, url.indexOf('#')));
    expect(state.steps).toEqual([filters({ industries: ['technology'] })]);
    expect(state.draft.gaishiScores).toEqual(['A']);
    expect(state.sort).toBe('new');
    expect(state.screen).toBe('results');
    expect(readSearchState('?sort=weird').sort).toBe('best');
  });
});
