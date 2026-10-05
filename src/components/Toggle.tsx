import type { ReactNode } from 'react';
import { cx } from '../lib/cx';
import { CONTROL, OFF, PICKED } from './controlStyles';

const TOGGLE_SIZE = {
  md: 'h-[var(--ctl-h)] px-3 text-[13px]',
  /** Compact lists (the degree lines): 32px. */
  sm: 'h-8 px-3 text-[13px]',
  /** Single letters (S, A, B...): square. */
  square: 'h-[var(--ctl-h)] w-9 text-[13px] font-bold',
  /** Small buttons in a toolbar (sort order). */
  xs: 'h-8 px-2.5 text-[12px]',
  /** The main Gaishi score letters: 40px squares. */
  big: 'h-10 w-10 text-[18px] font-bold',
};

/** One-click toggle button. */
export function Toggle({
  on,
  onClick,
  children,
  className,
  label,
  title,
  size = 'md',
}: {
  on: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
  label?: string;
  /** Tooltip with the full wording when the button shows a short one. */
  title?: string;
  size?: keyof typeof TOGGLE_SIZE;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={label}
      title={title}
      onClick={onClick}
      className={cx(
        'inline-flex items-center justify-center gap-1.5 leading-none whitespace-nowrap',
        TOGGLE_SIZE[size],
        CONTROL,
        on ? PICKED : OFF,
        className,
      )}
    >
      {children}
    </button>
  );
}
