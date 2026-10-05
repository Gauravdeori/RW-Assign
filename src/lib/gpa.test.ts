import { describe, expect, it } from 'vitest';
import { bestGpa, gpaHundredths, gpaOn4 } from './gpa';

describe('GPA normalisation to a 4.0 scale', () => {
  it('converts each scale', () => {
    expect(gpaOn4({ gpa: 3.0, gpaScale: 4 })).toBe(3);
    expect(gpaOn4({ gpa: 4.3, gpaScale: 4.3 })).toBe(4);
    expect(gpaOn4({ gpa: 4.0, gpaScale: 5 })).toBeCloseTo(3.2);
    expect(gpaOn4({ gpa: 75, gpaScale: 100 })).toBe(3);
  });

  it('caps a GPA written above its scale, and floors a negative one', () => {
    expect(gpaOn4({ gpa: 4.5, gpaScale: 4 })).toBe(4);
    expect(gpaOn4({ gpa: -1, gpaScale: 4 })).toBe(0);
  });

  it('returns null with no GPA or a broken scale', () => {
    expect(gpaOn4({ gpa: null, gpaScale: 4 })).toBeNull();
    expect(gpaOn4({ gpa: 3, gpaScale: 0 })).toBeNull();
    expect(gpaOn4({ gpa: Number.NaN, gpaScale: 4 })).toBeNull();
  });

  it('takes the best GPA over all degrees', () => {
    expect(
      bestGpa([
        { gpa: 2.8, gpaScale: 4 },
        { gpa: 80, gpaScale: 100 },
        { gpa: null, gpaScale: 4 },
      ]),
    ).toBeCloseTo(3.2);
    expect(bestGpa([])).toBeNull();
  });

  it('compares in whole hundredths, so 3.0 of 4.0 is exactly 3.0', () => {
    expect(gpaHundredths(gpaOn4({ gpa: 3.0, gpaScale: 4 }) ?? 0)).toBe(300);
  });
});
