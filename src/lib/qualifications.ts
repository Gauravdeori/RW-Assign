import type { Qualification } from '../types';

/** Search words for each qualification (English and Japanese), so the free-text box finds them too. */
export const QUAL_TERMS: Record<Qualification, string> = {
  cpa: 'cpa|certified public accountant|公認会計士|会計士',
  uscpa: 'uscpa|us cpa|us certified public accountant|米国公認会計士',
  cfa: 'cfa|chartered financial analyst',
  pmp: 'pmp|project management professional|プロジェクトマネジメント',
  cia: 'cia|certified internal auditor|公認内部監査人',
  bookkeeping: 'bookkeeping|boki|簿記',
  itcert: 'it certification|aws|azure|it資格',
  bengoshi: 'lawyer|bengoshi|attorney|弁護士',
  sharoushi: 'labour and social security attorney|labor and social security attorney|sharoushi|社会保険労務士|社労士',
};
