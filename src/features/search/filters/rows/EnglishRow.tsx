import { memo, useId, useState } from 'react';
import { FilterRow } from '../../../../components/FilterRow';
import { Segmented } from '../../../../components/Segmented';
import { useI18n } from '../../../../i18n';
import { cx } from '../../../../lib/cx';
import { toeicLevel } from '../../../../lib/languageTests';
import { LEVELS, type LevelFilter } from '../../../../types';
import { CAPTION, reqFor, type Patch, type Req } from '../rowKit';
import { ToeicBox } from './ToeicBox';

/**
 * English level (this level or higher), with a TOEIC box beside it: typing a score picks the matching level
 * (Native is never set by TOEIC). Picking another level clears a score that no longer matches it.
 */
export const EnglishRow = memo(function EnglishRow({
  level,
  toeic,
  onChange,
  optional,
  onRequired,
}: Req & { level: LevelFilter; toeic: number | null; onChange: Patch }) {
  const { t } = useI18n();
  const captionId = useId();
  const [invalid, setInvalid] = useState(false);
  const pickLevel = (l: LevelFilter) => {
    const next = level === l ? 'any' : l;
    onChange({ englishMin: next, toeic: toeic !== null && next !== 'any' && toeicLevel(toeic) === next ? toeic : null });
  };
  const caption = invalid ? t.toeicRange : toeic === null ? t.toeicLabel : t.toeicIs(toeic, toeicLevel(toeic));
  return (
    <FilterRow label={t.englishLevel} required={reqFor({ optional, onRequired }, 'english')}>
      <div className="flex flex-wrap items-start gap-x-2 gap-y-1">
        <div>
          <Segmented
            label={t.englishLevel}
            options={LEVELS}
            value={level === 'any' ? null : level}
            labels={t.level}
            onPick={pickLevel}
            dense
          />
          <p className={CAPTION}>{t.orHigher}</p>
        </div>
        <div className="flex flex-col items-end">
          <ToeicBox
            value={toeic}
            describedBy={captionId}
            onInvalid={setInvalid}
            onScore={(v) => onChange(v === null ? { toeic: null, englishMin: 'any' } : { toeic: v, englishMin: toeicLevel(v) })}
          />
          <p id={captionId} className={cx(CAPTION, (invalid || toeic !== null) && 'font-semibold text-pick-ink')} aria-live="polite">
            {caption}
          </p>
        </div>
      </div>
    </FilterRow>
  );
});
