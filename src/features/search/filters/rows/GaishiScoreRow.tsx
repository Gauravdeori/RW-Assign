import { memo } from 'react';
import { FilterRow } from '../../../../components/FilterRow';
import { Toggle } from '../../../../components/Toggle';
import { useI18n } from '../../../../i18n';
import { toggleIn } from '../../../../lib/arrays';
import { cx } from '../../../../lib/cx';
import { gaishiRange } from '../../../../lib/gaishi';
import { GAISHI_SCORES, type ForeignFilter, type GaishiScore, type LevelFilter, type OverseasFilter } from '../../../../types';
import { reqFor, type Patch, type Req } from '../rowKit';

/**
 * The overall Gaishi score (A to D): big letters, with a live hint saying which scores the sub-filters below allow,
 * so the link between the parts and the score is clear.
 */
export const GaishiScoreRow = memo(function GaishiScoreRow({
  value,
  englishMin,
  foreign,
  overseas,
  onChange,
  optional,
  onRequired,
}: Req & {
  value: GaishiScore[];
  englishMin: LevelFilter;
  foreign: ForeignFilter;
  overseas: OverseasFilter;
  onChange: Patch;
}) {
  const { t } = useI18n();
  const range = gaishiRange(englishMin, foreign, overseas);
  const allAny = englishMin === 'any' && foreign === 'any' && overseas === 'any';
  const conflict = value.length > 0 && !value.some((s) => range.includes(s));
  const hint = allAny ? t.gaishiHint.any : conflict ? t.gaishiHint.conflict(range) : t.gaishiHint.match(range);
  return (
    // Wider label column by the indent, so the score's letters start on the same line as the parts' controls.
    <div className="[--label-w:calc(var(--label-base)+var(--indent))]">
      <FilterRow label={t.gaishiScore} required={reqFor({ optional, onRequired }, 'gaishi')} firstLine={40}>
        {/* The help sits beside the letters; in the narrow side panel it drops under them. */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <div className="flex flex-none gap-2">
            {GAISHI_SCORES.map((s) => (
              <Toggle key={s} size="big" on={value.includes(s)} onClick={() => onChange({ gaishiScores: toggleIn(value, s) })}>
                {s}
              </Toggle>
            ))}
          </div>
          <p className="min-w-[180px] flex-1 text-[11px] leading-snug text-muted">{t.gaishiHelp}</p>
        </div>
        <p aria-live="polite" className={cx('mt-1 text-[11.5px] leading-[14px] font-semibold', conflict ? 'text-pick-ink' : 'text-ink')}>
          {hint}
        </p>
      </FilterRow>
    </div>
  );
});
