import type { ReactNode } from 'react';
import { cx } from '../../lib/cx';

/** Rounded card used on the Upload Resume and Dashboard pages (Resume Studio look). */
export function StudioCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section className={cx('rounded-[14px] border border-card-line bg-card p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] sm:p-6', className)}>
      {children}
    </section>
  );
}
