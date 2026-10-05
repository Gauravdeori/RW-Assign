import type { ReactNode } from 'react';

/** One titled section of the CV preview. */
export function CvSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-6">
      <h3 className="border-b border-line pb-2 text-[13px] font-bold">{title}</h3>
      <div className="mt-3 text-[13px] leading-relaxed">{children}</div>
    </section>
  );
}
