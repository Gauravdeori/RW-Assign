import { describe, expect, it } from 'vitest';
import { parseGpa } from './GpaBox';
import { parseToeic } from './ToeicBox';

describe('typed TOEIC score', () => {
  it('accepts 10 to 990, waits on digits that may still become a score, refuses the rest', () => {
    expect(parseToeic('')).toBeNull();
    expect(parseToeic('8')).toBe('pending');
    expect(parseToeic('82')).toBe(82);
    expect(parseToeic('820')).toBe(820);
    expect(parseToeic('990')).toBe(990);
    expect(parseToeic('995')).toBe('invalid');
    expect(parseToeic('1200')).toBe('invalid');
    expect(parseToeic('005')).toBe('invalid');
    expect(parseToeic('-5')).toBe('invalid');
  });
});

describe('typed minimum GPA', () => {
  it('accepts 0.1 to 4.0 (rounded to 0.1), treats 0 as any, refuses the rest', () => {
    expect(parseGpa('')).toBeNull();
    expect(parseGpa('0')).toBeNull();
    expect(parseGpa('.')).toBe('pending');
    expect(parseGpa('3')).toBe(3);
    expect(parseGpa('3.25')).toBe(3.3);
    expect(parseGpa('4.0')).toBe(4);
    expect(parseGpa('4.5')).toBe('invalid');
    expect(parseGpa('5')).toBe('invalid');
    expect(parseGpa('3..1')).toBe('invalid');
  });
});
