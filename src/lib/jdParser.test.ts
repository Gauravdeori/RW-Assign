import { describe, expect, it } from 'vitest';
import { EXAMPLE_JD, parseJobDescription } from './jdParser';

describe('job description parser', () => {
  it('fills the example and skips "preferred" items', () => {
    const { patch, filled } = parseJobDescription(EXAMPLE_JD);
    expect(patch).toMatchObject({
      industries: ['healthcare'],
      positions: ['finance'],
      seniority: ['K'],
      englishMin: 'Business',
      japaneseMin: 'Native',
      foreign: 'once',
    });
    expect(patch.qualifications).toBeUndefined(); // "MBA or CPA preferred"
    expect(filled).toBe(6);
  });

  it('reads TOEIC, JLPT and qualifications', () => {
    const { patch } = parseJobDescription(
      'Accounting Manager\nMust have: USCPA, TOEIC 860 or above, JLPT N2. Bookkeeping skills required. CFA is a plus.',
    );
    expect(patch).toMatchObject({
      toeic: 860,
      englishMin: 'Fluent',
      jlpt: 'N2',
      japaneseMin: 'Business',
      qualifications: ['uscpa', 'bookkeeping'],
    });
  });

  it('finds nothing in unrelated text', () => {
    expect(parseJobDescription('Hello there.').filled).toBe(0);
  });
});
