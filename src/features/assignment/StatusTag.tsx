import { useI18n } from '../../i18n';
import { cx } from '../../lib/cx';
import type { StatusInfo } from '../../lib/assignment';
import type { AssignmentStatus } from '../../types';

const TONE: Record<AssignmentStatus, string> = {
  notActed: 'bg-pick text-pick-ink',
  reassigned: 'bg-amber-tint text-amber-ink',
  inProgress: 'bg-go-tint text-go-ink',
  hired: 'bg-go-tint text-go-ink',
  unassigned: 'bg-step-off text-muted',
};

/** Status tag: red "Not acted on · 2d", orange Reassigned, green In progress / Hired, grey Unassigned. */
export function StatusTag({ status }: { status: StatusInfo }) {
  const { t } = useI18n();
  const red = status.kind === 'notActed';
  return (
    <span
      title={red ? t.assign.notActedForLong(status.days) : undefined}
      className={cx('inline-flex h-[26px] items-center rounded px-2 text-[13px] font-bold whitespace-nowrap', TONE[status.kind])}
    >
      {red ? t.assign.notActedFor(status.days) : t.assign.status[status.kind]}
    </span>
  );
}
