import { GPA_MAX, type Education } from '../types';

/** Scales GPAs are written on in CVs: 4.0 (most), 4.3, 5.0 and 100-point. */
export const GPA_SCALES = [4, 4.3, 5, 100] as const;

/**
 * A GPA on the school's own scale moved to a 4.0 scale: gpa / scale x 4. null when the CV states none, the scale
 * is not a positive number, or the GPA is not a number. A GPA written above its scale (a typo in the CV) counts as
 * the top of the scale; a negative one as 0.
 */
export function gpaOn4(e: Pick<Education, 'gpa' | 'gpaScale'>): number | null {
  if (e.gpa === null || !Number.isFinite(e.gpa) || !Number.isFinite(e.gpaScale) || e.gpaScale <= 0) return null;
  return Math.min(GPA_MAX, Math.max(0, (e.gpa / e.gpaScale) * GPA_MAX));
}

/** The best GPA over all the candidate's degrees, on a 4.0 scale; null when none is stated. */
export function bestGpa(education: readonly Pick<Education, 'gpa' | 'gpaScale'>[]): number | null {
  let best: number | null = null;
  for (const e of education) {
    const g = gpaOn4(e);
    if (g !== null && (best === null || g > best)) best = g;
  }
  return best;
}

/** Whole hundredths, so comparisons do not trip over floating point (3.0 / 4.0 x 4 vs 3.0). */
export const gpaHundredths = (g: number) => Math.round(g * 100);
