import type { ReactNode } from 'react';

/** Card heading with the red dot. */
export function DotHeading({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <h2 id={id} className="flex items-baseline gap-2.5 text-[17px] leading-snug font-medium sm:text-[18px]">
      <span aria-hidden className="h-2 w-2 flex-none -translate-y-[2px] rounded-full bg-accent" />
      <span>{children}</span>
    </h2>
  );
}
