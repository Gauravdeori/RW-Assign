import type { ReactNode } from 'react';

/** Small letter-spaced heading, e.g. CONVERSION MODE. */
export function CapsHeading({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <h2 id={id} className="mono-caps text-[11px] font-semibold text-ink">
      {children}
    </h2>
  );
}
