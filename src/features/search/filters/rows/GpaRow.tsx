import { memo, useId, useState } from 'react';
import { FilterRow } from '../../../../components/FilterRow';
import { Toggle } from '../../../../components/Toggle';
import { useI18n } from '../../../../i18n';
import { cx } from '../../../../lib/cx';
import { GPA_MAX, GPA_STEP } from '../../../../types';
import { reqFor, type Patch, type Req } from '../rowKit';
import { GpaBox } from './GpaBox';

/** Minimum GPA, normalised to a 4.0 scale: Any, or a slider / box from 0.1 to 4.0 in steps of 0.1. */
export const GpaRow = memo(function GpaRow({ value, onChange, optional, onRequired }: Req & { value: number | null; onChange: Patch }) {
  const { t } = useI18n();
  const helpId = useId();
  const [invalid, setInvalid] = useState(false);
  const set = (v: number | null) => onChange({ gpaMin: v });
  return (
    <FilterRow label={t.gpaLabel} required={reqFor({ optional, onRequired }, 'gpa')}>
      <div className="flex items-center gap-3">
        <Toggle on={value === null} onClick={() => set(null)}>
          {t.any}
        </Toggle>
        <input
          type="range"
          min={0}
          max={GPA_MAX}
          step={GPA_STEP}
          value={value ?? 0}
          aria-label={t.gpaSlider}
          aria-valuetext={value === null ? t.any : value.toFixed(1)}
          onChange={(e) => {
            const v = Math.round(Number(e.target.value) * 10) / 10;
            set(v > 0 ? v : null);
          }}
          className={cx(
            'h-4 w-full max-w-[150px] min-w-[80px] cursor-pointer',
            value === null ? 'accent-[var(--muted)]' : 'accent-[var(--accent)]',
          )}
        />
        <GpaBox value={value} onCommit={set} onInvalid={setInvalid} describedBy={helpId} />
        <span
          id={helpId}
          aria-live="polite"
          className={cx('text-[11.5px] leading-tight', invalid ? 'font-semibold text-pick-ink' : 'text-muted')}
        >
          {invalid ? t.gpaRange : t.gpaHelp}
        </span>
      </div>
    </FilterRow>
  );
});
