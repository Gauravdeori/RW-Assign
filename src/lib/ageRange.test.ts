import { describe, expect, it } from 'vitest';
import { ANY_AGE, decadeOf, fromDecades, fromRange, litDecades, toggleDecade } from './ageRange';

describe('age range and decade lighting', () => {
  it('lights a decade only when a range covers most of it', () => {
    expect(litDecades(fromRange(50, 55))).toEqual([]);
    expect(litDecades(fromRange(50, 56))).toEqual([50]);
    expect(litDecades(fromRange(44, 56))).toEqual([40, 50]);
    expect(litDecades(fromRange(45, 56))).toEqual([50]);
    expect(litDecades(ANY_AGE)).toEqual([]);
  });

  it('keeps ticked decades one continuous range', () => {
    const twenties = toggleDecade(ANY_AGE, 20);
    expect(twenties).toMatchObject({ ageMode: 'decades', decades: [20], ageMin: 20, ageMax: 29 });
    expect(toggleDecade(twenties, 40).decades).toEqual([20, 30, 40]);
  });

  it('shrinks from an end, and keeps just a middle decade when it is clicked', () => {
    const range = fromDecades([30, 40, 50]);
    expect(toggleDecade(range, 50).decades).toEqual([30, 40]);
    expect(toggleDecade(range, 40).decades).toEqual([40]);
    expect(toggleDecade(fromDecades([30]), 30)).toEqual(ANY_AGE);
  });

  it('clamps a typed range and treats the full range as any age', () => {
    expect(fromRange(20, 69)).toEqual(ANY_AGE);
    expect(fromRange(10, 99)).toEqual(ANY_AGE);
    expect(fromRange(45, 30)).toMatchObject({ ageMode: 'range', ageMin: 45, ageMax: 45 });
  });

  it('puts 60 and over in the 60s', () => {
    expect(decadeOf(29)).toBe(20);
    expect(decadeOf(64)).toBe(60);
    expect(decadeOf(71)).toBe(60);
  });
});
