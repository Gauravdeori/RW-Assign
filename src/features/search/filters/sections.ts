import type { Filters } from '../../../types';

export type SectionKey = 'candidate' | 'role' | 'gaishi' | 'education';
export const SECTIONS: SectionKey[] = ['candidate', 'role', 'gaishi', 'education'];

const filled = (s: string) => (s.trim() ? 1 : 0);

/** How many filters are active in each group (shown as a badge on its tab or box heading). */
export function activeIn(key: SectionKey, f: Filters, showGender: boolean): number {
  switch (key) {
    case 'candidate':
      return (
        filled(f.lastName) +
        filled(f.firstName) +
        filled(f.currentCompany) +
        f.previousCompanies.filter((p) => p.trim()).length +
        (f.ageMode !== 'any' ? 1 : 0) +
        (showGender ? f.genders.length : 0)
      );
    case 'role':
      return f.seniority.length + f.industries.length + f.positions.length;
    case 'gaishi':
      return (
        f.gaishiScores.length +
        (f.englishMin !== 'any' ? 1 : 0) +
        (f.japaneseMin !== 'any' ? 1 : 0) +
        (f.overseas !== 'any' ? 1 : 0) +
        (f.foreign !== 'any' ? 1 : 0)
      );
    case 'education':
      return (
        f.degrees.length + f.schoolRatings.length + (f.gpaMin ? 1 : 0) + f.qualifications.length + filled(f.qualText) + filled(f.schoolName)
      );
  }
}
