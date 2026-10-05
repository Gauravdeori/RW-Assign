import { cx } from '../../lib/cx';

/** Row of big numbers with captions (Dashboard and Admin). Large accent numbers pass contrast as large text. */
export function StatCards({ stats }: { stats: { value: number; label: string; accent?: boolean }[] }) {
  return (
    <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {stats.map((x) => (
        <div key={x.label} className="rounded-[14px] border border-card-line bg-card px-5 py-5 sm:px-6">
          <div className={cx('text-[30px] leading-none font-medium', x.accent && 'text-accent')}>{x.value}</div>
          <div className="mono-caps mt-3 text-[10px] leading-snug text-muted">{x.label}</div>
        </div>
      ))}
    </div>
  );
}
