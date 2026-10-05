import type { ReactNode } from 'react';
import { cx } from '../lib/cx';
import { OFF, PICKED, PRESS } from './controlStyles';
import { SteadyText } from './SteadyText';

/** Small pill for multi-select lists (qualifications): red when picked. */
export function Chip({ on, onClick, children, title }: { on: boolean; onClick: () => void; children: ReactNode; title?: string }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      title={title}
      onClick={onClick}
      className={cx(
        'inline-flex h-7 items-center rounded-full border px-2 text-[12.5px] leading-none whitespace-nowrap',
        PRESS,
        on ? PICKED : OFF,
      )}
    >
      <SteadyText>{children}</SteadyText>
    </button>
  );
}
