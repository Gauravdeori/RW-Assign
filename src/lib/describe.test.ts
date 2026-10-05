import { describe, expect, it } from 'vitest';
import { en } from '../i18n/en';
import { filters } from '../test/fixtures';
import { activeChips, removeChip, suggestName } from './describe';
import { hasActiveFilters } from './filters';

describe('active-filter chips', () => {
  const f = filters({
    lastName: 'Sato',
    previousCompanies: ['Sony', 'NEC'],
    ageMode: 'decades',
    decades: [30],
    ageMin: 30,
    ageMax: 39,
    industries: ['technology'],
    englishMin: 'Fluent',
    toeic: 820,
    degrees: ["Master's"],
    majorFor: { "Master's": 'engineering' },
    gpaMin: 3,
    qualifications: ['cpa'],
    qualText: 'FRM',
  });

  it('labels each choice in panel order', () => {
    expect(activeChips(f, en).map((c) => c.label)).toEqual([
      'Last name: Sato',
      'Previously at: Sony',
      'Previously at: NEC',
      '30s',
      'Technology',
      'English: Fluent+ (TOEIC 820)',
      "Master's: Engineering",
      'GPA 3.0+',
      'CPA',
      'Qualification: FRM',
    ]);
  });

  it('removes exactly one choice per chip, and every chip together clears everything', () => {
    expect(removeChip(f, 'en')).toMatchObject({ englishMin: 'any', toeic: null });
    expect(removeChip(f, "d-Master's")).toMatchObject({ degrees: [], majorFor: {} });
    expect(removeChip(f, 'prev-1').previousCompanies).toEqual(['Sony']);
    expect(removeChip(f, 'prev-0').previousCompanies).toEqual(['', 'NEC']);
    const cleared = activeChips(f, en).reduceRight((acc, c) => removeChip(acc, c.id), f);
    expect(hasActiveFilters(cleared)).toBe(false);
    expect(removeChip(f, 'unknown')).toBe(f);
  });

  it('suggests a name for a saved search', () => {
    expect(suggestName([filters({ industries: ['financial'], seniority: ['K'], englishMin: 'Business' })], en)).toBe(
      'Bilingual finance sector managers',
    );
    expect(suggestName([filters()], en)).toBe('My search');
  });
});
