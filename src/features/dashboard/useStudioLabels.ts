import { useI18n } from '../../i18n';
import type { Conversion } from '../../types';

/** Studio labels, and the tags shown under each conversion (languages, mode, single/dual, tables, engine). */
export function useStudioLabels() {
  const { t } = useI18n();
  const s = t.studio;
  const tags = (c: Conversion) => [
    `${s.langCode[c.source]} → ${s.langCode[c.target]}`,
    s.mode[c.mode],
    c.dualLanguage ? s.tagDual : s.tagSingle,
    c.hasTables ? s.tagTables : s.tagNoTables,
    s.engine[c.engine],
  ];
  return { s, tags };
}
