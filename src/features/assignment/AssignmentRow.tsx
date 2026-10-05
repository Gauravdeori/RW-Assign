import { memo } from 'react';
import { FileIcon } from '../../components/icons/FileIcon';
import { useI18n } from '../../i18n';
import type { StatusInfo } from '../../lib/assignment';
import { cx } from '../../lib/cx';
import type { Assignment, Recruiter } from '../../types';
import { Avatar } from './Avatar';
import { CalendarIcon } from './CalendarIcon';
import { ProgressSteps } from './ProgressSteps';
import { StatusTag } from './StatusTag';
import { ROW_BTN, ROW_PRIMARY_BTN } from './styles';

export interface RowHandlers {
  onCv: (id: string) => void;
  onAssign: (id: string, anchor: HTMLElement) => void;
  onReassign: (id: string) => void;
  onSchedule: (id: string) => void;
  onProgress: (id: string, anchor: HTMLElement) => void;
}

/** Red and orange rows get a 4px bar on the left edge. */
const BAR: Partial<Record<StatusInfo['kind'], string>> = {
  notActed: 'shadow-[inset_4px_0_0_var(--accent)]',
  reassigned: 'shadow-[inset_4px_0_0_var(--amber)]',
};

/** One candidate: who they are, their CV, who has them, the actions, how far they have got and their status. */
export const AssignmentRow = memo(function AssignmentRow({
  a,
  status,
  recruiter,
  isYou,
  assignOpen,
  progressOpen,
  handlers,
}: {
  a: Assignment;
  status: StatusInfo;
  recruiter: Recruiter | undefined;
  /** Show "You" under the recruiter's name (My assignments). */
  isYou: boolean;
  assignOpen: boolean;
  progressOpen: boolean;
  handlers: RowHandlers;
}) {
  const { t } = useI18n();
  const name = t.assign.name(a.firstName, a.lastName);
  const titleAt = t.assign.titleAt(a.title, a.company);
  // Second line under the status: why it was handed on, or where the meeting stands.
  const note =
    status.kind === 'reassigned' && a.reassignReason
      ? { text: t.assign.reasonShort[a.reassignReason], title: t.assign.reassignedBecause(t.assign.reasons[a.reassignReason]) }
      : a.meeting?.picked
        ? {
            text: t.assign.slot(a.meeting.picked),
            title: t.assign.bookedLine(t.assign.slot(a.meeting.picked), t.assign.meeting[a.meeting.type]),
          }
        : a.meeting
          ? { text: t.assign.waiting(a.meeting.offered.length), title: t.assign.waitingLong(a.firstName, a.meeting.offered.length) }
          : null;
  return (
    <tr className="border-t border-panel-line">
      <td className={cx('py-[7px] pr-2 pl-4', BAR[status.kind])}>
        <div className="truncate text-[16px] leading-[20px] font-bold">{name}</div>
        <div className="truncate text-[13px] leading-[17px] text-muted" title={titleAt}>
          {titleAt}
        </div>
        <div className="truncate text-[13px] leading-[17px] text-muted">{t.assign.received(a.receivedAt)}</div>
      </td>
      <td className="px-2">
        <button type="button" aria-label={t.assign.cvFor(name)} onClick={() => handlers.onCv(a.id)} className={ROW_BTN}>
          <FileIcon className="h-4 w-4 flex-none text-muted" />
          {t.assign.cv}
        </button>
      </td>
      <td className="px-2">
        {recruiter ? (
          <div className="flex min-w-0 items-center gap-2">
            <Avatar recruiter={recruiter} />
            <div className="min-w-0">
              <div className="truncate text-[15px] leading-[19px] font-semibold">
                {t.assign.name(recruiter.firstName, recruiter.lastName)}
              </div>
              <div className="truncate text-[13px] leading-[17px] text-muted">{isYou ? t.assign.you : t.assign.team[recruiter.team]}</div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            aria-label={t.assign.assignFor(name)}
            aria-haspopup="dialog"
            aria-expanded={assignOpen}
            onClick={(e) => handlers.onAssign(a.id, e.currentTarget)}
            className={ROW_PRIMARY_BTN}
          >
            {t.assign.assign}
          </button>
        )}
      </td>
      <td className="px-2">
        <button
          id={`reassign-${a.id}`}
          type="button"
          disabled={!recruiter}
          aria-label={t.assign.reassignFor(name)}
          aria-haspopup="dialog"
          onClick={() => handlers.onReassign(a.id)}
          className={ROW_BTN}
        >
          {t.assign.reassign}
        </button>
      </td>
      <td className="px-2">
        <button
          type="button"
          disabled={!recruiter}
          aria-label={t.assign.scheduleFor(name)}
          aria-haspopup="dialog"
          onClick={() => handlers.onSchedule(a.id)}
          className={ROW_BTN}
        >
          {t.assign.schedule}
        </button>
      </td>
      <td className="px-2">
        <ProgressSteps
          name={name}
          stepsDone={a.stepsDone}
          jobsSent={a.jobsSent}
          interviews={a.interviews}
          open={progressOpen}
          onEdit={recruiter ? (anchor) => handlers.onProgress(a.id, anchor) : undefined}
        />
      </td>
      <td className="px-2 pr-3">
        <StatusTag status={status} />
        {note && (
          <div className="mt-1 truncate text-[13px] leading-[17px] text-muted" title={note.title}>
            {a.meeting?.picked && status.kind !== 'reassigned' && <CalendarIcon />}
            {note.text}
          </div>
        )}
      </td>
    </tr>
  );
});
