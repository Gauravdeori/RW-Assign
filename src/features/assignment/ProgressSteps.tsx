import { memo } from 'react';
import { useI18n } from '../../i18n';
import { cx } from '../../lib/cx';
import { PROGRESS_STEPS, type Assignment } from '../../types';

/**
 * Five arrow steps, Reached out > Met > Job sent > Interview > Hired. Done steps are solid green with white text,
 * the rest light grey. Job sent and Interview carry a count when there is more than one.
 * Display only in the prototype.
 */
export const ProgressSteps = memo(function ProgressSteps({
  name,
  stepsDone,
  jobsSent,
  interviews,
}: Pick<Assignment, 'stepsDone' | 'jobsSent' | 'interviews'> & { name: string }) {
  const { t } = useI18n();
  return (
    <ol aria-label={t.assign.progressFor(name)} className="flex items-center">
      {PROGRESS_STEPS.map((step, i) => {
        const done = i < stepsDone;
        const count = step === 'jobSent' ? jobsSent : step === 'interview' ? interviews : 0;
        return (
          <li
            key={step}
            className={cx(
              'step-arrow flex h-[26px] flex-none items-center gap-1 pr-[10px] text-[11.5px] leading-none font-semibold whitespace-nowrap',
              i === 0 ? 'pl-2' : '-ml-[5px] pl-[12px]',
              done ? 'bg-go text-white' : 'bg-step-off text-muted',
            )}
          >
            {t.assign.steps[step]}
            {done && count > 1 && (
              <span className="tabular inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-[3px] text-[11px] font-bold text-go">
                {count}
              </span>
            )}
            <span className="sr-only"> ({t.assign.stepState(done)})</span>
          </li>
        );
      })}
    </ol>
  );
});
