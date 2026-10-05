import { describe, expect, it } from 'vitest';
import { JLPT_LEVEL, jlptForLevel, toeicLevel } from './languageTests';

describe('TOEIC to English level', () => {
  it.each([
    [10, 'Basic'],
    [399, 'Basic'],
    [400, 'Conversational'],
    [599, 'Conversational'],
    [600, 'Business'],
    [779, 'Business'],
    [780, 'Fluent'],
    [944, 'Fluent'],
    [945, 'Fluent'],
    [990, 'Fluent'],
  ] as const)('TOEIC %i = %s (never Native)', (score, level) => {
    expect(toeicLevel(score)).toBe(level);
  });
});

describe('JLPT and Japanese level', () => {
  it('maps N5, N4 to Basic; N3 Conversational; N2 Business; N1 Fluent', () => {
    expect(JLPT_LEVEL).toEqual({ N5: 'Basic', N4: 'Basic', N3: 'Conversational', N2: 'Business', N1: 'Fluent' });
  });

  it('picks the matching JLPT for a level, and none for Native or Any', () => {
    expect(jlptForLevel('Basic', null)).toBe('N5');
    expect(jlptForLevel('Basic', 'N4')).toBe('N4');
    expect(jlptForLevel('Conversational', 'N4')).toBe('N3');
    expect(jlptForLevel('Business', null)).toBe('N2');
    expect(jlptForLevel('Fluent', null)).toBe('N1');
    expect(jlptForLevel('Native', 'N1')).toBeNull();
    expect(jlptForLevel('any', 'N2')).toBeNull();
  });
});
