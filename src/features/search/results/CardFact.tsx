import type { ReactNode } from 'react';

/** One labelled fact on a result card (Age, Seniority, ...). */
export function CardFact({ label, children, title }: { label: string; children: ReactNode; title?: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10.5px] leading-[13px] text-muted">{label}</dt>
      <dd className="mt-0.5 truncate text-[12.5px] leading-[16px] font-medium" title={title}>
        {children}
      </dd>
    </div>
  );
}
