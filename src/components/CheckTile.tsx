import { cx } from '../lib/cx';
import { CONTROL, OFF, PICKED } from './controlStyles';

/** Checkbox tile used for industry and position: shows a red tick when on. Labels stay on one line. */
export function CheckTile({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={on}
      onClick={onClick}
      className={cx(
        'flex h-[var(--ctl-h)] items-center gap-1.5 px-2.5 text-left text-[13px] leading-none whitespace-nowrap',
        CONTROL,
        on ? PICKED : OFF,
      )}
    >
      <span
        aria-hidden
        className={cx(
          'flex h-[14px] w-[14px] flex-none items-center justify-center rounded-[3px] border',
          on ? 'border-accent bg-accent text-white' : 'border-muted/70',
        )}
      >
        {on && (
          <svg viewBox="0 0 12 12" className="h-[10px] w-[10px]">
            <path d="M2 6.5 4.8 9 10 3" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
        )}
      </span>
      <span>{label}</span>
    </button>
  );
}
