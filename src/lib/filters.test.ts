import { describe, expect, it } from 'vitest';
import { filters } from '../test/fixtures';
import { activeRowKeys, emptyFilters, hasActiveFilters, niceRowCount, sanitizeFilters } from './filters';

describe('sanitizeFilters', () => {
  it('drops unknown values instead of crashing on them', () => {
    const f = sanitizeFilters({
      industries: ['technology', 'foo'],
      foreign: 'zzz',
      englishMin: 'Garbage',
      gaishiScores: ['Q', 'A'],
      schoolRatings: ['X'],
      optional: ['bogus', 'industry'],
    });
    expect(f.industries).toEqual(['technology']);
    expect(f.foreign).toBe('any');
    expect(f.englishMin).toBe('any');
    expect(f.gaishiScores).toEqual(['A']);
    expect(f.schoolRatings).toEqual([]);
    expect(f.optional).toEqual(['industry']);
  });

  it('range-checks numbers', () => {
    expect(sanitizeFilters({ englishMin: 'Fluent', toeic: 1200 }).toeic).toBeNull();
    expect(sanitizeFilters({ gpaMin: 9.9 }).gpaMin).toBeNull();
    expect(sanitizeFilters({ gpaMin: 3.04 }).gpaMin).toBe(3);
    expect(sanitizeFilters({ ageMode: 'range', ageMin: -5, ageMax: 300 }).ageMode).toBe('any');
  });

  it('drops a TOEIC score or JLPT level that does not match its language level', () => {
    expect(sanitizeFilters({ englishMin: 'Business', toeic: 820 }).toeic).toBeNull();
    expect(sanitizeFilters({ englishMin: 'Fluent', toeic: 820 }).toeic).toBe(820);
    expect(sanitizeFilters({ japaneseMin: 'Fluent', jlpt: 'N2' }).jlpt).toBeNull();
  });

  it('fills gaps between decades and keeps majors only for ticked degrees that have one', () => {
    expect(sanitizeFilters({ ageMode: 'decades', decades: [20, 40] })).toMatchObject({ decades: [20, 30, 40], ageMin: 20, ageMax: 49 });
    const f = sanitizeFilters({ degrees: ["Master's", 'MBA'], majorFor: { "Master's": 'engineering', MBA: 'law', PhD: 'science' } });
    expect(f.majorFor).toEqual({ "Master's": 'engineering' });
  });

  it('reads filters saved before School class became School rating', () => {
    const f = sanitizeFilters({ schoolClasses: ['S'], majors: ['law'], optional: ['schoolClass'] });
    expect(f.schoolRatings).toEqual(['S']);
    expect(f.optional).toEqual(['schoolRating']);
  });

  it('returns empty filters for anything that is not an object', () => {
    expect(sanitizeFilters(null)).toEqual(emptyFilters());
    expect(sanitizeFilters('x')).toEqual(emptyFilters());
  });
});

describe('active rows', () => {
  it('lists only rows with something chosen', () => {
    expect(activeRowKeys(filters({ lastName: ' ', industries: ['technology'], gpaMin: 3 }))).toEqual(['industry', 'gpa']);
  });

  it('does not count an unticked Required box on an empty row as a filter', () => {
    expect(hasActiveFilters(filters({ optional: ['industry'] }))).toBe(false);
  });

  it('counts nice-to-have rows in use over all steps', () => {
    expect(
      niceRowCount([
        filters({ industries: ['technology'], optional: ['industry', 'age'] }),
        filters({ gaishiScores: ['A'], optional: ['gaishi'] }),
      ]),
    ).toBe(2);
  });
});
