import type { ReactNode } from 'react';

/** Text that keeps the width of its semibold version, so a button does not grow when it is picked. */
export function SteadyText({ children }: { children: ReactNode }) {
  return (
    <span className="grid">
      <span className="col-start-1 row-start-1">{children}</span>
      <span aria-hidden className="invisible col-start-1 row-start-1 h-0 font-semibold">
        {children}
      </span>
    </span>
  );
}
