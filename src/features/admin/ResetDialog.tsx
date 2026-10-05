import { useId } from 'react';
import { Modal } from '../../components/Modal';
import { useI18n } from '../../i18n';

/** "Reset demo data?" confirmation. */
export function ResetDialog({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  const { t } = useI18n();
  const a = t.admin;
  const titleId = useId();
  return (
    <Modal labelledBy={titleId} onClose={onCancel} className="mt-[12vh] max-w-[380px] rounded-[16px] p-6">
      <h2 id={titleId} className="text-[18px] font-semibold">
        {a.resetTitle}
      </h2>
      <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{a.resetBody}</p>
      <div className="mt-5 flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="h-10 rounded-full border border-card-line px-5 text-[14px] hover:border-ink/50">
          {t.cancel}
        </button>
        <button type="button" onClick={onConfirm} className="h-10 rounded-full bg-accent px-5 text-[14px] font-bold text-on-accent">
          {a.resetConfirm}
        </button>
      </div>
    </Modal>
  );
}
