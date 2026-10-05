import type { Dict } from '../i18n/en';
import type { Candidate } from '../types';
import { topEducation } from './candidate';

const quote = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;

/** File > Export results: the results, in their current order, as CSV text. */
export function buildCsv(rows: readonly Candidate[], t: Dict): string {
  const head = [
    t.csv.name,
    t.csv.title,
    t.csv.company,
    t.factAge,
    t.factSeniority,
    t.csv.industry,
    t.factEnglish,
    t.factJapanese,
    t.factGaishi,
    t.factSchool,
    t.csv.toeic,
    t.csv.jlpt,
    t.csv.qualifications,
    t.csv.cvUpdated,
  ];
  const body = rows.map((c) => {
    const top = topEducation(c);
    return [
      t.displayName(c),
      c.currentTitle,
      c.currentCompany,
      c.age,
      t.seniorityFact(c.seniority),
      t.industry[c.industry],
      t.level[c.englishLevel],
      t.level[c.japaneseLevel],
      c.gaishiScore,
      top ? t.schoolWithRating(top.school, top.schoolRating) : '',
      c.toeicScore ?? '',
      c.jlpt ?? '',
      [...c.qualifications.map((q) => t.qualificationFull[q]), ...c.otherQualifications].join('; '),
      c.cvUpdatedAt,
    ];
  });
  return [head, ...body].map((r) => r.map(quote).join(',')).join('\r\n');
}

/** Save CSV text as a file (UTF-8 with a BOM, so Excel shows Japanese correctly). */
export function downloadCsv(csv: string, fileName: string): void {
  const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
