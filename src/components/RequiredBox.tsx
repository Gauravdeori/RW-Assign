import { useI18n } from '../i18n';
import { cx } from '../lib/cx';
import { PRESS } from './controlStyles';

/**
 * The small "Required" box beside a filter name. Ticked (default): candidates must match the filter.
 * Unticked: nice to have. Ticked uses the red picked look; a larger invisible hit area makes it easy to tap.
 */
export function RequiredBox({ on, name, onChange }: { on: boolean; name: string; onChange: (on: boolean) => void }) {
  const { t } = useI18n();
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={on}
      aria-label={t.requiredFor(name)}
      title={t.requiredHint}
      onClick={() => onChange(!on)}
      data-required
      className={cx(
        'relative flex h-[14px] w-[14px] flex-none items-center justify-center rounded-[3px] border after:absolute after:-inset-[7px] after:content-[""]',
        PRESS,
        on ? 'border-pick-line bg-pick text-pick-ink' : 'border-muted/70 bg-field hover:border-accent',
      )}
    >
      {on && (
        <svg viewBox="0 0 12 12" aria-hidden className="h-[10px] w-[10px]">
          <path d="M2 6.5 4.8 9 10 3" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      )}
    </button>
  );
}
