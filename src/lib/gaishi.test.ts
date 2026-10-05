import { describe, expect, it } from 'vitest';
import { gaishiPoints, gaishiRange, gaishiScore } from './gaishi';

describe('gaishi score', () => {
  it('adds English, foreign companies (max 2) and time overseas (max 2)', () => {
    expect(gaishiPoints('Native', 5, 10)).toBe(7);
    expect(gaishiPoints('Business', 1, 2)).toBe(4);
    expect(gaishiPoints('Basic', 0, 0)).toBe(0);
  });

  it('bands points into A (6-7), B (4-5), C (2-3), D (0-1)', () => {
    expect(gaishiScore('Fluent', 2, 1)).toBe('A');
    expect(gaishiScore('Fluent', 1, 0)).toBe('B');
    expect(gaishiScore('Business', 0, 0)).toBe('C');
    expect(gaishiScore('Conversational', 0, 0)).toBe('D');
  });

  it('works out which scores the sub-filters allow', () => {
    expect(gaishiRange('any', 'any', 'any')).toEqual(['A', 'B', 'C', 'D']);
    expect(gaishiRange('Fluent', 'twice', 'yes')).toEqual(['A']);
    expect(gaishiRange('Fluent', 'any', 'any')).toEqual(['A', 'B', 'C']);
    // "Basic or higher" still includes fluent speakers, so C is possible.
    expect(gaishiRange('Basic', 'never', 'no')).toEqual(['C', 'D']);
    expect(gaishiRange('any', 'never', 'no')).toEqual(['C', 'D']);
  });
});
