import { cx } from '../../lib/cx';

/** Rounded on/off switch for settings. */
export function PillSwitch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cx('relative h-6 w-11 flex-none rounded-full transition-colors', checked ? 'bg-accent' : 'bg-tile-line')}
    >
      <span
        aria-hidden
        className={cx(
          'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-[left] duration-150',
          checked ? 'left-[22px]' : 'left-0.5',
        )}
      />
    </button>
  );
}
