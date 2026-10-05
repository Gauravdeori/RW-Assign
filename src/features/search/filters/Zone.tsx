import { useId, type ReactNode } from 'react';
import { CountBadge } from '../../../components/CountBadge';

/**
 * One framed box of the full-screen search: a 20px bold heading with a short coral bar under it and its
 * active-filter count, then the rows. The body fills the box's grid cell (see useFitBoxes).
 */
export function Zone({ title, count, children }: { title: string; count: number; children: ReactNode }) {
  const id = useId();
  return (
    <section aria-labelledby={id} className="flex min-h-0 min-w-0 flex-col rounded-xl border border-line bg-card shadow-card">
      <h2 id={id} className="flex flex-none items-center gap-2 px-3 pt-2 pb-2 text-[20px] leading-6 font-bold text-ink">
        <span className="relative inline-block after:absolute after:-bottom-[3px] after:left-0 after:h-[3px] after:w-7 after:rounded-full after:bg-accent">
          {title}
        </span>
        <CountBadge n={count} />
      </h2>
      <div data-fit-box className="min-h-0 flex-1 overflow-hidden overscroll-contain">
        <div className="divide-y divide-line px-3 pb-1">{children}</div>
      </div>
    </section>
  );
}
