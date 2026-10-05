import { cx } from '../lib/cx';
import { PRESS } from './controlStyles';
import { SteadyText } from './SteadyText';

/**
 * A row of joined buttons where at most one is picked (language levels, JLPT); clicking the picked one again
 * clears it. Same look as the age decades.
 */
export function Segmented<T extends string>({
  options,
  value,
  labels,
  titles,
  onPick,
  label,
  dense,
}: {
  options: readonly T[];
  value: T | null;
  labels?: Partial<Record<T, string>>;
  titles?: Partial<Record<T, string>>;
  onPick: (v: T) => void;
  /** Group name for screen readers. */
  label: string;
  /** Tighter buttons, so a level row and its JLPT buttons share one line. */
  dense?: boolean;
}) {
  return (
    // Wraps only when there is no room (the narrow side panel); the full-screen boxes keep each group on one line.
    <div role="group" aria-label={label} className="flex flex-wrap gap-y-1">
      {options.map((o, i) => {
        const on = value === o;
        return (
          <button
            key={o}
            type="button"
            aria-pressed={on}
            title={titles?.[o]}
            onClick={() => onPick(o)}
            className={cx(
              'relative flex h-[var(--ctl-h)] items-center justify-center leading-none whitespace-nowrap',
              dense ? 'px-[5px] text-[12px]' : 'px-2 text-[12.5px]',
              PRESS,
              i === 0 && 'rounded-l',
              i === options.length - 1 && 'rounded-r',
              on
                ? 'z-[1] bg-pick font-semibold text-pick-ink shadow-[inset_0_0_0_1px_var(--pick-line)]'
                : 'bg-field text-ink shadow-[inset_0_0_0_1px_var(--line)] hover:shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--accent)_50%,transparent)]',
            )}
          >
            <SteadyText>{labels?.[o] ?? o}</SteadyText>
          </button>
        );
      })}
    </div>
  );
}
