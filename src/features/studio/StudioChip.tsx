import type { ReactNode } from 'react';

/** Rounded chip in the monospace caption style. */
export function StudioChip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-[22px] items-center rounded-full border border-tile-line px-2 font-mono text-[10.5px] tracking-[0.06em] whitespace-nowrap text-ink/80">
      {children}
    </span>
  );
}
