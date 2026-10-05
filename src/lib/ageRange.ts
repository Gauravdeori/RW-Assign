import { AGE_LIGHT, AGE_MAX, AGE_MIN, DECADES, type AgeFields } from '../types';

/** The age control's three ways to pick ages: decade buttons, slider or typed range. Pure rules, no UI. */

export const ANY_AGE: AgeFields = { ageMode: 'any', decades: [], ageMin: AGE_MIN, ageMax: AGE_MAX };

/** 20s..60s; 60 covers 60 and over. */
export const decadeOf = (age: number) => Math.min(60, Math.floor(age / 10) * 10);

/**
 * Decades lit by the age control: the ticked ones, or for a typed / dragged range the decades it covers MOST of
 * (see AGE_LIGHT: 50-55 leaves the 50s unlit, 50-56 lights it).
 */
export function litDecades(f: AgeFields): number[] {
  if (f.ageMode === 'decades') return f.decades;
  if (f.ageMode === 'range') return DECADES.filter((d) => f.ageMin <= d + (10 - AGE_LIGHT) && f.ageMax >= d + AGE_LIGHT);
  return [];
}

/** Ticked decades as age fields: one continuous range (30s + 40s = 30-49); none = any age. */
export function fromDecades(list: number[]): AgeFields {
  if (!list.length) return ANY_AGE;
  const sorted = [...list].sort((a, b) => a - b);
  return { ageMode: 'decades', decades: sorted, ageMin: sorted[0], ageMax: sorted[sorted.length - 1] + 9 };
}

/**
 * Click on a decade button. Decades always select one continuous range: adding one fills the gap (20s + 40s also
 * lights the 30s); clicking an end decade shrinks the range; clicking one in the middle keeps just that decade.
 */
export function toggleDecade(current: AgeFields, d: number): AgeFields {
  const lit = [...litDecades(current)].sort((a, b) => a - b);
  if (!lit.length) return fromDecades([d]);
  const first = lit[0];
  const last = lit[lit.length - 1];
  if (!lit.includes(d)) return fromDecades(DECADES.filter((x) => x >= Math.min(first, d) && x <= Math.max(last, d)));
  if (d === first || d === last) return fromDecades(lit.filter((x) => x !== d));
  return fromDecades([d]);
}

/** A typed or dragged range, clamped to 20-69 with min <= max. The full range is "any age". */
export function fromRange(min: number, max: number): AgeFields {
  const lo = Math.min(AGE_MAX, Math.max(AGE_MIN, Math.round(min)));
  const hi = Math.min(AGE_MAX, Math.max(lo, Math.round(max)));
  if (lo === AGE_MIN && hi === AGE_MAX) return ANY_AGE;
  return { ageMode: 'range', decades: [], ageMin: lo, ageMax: hi };
}
