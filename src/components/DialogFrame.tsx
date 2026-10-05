import { useId, type ReactNode } from 'react';
import { useI18n } from '../i18n';
import { Modal } from './Modal';

/** A titled dialog with a close (×) button in the corner. */
export function DialogFrame({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const { t } = useI18n();
  const titleId = useId();
  return (
    <Modal labelledBy={titleId} onClose={onClose} className="max-w-[480px] rounded-xl p-5">
      <h2 id={titleId} className="pr-12 text-[16px] font-bold">
        {title}
      </h2>
      <button
        type="button"
        onClick={onClose}
        aria-label={t.close}
        className="absolute top-3.5 right-3.5 flex h-9 w-9 items-center justify-center rounded-lg border border-line text-[20px] leading-none hover:border-accent/50"
      >
        <span aria-hidden>×</span>
      </button>
      <div className="mt-3">{children}</div>
    </Modal>
  );
}
