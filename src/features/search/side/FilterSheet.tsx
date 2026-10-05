import { useId, type ReactNode } from 'react';
import { Modal } from '../../../components/Modal';
import { useI18n } from '../../../i18n';

/** Phones and tablets: the filter panel in a bottom sheet, with the live count on its "Show" button. */
export function FilterSheet({
  count,
  onClose,
  onClear,
  action,
  children,
}: {
  count: number | undefined;
  onClose: () => void;
  onClear: () => void;
  /** Extra button in the sheet header ("Start from a job description"). */
  action?: ReactNode;
  children: ReactNode;
}) {
  const { t } = useI18n();
  const titleId = useId();
  return (
    <Modal labelledBy={titleId} onClose={onClose} placement="bottom" className="h-[96dvh] rounded-t-2xl border-b-0">
      <div className="flex flex-none items-center justify-between border-b border-line px-4 py-3">
        <h2 id={titleId} className="text-[16px] font-bold">
          {t.filtersTitle}
        </h2>
        <div className="mr-2 ml-auto">{action}</div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t.close}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-[22px] leading-none"
        >
          <span aria-hidden>×</span>
        </button>
      </div>
      <div className="min-h-0 flex-1">{children}</div>
      <div className="flex flex-none items-center gap-2 border-t border-line px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))]">
        <button type="button" onClick={onClear} className="h-12 px-2 text-[13px] text-muted underline underline-offset-2">
          {t.clearAll}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="h-12 flex-1 rounded-lg bg-[linear-gradient(135deg,var(--accent),var(--accent-deep))] text-[14px] font-bold text-on-accent"
        >
          {t.showN(count ?? 0)}
        </button>
      </div>
    </Modal>
  );
}
