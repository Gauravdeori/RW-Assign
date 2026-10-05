import type { ReactNode } from 'react';
import { CONFIG } from '../../../config';
import { useFitBoxes } from '../../../hooks/useFitBoxes';

/** The four filter boxes: a 2x2 grid with equal tracks on desktop (stacked on phones), scaled together to fit. */
export function Zones({ children, label }: { children: ReactNode; label: string }) {
  const ref = useFitBoxes<HTMLDivElement>(CONFIG.fitMinScale);
  return (
    <div
      ref={ref}
      role="region"
      aria-label={label}
      className="grid grid-cols-1 gap-3 lg:h-full lg:grid-cols-2 lg:grid-rows-[minmax(0,1fr)_minmax(0,1fr)]"
    >
      {children}
    </div>
  );
}
