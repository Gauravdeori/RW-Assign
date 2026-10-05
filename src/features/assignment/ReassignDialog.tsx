import { useId, useMemo, useState } from 'react';
import { Modal } from '../../components/Modal';
import { useI18n } from '../../i18n';
import { recruiterFor } from '../../lib/assignment';
import { cx } from '../../lib/cx';
import type { Assignment, ReassignReason, Recruiter } from '../../types';
import { CAPTION, FIELD, PRIMARY_BTN, SECONDARY_BTN, choice } from './styles';

const REASONS: ReassignReason[] = ['busy', 'wrong', 'other'];

/**
 * Reassign: pick a reason (one), optionally suggest a recruiter by email. Without a suggestion the candidate goes
 * back to the pool; either way the row turns orange. Esc or Cancel closes without changes.
 */
export function ReassignDialog({
  candidate,
  recruiters,
  onReassign,
  onClose,
}: {
  candidate: Assignment;
  recruiters: readonly Recruiter[];
  onReassign: (reason: ReassignReason, to: Recruiter | null) => void;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const titleId = useId();
  const reasonId = useId();
  const suggestId = useId();
  const [reason, setReason] = useState<ReassignReason>('busy');
  const [suggest, setSuggest] = useState('');
  // Anyone but the recruiter handing it on.
  const others = useMemo(() => recruiters.filter((r) => r.id !== candidate.recruiterId), [recruiters, candidate.recruiterId]);
  const to = recruiterFor(others, suggest);
  const typed = suggest.trim() !== '';
  const name = t.assign.name(candidate.firstName, candidate.lastName);

  return (
    <Modal labelledBy={titleId} onClose={onClose} className="max-w-[460px] rounded-xl p-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onReassign(reason, to);
        }}
      >
        <h2 id={titleId} className="text-[20px] leading-tight font-bold">
          {t.assign.reassignTitle(name)}
        </h2>
        <p className="mt-1.5 text-[15px] text-muted">{t.assign.reassignSub(candidate.firstName)}</p>

        <p id={reasonId} className={cx(CAPTION, 'mt-5')}>
          {t.assign.reason}
        </p>
        <div role="radiogroup" aria-labelledby={reasonId} className="mt-2 flex flex-col gap-2">
          {REASONS.map((r) => (
            <button
              key={r}
              type="button"
              role="radio"
              aria-checked={reason === r}
              onClick={() => setReason(r)}
              className={cx(choice(reason === r), 'h-[38px] w-full justify-start px-3 text-[15px]')}
            >
              {t.assign.reasons[r]}
            </button>
          ))}
        </div>

        <label htmlFor={suggestId} className={cx(CAPTION, 'mt-5 block')}>
          {t.assign.suggest}
        </label>
        <input
          id={suggestId}
          type="text"
          inputMode="email"
          autoComplete="off"
          spellCheck={false}
          placeholder={t.assign.suggestPlaceholder}
          value={suggest}
          onChange={(e) => setSuggest(e.target.value)}
          aria-describedby={typed ? `${suggestId}-hint` : undefined}
          className={cx(FIELD, 'mt-2')}
        />
        {typed && (
          <p id={`${suggestId}-hint`} aria-live="polite" className={cx('mt-1.5 text-[13px]', to ? 'text-go-ink' : 'text-muted')}>
            {to ? t.assign.suggestMatch(t.assign.name(to.firstName, to.lastName), t.assign.team[to.team]) : t.assign.suggestNone}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className={SECONDARY_BTN}>
            {t.cancel}
          </button>
          <button type="submit" className={PRIMARY_BTN}>
            {t.assign.reassign}
          </button>
        </div>
      </form>
    </Modal>
  );
}
