import { useId, type ReactNode } from 'react';
import { CONFIG } from '../config';
import { cx } from '../lib/cx';

/**
 * Text input: control height, 14px text, 12px side padding, 1px #D9D9D9 border, 4px corners.
 * Phones use 16px text so iOS Safari does not zoom in when the field is tapped.
 */
export function TextField({
  label,
  value,
  onChange,
  trailing,
  hideLabel,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  trailing?: ReactNode;
  /** The row label already says what this is: keep the label for screen readers only. */
  hideLabel?: boolean;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={cx('min-w-0', className)}>
      <label htmlFor={id} className={hideLabel ? 'sr-only' : 'mb-0.5 block text-[11.5px] leading-[13px] text-muted'}>
        {label}
      </label>
      <div className="flex">
        <input
          id={id}
          type="text"
          autoComplete="off"
          maxLength={CONFIG.textInputMaxLength}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cx(
            'h-[var(--ctl-h)] w-full min-w-0 rounded border border-line bg-field px-3 text-[16px] text-ink outline-none sm:text-[14px]',
            'hover:border-accent/50 focus:border-accent',
            'focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-accent',
            trailing ? 'rounded-r-none' : undefined,
          )}
        />
        {trailing}
      </div>
    </div>
  );
}
