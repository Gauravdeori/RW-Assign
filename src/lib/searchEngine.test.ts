import { describe, expect, it } from 'vitest';
import { candidate, degree, filters } from '../test/fixtures';
import { createSearchIndex } from './searchEngine';

const ids = (index: ReturnType<typeof createSearchIndex>, set: Uint32Array) => Array.from(set, (i) => index.candidates[i].id);

describe('filter rules', () => {
  const index = createSearchIndex([
    candidate('tech-staff', { industry: 'technology', seniority: 'S' }),
    candidate('tech-manager', { industry: 'technology', seniority: 'K' }),
    candidate('fin-manager', { industry: 'financial', seniority: 'K' }),
    candidate('health-head', { industry: 'healthcare', seniority: 'B' }),
  ]);
  const run = (f: Parameters<typeof index.runFilter>[1]) => ids(index, index.runFilter(index.all, f));

  it('joins choices in one row with OR', () => {
    expect(run(filters({ industries: ['technology', 'financial'] }))).toEqual(['tech-staff', 'tech-manager', 'fin-manager']);
  });

  it('joins different rows with AND', () => {
    expect(run(filters({ industries: ['technology'], seniority: ['K'] }))).toEqual(['tech-manager']);
  });

  it('does not filter on an empty row', () => {
    expect(run(filters())).toHaveLength(4);
  });

  it('ignores a nice-to-have row when filtering, and ranks its matches first under Best CVs', () => {
    const f = filters({ seniority: ['B'], optional: ['seniority'] });
    const set = index.runFilter(index.all, f);
    expect(set).toHaveLength(4);
    const prefs = index.preferenceScores(set, [f]);
    expect(prefs?.total).toBe(1);
    expect(ids(index, index.sortResults(set, 'best', prefs))[0]).toBe('health-head');
  });
});

describe('"at least" levels', () => {
  const index = createSearchIndex([
    candidate('conv', { englishLevel: 'Conversational', japaneseLevel: 'Basic' }),
    candidate('bus', { englishLevel: 'Business', japaneseLevel: 'Business' }),
    candidate('flu', { englishLevel: 'Fluent', japaneseLevel: 'Fluent' }),
    candidate('nat', { englishLevel: 'Native', japaneseLevel: 'Native' }),
  ]);
  const run = (f: Parameters<typeof index.runFilter>[1]) => ids(index, index.runFilter(index.all, f));

  it('includes the level and every higher one', () => {
    expect(run(filters({ englishMin: 'Business' }))).toEqual(['bus', 'flu', 'nat']);
    expect(run(filters({ japaneseMin: 'Fluent' }))).toEqual(['flu', 'nat']);
  });

  it('treats Basic as everyone', () => {
    expect(run(filters({ englishMin: 'Basic' }))).toHaveLength(4);
  });
});

describe('degree and major', () => {
  const index = createSearchIndex([
    candidate('ba-eng+ma-bus', { education: [degree("Bachelor's", 'engineering'), degree("Master's", 'business')] }),
    candidate('ba-bus+ma-eng', { education: [degree("Bachelor's", 'business'), degree("Master's", 'engineering')] }),
    candidate('ba-law+mba', { education: [degree("Bachelor's", 'law'), degree('MBA', null)] }),
  ]);
  const run = (f: Parameters<typeof index.runFilter>[1]) => ids(index, index.runFilter(index.all, f));

  it('matches a major only for that same degree', () => {
    expect(run(filters({ degrees: ["Master's"], majorFor: { "Master's": 'engineering' } }))).toEqual(['ba-bus+ma-eng']);
    expect(run(filters({ degrees: ["Bachelor's"], majorFor: { "Bachelor's": 'engineering' } }))).toEqual(['ba-eng+ma-bus']);
  });

  it('matches any major when none is picked, and joins degrees with OR', () => {
    expect(run(filters({ degrees: ["Master's", 'MBA'] }))).toEqual(['ba-eng+ma-bus', 'ba-bus+ma-eng', 'ba-law+mba']);
  });
});

describe('school rating, GPA and qualifications', () => {
  const index = createSearchIndex([
    candidate('gpa-3.0-of-4', { education: [degree("Bachelor's", 'law', { gpa: 3.0, gpaScale: 4, schoolRating: 'C' })] }),
    candidate('gpa-75-of-100', { education: [degree("Bachelor's", 'law', { gpa: 75, gpaScale: 100, schoolRating: 'B' })] }),
    candidate('gpa-3.2-of-4.3', { education: [degree("Bachelor's", 'law', { gpa: 3.2, gpaScale: 4.3, schoolRating: 'B' })] }),
    candidate('no-gpa+overseas-mba', {
      education: [degree("Bachelor's", 'law', { schoolRating: 'C' }), degree('MBA', null, { schoolRating: 'Overseas', school: 'INSEAD' })],
      qualifications: ['cpa'],
      otherQualifications: ['FRM (Financial Risk Manager)'],
    }),
  ]);
  const run = (f: Parameters<typeof index.runFilter>[1]) => ids(index, index.runFilter(index.all, f));

  it('compares GPAs normalised to 4.0 and leaves out CVs with no GPA', () => {
    expect(run(filters({ gpaMin: 3.0 }))).toEqual(['gpa-3.0-of-4', 'gpa-75-of-100']);
  });

  it('matches a school rating on any of the candidate’s schools', () => {
    expect(run(filters({ schoolRatings: ['Overseas'] }))).toEqual(['no-gpa+overseas-mba']);
    expect(run(filters({ schoolName: 'insead' }))).toEqual(['no-gpa+overseas-mba']);
  });

  it('finds qualifications by tick or by typed text in English or Japanese', () => {
    expect(run(filters({ qualifications: ['cpa'] }))).toEqual(['no-gpa+overseas-mba']);
    expect(run(filters({ qualText: '公認会計士' }))).toEqual(['no-gpa+overseas-mba']);
    expect(run(filters({ qualText: 'risk manager' }))).toEqual(['no-gpa+overseas-mba']);
    expect(run(filters({ qualText: 'pilot licence' }))).toEqual([]);
  });
});

describe('search within results (steps)', () => {
  const index = createSearchIndex([
    candidate('a', { industry: 'technology', gaishiScore: 'A' }),
    candidate('b', { industry: 'technology', gaishiScore: 'C' }),
    candidate('c', { industry: 'financial', gaishiScore: 'A' }),
  ]);

  it('applies each step to the previous step’s results', () => {
    const chain = index.chainSteps([filters({ industries: ['technology'] }), filters({ gaishiScores: ['A'] })]);
    expect(chain.map((s) => s.length)).toEqual([3, 2, 1]);
    expect(ids(index, chain[2])).toEqual(['a']);
  });

  it('sorts New CVs by date, newest first', () => {
    const dated = createSearchIndex([
      candidate('old', { cvUpdatedAt: '2025-01-01' }),
      candidate('new', { cvUpdatedAt: '2026-06-01' }),
      candidate('mid', { cvUpdatedAt: '2025-09-01' }),
    ]);
    expect(ids(dated, dated.sortResults(dated.all, 'new'))).toEqual(['new', 'mid', 'old']);
  });
});
