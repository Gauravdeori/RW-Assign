import { useEffect, useId, useRef } from 'react';
import { OFF, PRESS } from '../../components/controlStyles';
import { useI18n } from '../../i18n';
import { MAX_COUNT } from '../../lib/assignment';
import { cx } from '../../lib/cx';
import { PROGRESS_STEPS, type Assignment } from '../../types';
import { Popover } from './Popover';
import { ROW_BTN, SECONDARY_BTN } from './styles';

const Check = () => (
  <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M2.5 6.2 5 8.5l4.5-5" />
  </svg>
);

/**
 * Progress editor under a row's arrows: tick the steps done (they stay in order) and set how many jobs were sent and
 * interviews held. Every change applies at once; Done, Esc or a click outside closes.
 */
export function ProgressPopover({
  anchor,
  a,
  onSteps,
  onCount,
  onClose,
}: {
  anchor: HTMLElement;
  a: Assignment;
  onSteps: (steps: number) => void;
  onCount: (key: 'jobsSent' | 'interviews', n: number) => void;
  onClose: (refocus: boolean) => void;
}) {
  const { t } = useI18n();
  const titleId = useId();
  const first = useRef<HTMLButtonElement>(null);
  useEffect(() => first.current?.focus(), []);

  return (
    <Popover anchor={anchor} width={340} room={380} labelledBy={titleId} onClose={onClose}>
      <p id={titleId} className="text-[13px] font-bold">
        {t.assign.progressFor(t.assign.name(a.firstName, a.lastName))}
      </p>
      <ul className="mt-2 flex flex-col gap-1.5">
        {PROGRESS_STEPS.map((step, i) => {
          const done = i < a.stepsDone;
          const key = step === 'jobSent' ? 'jobsSent' : step === 'interview' ? 'interviews' : null;
          return (
            <li key={step} className="flex items-center gap-2">
              <button
                ref={i === 0 ? first : undefined}
                type="button"
                aria-pressed={done}
                // Ticking a step ticks the ones before it; unticking it unticks the ones after it.
                onClick={() => onSteps(done ? i : i + 1)}
                className={cx(
                  'flex h-[38px] min-w-0 flex-1 items-center gap-2.5 rounded-md border px-3 text-left text-[15px]',
                  PRESS,
                  done ? 'border-go bg-go-tint font-semibold text-go-ink' : OFF,
                )}
              >
                <span
                  aria-hidden
                  className={cx(
                    'flex h-5 w-5 flex-none items-center justify-center rounded-full border',
                    done ? 'border-go bg-go text-white' : 'border-line',
                  )}
                >
                  {done && <Check />}
                </span>
                <span className="truncate">{t.assign.steps[step]}</span>
              </button>
              {key && (
                <div
                  role="group"
                  aria-label={t.assign.countValue(t.assign.counts[key], a[key])}
                  className="flex flex-none items-center gap-1"
                >
                  <button
                    type="button"
                    aria-label={t.assign.less(t.assign.counts[key])}
                    disabled={!done || a[key] <= 1}
                    onClick={() => onCount(key, a[key] - 1)}
                    className={cx(ROW_BTN, 'h-[38px] w-[32px] px-0 text-[18px]')}
                  >
                    <span aria-hidden>−</span>
                  </button>
                  <span aria-hidden className={cx('tabular w-[26px] text-center text-[15px] font-bold', !done && 'text-muted/60')}>
                    {a[key]}
                  </span>
                  <button
                    type="button"
                    aria-label={t.assign.more(t.assign.counts[key])}
                    disabled={!done || a[key] >= MAX_COUNT}
                    onClick={() => onCount(key, a[key] + 1)}
                    className={cx(ROW_BTN, 'h-[38px] w-[32px] px-0 text-[18px]')}
                  >
                    <span aria-hidden>+</span>
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      <p className="mt-2.5 text-[13px] leading-snug text-muted">{t.assign.progressHint}</p>
      <div className="mt-2.5 flex justify-end">
        <button type="button" onClick={() => onClose(true)} className={SECONDARY_BTN}>
          {t.assign.done}
        </button>
      </div>
    </Popover>
  );
}
