import { cx } from '../../lib/cx';
import type { Conversion } from '../../types';
import { useStudioLabels } from './useStudioLabels';

/** Exported (green) or Awaiting review (amber). */
export function StatusPill({ status }: { status: Conversion['status'] }) {
  const { s } = useStudioLabels();
  return (
    <span
      className={cx(
        'mono-caps inline-flex h-7 items-center gap-1.5 rounded-full border px-3 text-[10px] whitespace-nowrap',
        status === 'exported' ? 'border-ok/70 text-ok' : 'border-warn/70 text-warn',
      )}
    >
      <span aria-hidden className={cx('h-1.5 w-1.5 rounded-full', status === 'exported' ? 'bg-ok' : 'bg-warn')} />
      {s.status[status]}
    </span>
  );
}
