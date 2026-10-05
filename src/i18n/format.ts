import type { Education, GaishiScore } from '../types';

/** Formatting shared by both languages. */

export const fmtNum = (n: number) => n.toLocaleString('en-US');

export function splitIso(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return { y, m, d };
}

/** GPA as written on the CV: "3.4 / 4.0", "82 / 100". */
export const fmtGpa = (e: Pick<Education, 'gpa' | 'gpaScale'>) =>
  e.gpa === null ? '' : e.gpaScale === 100 ? `${e.gpa} / 100` : `${e.gpa.toFixed(1)} / ${e.gpaScale.toFixed(1)}`;

/** Scores as a range, best first: "A", "A or B", "A to C". */
export const scoreSpan = (s: GaishiScore[], or: string, to: string) =>
  s.length === 1 ? s[0] : s.length === 2 ? `${s[0]} ${or} ${s[1]}` : `${s[0]} ${to} ${s[s.length - 1]}`;

/** Parts of a 'YYYY-MM-DDTHH:mm' stamp (Assignment page), with the time kept as written ("09:48"). */
export function splitStamp(stamp: string) {
  const [date, time = ''] = stamp.split('T');
  return { ...splitIso(date), time };
}
