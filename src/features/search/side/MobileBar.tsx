import { useAnimatedNumber } from '../../../hooks/useAnimatedNumber';
import { fmtNum, useI18n } from '../../../i18n';
import { COUNT_CARD } from '../results/countCardStyle';

/**
 * Phones and tablets: sticky bar with the live count and one button: "Filters (6)" (opens the sheet) on the
 * results, or "Show candidates" on the full search (pass `label`).
 */
export function MobileBar({
  count,
  active,
  onOpen,
  label,
}: {
  count: number | undefined;
  active: number;
  onOpen: () => void;
  label?: string;
}) {
  const { t } = useI18n();
  const shown = useAnimatedNumber(count ?? 0);
  return (
    <div
      role="region"
      aria-label={t.countMatch}
      className="flex flex-none items-center gap-3 border-t border-line bg-card px-4 pt-2 pb-[max(8px,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(0,0,0,0.08)] lg:hidden"
    >
      <div className={`flex min-w-[96px] flex-col justify-center rounded-lg px-3 py-1.5 ${COUNT_CARD}`}>
        <span aria-hidden className="tabular text-[20px] leading-none font-bold text-white">
          {count === undefined ? t.noCount : fmtNum(shown)}
        </span>
        <span aria-hidden className="mt-1 text-[11px] leading-none text-on-accent">
          {t.countMatch}
        </span>
        <span className="sr-only" aria-live="polite" aria-atomic="true">
          {count === undefined ? t.loading : fmtNum(count)} {t.countMatch}
        </span>
      </div>
      <button
        type="button"
        onClick={onOpen}
        className="ml-auto flex h-12 items-center gap-2 rounded-lg bg-sel px-5 text-[14px] font-bold text-on-sel"
      >
        {!label && (
          <svg
            viewBox="0 0 16 16"
            aria-hidden
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            <path d="M2 4h12M4.5 8h7M7 12h2" />
          </svg>
        )}
        {label ?? t.filtersButton(active)}
      </button>
    </div>
  );
}
