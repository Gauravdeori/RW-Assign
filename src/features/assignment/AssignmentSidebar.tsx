import { memo } from 'react';
import { useAnimatedNumber } from '../../hooks/useAnimatedNumber';
import { fmtNum, useI18n } from '../../i18n';
import type { Summary } from '../../lib/assignment';
import type { AssignmentView } from '../../types';
import { COUNT_CARD } from '../search/results/countCardStyle';
import { StatusSummary } from './StatusSummary';
import { ViewSwitch } from './ViewSwitch';

/**
 * Left panel (250px): the big red count, whose meaning follows the view (need action / not acted on / unassigned),
 * the view switch and the status counts. Below 1100px the three cards sit side by side above the table.
 */
export const AssignmentSidebar = memo(function AssignmentSidebar({
  view,
  onView,
  summary,
  teamSize,
}: {
  view: AssignmentView;
  onView: (v: AssignmentView) => void;
  summary: Summary;
  /** Recruiters in my team, for "across 6 recruiters in your team". */
  teamSize: number;
}) {
  const { t } = useI18n();
  const count = view === 'individual' ? summary.needAction : view === 'team' ? summary.notActed : summary.pool;
  const shown = useAnimatedNumber(count);
  return (
    <aside aria-label={t.assign.pageLabel} className="grid content-start gap-3 sm:grid-cols-3 desk:grid-cols-1">
      <div className={`flex flex-col justify-center rounded-[10px] px-5 py-4 ${COUNT_CARD}`}>
        <div aria-hidden className="tabular text-[56px] leading-none font-extrabold tracking-[-0.03em] text-white">
          {fmtNum(shown)}
        </div>
        <p className="mt-2 text-[15px] leading-tight font-bold text-on-accent" aria-live="polite" aria-atomic="true">
          <span className="sr-only">{fmtNum(count)} </span>
          {t.assign.countLabel[view]}
        </p>
        <p className="mt-0.5 text-[13px] leading-tight text-on-accent">{t.assign.countSub(view, teamSize)}</p>
      </div>
      <ViewSwitch value={view} onChange={onView} />
      <StatusSummary summary={summary} />
    </aside>
  );
});
