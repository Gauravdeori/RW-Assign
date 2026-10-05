import { useId } from 'react';
import { CONFIG } from '../../config';
import { fmtNum, useI18n } from '../../i18n';
import type { Summary } from '../../lib/assignment';
import { CAPTION, PANEL } from './styles';

const ROWS = [
  { key: 'notActed', dot: 'bg-accent' },
  { key: 'reassigned', dot: 'bg-amber' },
  { key: 'inProgress', dot: 'bg-go' },
  { key: 'pool', dot: 'bg-muted/50' },
] as const;

/** Status counts for the current view (the pool is always across Robert Walters), and the 48-hour rule. */
export function StatusSummary({ summary }: { summary: Summary }) {
  const { t } = useI18n();
  const id = useId();
  return (
    <section aria-labelledby={id} className={`${PANEL} p-[18px]`}>
      <h2 id={id} className={CAPTION}>
        {t.assign.statusHeading}
      </h2>
      <dl className="mt-1.5">
        {ROWS.map((r) => (
          <div key={r.key} className="flex h-[34px] items-center gap-2.5 border-b border-panel-line text-[15px] last:border-b-0">
            <span aria-hidden className={`h-2 w-2 flex-none rounded-full ${r.dot}`} />
            <dt className="min-w-0 flex-1 truncate">{t.assign.summary[r.key]}</dt>
            <dd className="tabular font-bold">{fmtNum(summary[r.key])}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-2.5 border-t border-panel-line pt-2.5 text-[13px] leading-snug text-muted">
        {t.assign.poolNote(CONFIG.assignmentReturnHours)}
      </p>
    </section>
  );
}
