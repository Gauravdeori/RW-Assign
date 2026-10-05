import { memo } from 'react';
import { useI18n } from '../../i18n';
import { cx } from '../../lib/cx';
import { PROGRESS_STEPS, type Assignment } from '../../types';

/**
 * Five arrow steps, Reached out > Met > Job sent > Interview > Hired. Done steps are solid green with white text,
 * the rest light grey. Job sent and Interview carry a count when there is more than one.
 * With a recruiter, the arrows are a button that opens the progress editor; in the pool they are display only.
 */
export const ProgressSteps = memo(function ProgressSteps({
  name,
  stepsDone,
  jobsSent,
  interviews,
  open,
  onEdit,
}: Pick<Assignment, 'stepsDone' | 'jobsSent' | 'interviews'> & {
  name: string;
  open: boolean;
  /** Absent while the candidate has no recruiter. */
  onEdit?: (anchor: HTMLElement) => void;
}) {
  const { t } = useI18n();
  const done = PROGRESS_STEPS.slice(0, stepsDone).map((s) => t.assign.steps[s]);
  const arrows = (
    <span aria-hidden className="flex items-center">
      {PROGRESS_STEPS.map((step, i) => {
        const on = i < stepsDone;
        const count = step === 'jobSent' ? jobsSent : step === 'interview' ? interviews : 0;
        return (
          <span
            key={step}
            className={cx(
              'step-arrow flex h-[26px] flex-none items-center gap-1 pr-[10px] text-[11.5px] leading-none font-semibold whitespace-nowrap',
              i === 0 ? 'pl-2' : '-ml-[5px] pl-[12px]',
              on ? 'bg-go text-white' : 'bg-step-off text-muted',
            )}
          >
            {t.assign.steps[step]}
            {on && count > 1 && (
              <span className="tabular inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-[3px] text-[11px] font-bold text-go">
                {count}
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
  const summary = t.assign.progressSummary(name, done);

  if (!onEdit)
    return (
      <span className="inline-flex" title={t.assign.assignFirst}>
        <span className="sr-only">{summary}</span>
        {arrows}
      </span>
    );
  return (
    <button
      type="button"
      aria-haspopup="dialog"
      aria-expanded={open}
      title={t.assign.changeProgress}
      onClick={(e) => onEdit(e.currentTarget)}
      className={cx(
        '-m-1 inline-flex rounded-md p-1 transition-shadow hover:shadow-[0_0_0_1px_var(--line)]',
        open && 'shadow-[0_0_0_1px_var(--accent)]',
      )}
    >
      <span className="sr-only">{summary}</span>
      {arrows}
    </button>
  );
});
