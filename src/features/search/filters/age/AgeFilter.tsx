import { PRESS } from '../../../../components/controlStyles';
import { useI18n } from '../../../../i18n';
import { fromRange, litDecades, toggleDecade } from '../../../../lib/ageRange';
import { cx } from '../../../../lib/cx';
import { AGE_MAX, AGE_MIN, DECADES, type AgeFields } from '../../../../types';
import { AgeBox } from './AgeBox';
import { RangeSlider } from './RangeSlider';

/**
 * Age: five decade buttons, the slider directly under them on the same grid, "From [30] to [56]" boxes and a large
 * "Age 30 to 56" label, all in sync. The rules (continuous decades, which decades a range lights) are in
 * lib/ageRange.ts.
 */
export function AgeFilter({ filters, onChange }: { filters: AgeFields; onChange: (p: AgeFields) => void }) {
  const { t } = useI18n();
  const lit = litDecades(filters);
  const lo = filters.ageMin;
  const hi = filters.ageMax;
  const setRange = (min: number, max: number) => onChange(fromRange(min, max));

  return (
    <div className="flex flex-col gap-1">
      <div role="group" aria-label={t.rowAge} className="grid grid-cols-5">
        {DECADES.map((d, i) => {
          const on = lit.includes(d);
          return (
            <button
              key={d}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(toggleDecade(filters, d))}
              className={cx(
                'relative h-[var(--ctl-h)] text-[13px]',
                PRESS,
                i === 0 && 'rounded-l',
                i === DECADES.length - 1 && 'rounded-r',
                on
                  ? 'z-[1] bg-pick font-semibold text-pick-ink shadow-[inset_0_0_0_1px_var(--pick-line)]'
                  : 'bg-field text-ink shadow-[inset_0_0_0_1px_var(--line)] hover:shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--accent)_50%,transparent)]',
              )}
            >
              {t.decade(d)}
            </button>
          );
        })}
      </div>
      <RangeSlider lo={lo} hi={hi} active={filters.ageMode !== 'any'} onChange={setRange} />
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-[12.5px] text-muted">
          {t.ageFrom && <span>{t.ageFrom}</span>}
          <AgeBox
            value={lo}
            label={t.ageMinLabel}
            accept={(v) => v >= AGE_MIN && v <= AGE_MAX}
            onCommit={(v) => setRange(v, Math.max(v, hi))}
          />
          <span>{t.ageTo}</span>
          <AgeBox
            value={hi}
            label={t.ageMaxLabel}
            accept={(v) => v >= Math.max(lo, AGE_MIN) && v <= AGE_MAX}
            onCommit={(v) => setRange(lo, v)}
          />
          {t.ageUnit && <span>{t.ageUnit}</span>}
        </div>
        <p className="tabular text-[18px] leading-none font-bold whitespace-nowrap" aria-live="polite">
          {filters.ageMode === 'any' ? t.anyAge : t.ageLabel(lo, hi)}
        </p>
      </div>
    </div>
  );
}
