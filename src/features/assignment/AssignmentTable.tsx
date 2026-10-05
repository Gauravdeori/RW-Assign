import { useI18n } from '../../i18n';
import type { StatusInfo } from '../../lib/assignment';
import type { Assignment, Recruiter } from '../../types';
import { AssignmentRow, type RowHandlers } from './AssignmentRow';
import { PANEL } from './styles';

/** Fixed column widths; the candidate column takes the rest. Fits 1440px wide with no sideways scroll. */
const COLS = ['', 'w-[72px]', 'w-[162px]', 'w-[96px]', 'w-[100px]', 'w-[348px]', 'w-[136px]'];

/**
 * The candidates table: Candidate, CV, Recruiter, Reassign, Schedule, Progress, Status. On narrow screens it scrolls
 * sideways inside its own card, never the page.
 */
export function AssignmentTable({
  rows,
  statuses,
  recruiters,
  you,
  assigningId,
  handlers,
  onShowAll,
}: {
  rows: readonly Assignment[];
  statuses: ReadonlyMap<string, StatusInfo>;
  recruiters: ReadonlyMap<string, Recruiter>;
  /** The signed-in recruiter, when their rows should say "You" (My assignments); null otherwise. */
  you: string | null;
  assigningId: string | null;
  handlers: RowHandlers;
  onShowAll: () => void;
}) {
  const { t } = useI18n();
  const c = t.assign.col;
  const head = [c.candidate, c.cv, c.recruiter, c.reassign, c.schedule, c.progress, c.status];
  return (
    // relative: screen-reader-only text inside is clipped by this scroll box too, so it never widens the page.
    <div className={`${PANEL} relative overflow-x-auto`}>
      <table className="w-full min-w-[1100px] table-fixed border-collapse text-left">
        <caption className="sr-only">{t.assign.tableLabel}</caption>
        <colgroup>
          {COLS.map((w, i) => (
            <col key={i} className={w || undefined} />
          ))}
        </colgroup>
        <thead>
          <tr className="h-10 text-[13px] font-bold text-muted">
            {head.map((label, i) => (
              <th key={i} scope="col" className={i === 0 ? 'pr-2 pl-4' : i === head.length - 1 ? 'px-2 pr-3' : 'px-2'}>
                <span className="block truncate">{label}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr className="border-t border-panel-line">
              <td colSpan={head.length} className="px-4 py-12 text-center text-[15px] text-muted">
                {t.assign.empty}{' '}
                <button type="button" onClick={onShowAll} className="font-semibold text-pick-ink underline underline-offset-2">
                  {t.assign.showAll}
                </button>
              </td>
            </tr>
          ) : (
            rows.map((a) => {
              const status = statuses.get(a.id);
              if (!status) return null;
              return (
                <AssignmentRow
                  key={a.id}
                  a={a}
                  status={status}
                  recruiter={a.recruiterId ? recruiters.get(a.recruiterId) : undefined}
                  isYou={you !== null && a.recruiterId === you}
                  assignOpen={assigningId === a.id}
                  handlers={handlers}
                />
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
