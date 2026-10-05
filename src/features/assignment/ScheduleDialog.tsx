import { useId, useMemo, useState } from 'react';
import { Modal } from '../../components/Modal';
import { useI18n } from '../../i18n';
import { nextWorkingDays } from '../../lib/assignment';
import { ASSIGNMENT_NOW, OPEN_TIMES } from '../../lib/assignmentMock';
import { cx } from '../../lib/cx';
import type { Assignment, MeetingType, Recruiter } from '../../types';
import { CAPTION, PRIMARY_BTN, SECONDARY_BTN, choice } from './styles';

const MEETINGS: MeetingType[] = ['video', 'office', 'phone'];

/**
 * Calendly-style scheduling: pick a meeting type and any of the recruiter's open times over the next three working
 * days. The candidate gets those times by email and picks one; both then get a calendar invite (not in the prototype).
 */
export function ScheduleDialog({
  candidate,
  recruiter,
  onSend,
  onClose,
}: {
  candidate: Assignment;
  recruiter: Recruiter;
  onSend: (meeting: MeetingType, times: string[]) => void;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const titleId = useId();
  const typeId = useId();
  const [meeting, setMeeting] = useState<MeetingType>('video');
  const [picked, setPicked] = useState<string[]>([]);
  const days = useMemo(() => nextWorkingDays(ASSIGNMENT_NOW, OPEN_TIMES.length), []);
  const toggle = (slot: string) => setPicked((p) => (p.includes(slot) ? p.filter((s) => s !== slot) : [...p, slot]));

  return (
    <Modal labelledBy={titleId} onClose={onClose} className="max-w-[500px] rounded-xl p-6">
      <h2 id={titleId} className="text-[20px] leading-tight font-bold">
        {t.assign.scheduleTitle(t.assign.name(candidate.firstName, candidate.lastName))}
      </h2>
      <p className="mt-1.5 text-[15px] text-muted">
        {t.assign.scheduleSub(candidate.firstName, t.assign.name(recruiter.firstName, recruiter.lastName))}
      </p>

      <p id={typeId} className={cx(CAPTION, 'mt-5')}>
        {t.assign.meetingType}
      </p>
      <div role="radiogroup" aria-labelledby={typeId} className="mt-2 flex flex-wrap gap-2">
        {MEETINGS.map((m) => (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={meeting === m}
            onClick={() => setMeeting(m)}
            className={cx(choice(meeting === m), 'h-[38px] justify-center px-3 text-[15px]')}
          >
            {t.assign.meeting[m]}
          </button>
        ))}
      </div>

      <div role="group" aria-label={t.assign.openTimes}>
        {days.map((day, i) => (
          <div key={day} role="group" aria-labelledby={`${typeId}-${day}`}>
            <p id={`${typeId}-${day}`} className={cx(CAPTION, 'mt-4')}>
              {t.assign.day(day)}
            </p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {OPEN_TIMES[i].map((time) => {
                const slot = `${day}T${time}`;
                const on = picked.includes(slot);
                return (
                  <button
                    key={slot}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggle(slot)}
                    className={cx(choice(on), 'tabular h-[38px] justify-start px-3 text-[15px]')}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <p aria-live="polite" className="mt-3 text-[13px] text-muted">
        {t.assign.timesSelected(picked.length)}
      </p>

      <div className="mt-5 flex justify-end gap-2">
        <button type="button" onClick={onClose} className={SECONDARY_BTN}>
          {t.cancel}
        </button>
        <button type="button" disabled={picked.length === 0} onClick={() => onSend(meeting, picked)} className={PRIMARY_BTN}>
          {t.assign.sendTimes(picked.length, candidate.firstName)}
        </button>
      </div>
    </Modal>
  );
}
