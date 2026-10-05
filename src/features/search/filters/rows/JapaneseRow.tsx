import { memo } from 'react';
import { FilterRow } from '../../../../components/FilterRow';
import { Segmented } from '../../../../components/Segmented';
import { useI18n } from '../../../../i18n';
import { cx } from '../../../../lib/cx';
import { JLPT_LEVEL, jlptForLevel } from '../../../../lib/languageTests';
import { JLPT_LEVELS, LEVELS, type Jlpt, type LevelFilter } from '../../../../types';
import { CAPTION, reqFor, type Patch, type Req } from '../rowKit';

/**
 * Japanese level (this level or higher), with JLPT N5 to N1 on its right. Picking a JLPT level picks the matching
 * Japanese level and the other way round (N5, N4 Basic; N3 Conversational; N2 Business; N1 Fluent; native speakers
 * have no JLPT).
 */
export const JapaneseRow = memo(function JapaneseRow({
  level,
  jlpt,
  onChange,
  optional,
  onRequired,
}: Req & { level: LevelFilter; jlpt: Jlpt | null; onChange: Patch }) {
  const { t } = useI18n();
  const pickLevel = (l: LevelFilter) => {
    const next = level === l ? 'any' : l;
    onChange({ japaneseMin: next, jlpt: jlptForLevel(next, jlpt) });
  };
  const pickJlpt = (n: Jlpt) => onChange(jlpt === n ? { jlpt: null, japaneseMin: 'any' } : { jlpt: n, japaneseMin: JLPT_LEVEL[n] });
  return (
    <FilterRow label={t.japaneseLevel} required={reqFor({ optional, onRequired }, 'japanese')}>
      <div className="flex flex-wrap items-start gap-x-1.5 gap-y-1">
        <div>
          <Segmented
            label={t.japaneseLevel}
            options={LEVELS}
            value={level === 'any' ? null : level}
            labels={t.level}
            onPick={pickLevel}
            dense
          />
          <p className={CAPTION}>{t.orHigher}</p>
        </div>
        <div className="flex flex-col items-end">
          <Segmented label={t.jlptLabel} options={JLPT_LEVELS} value={jlpt} onPick={pickJlpt} dense />
          <p className={cx(CAPTION, jlpt && 'font-semibold text-pick-ink')} aria-live="polite">
            {jlpt ? t.jlptIs(jlpt, JLPT_LEVEL[jlpt]) : level === 'Native' ? t.jlptNative : t.jlptLabel}
          </p>
        </div>
      </div>
    </FilterRow>
  );
});
