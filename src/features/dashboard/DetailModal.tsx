import { useId } from 'react';
import { Modal } from '../../components/Modal';
import { useI18n } from '../../i18n';
import type { Conversion } from '../../types';
import { StudioChip } from '../studio/StudioChip';
import { StatusPill } from './StatusPill';
import { useStudioLabels } from './useStudioLabels';

/** Conversion details (Resume Studio opens its side-by-side editor here). */
export function DetailModal({ c, onClose }: { c: Conversion; onClose: () => void }) {
  const { s, tags } = useStudioLabels();
  const { t } = useI18n();
  const titleId = useId();
  return (
    <Modal labelledBy={titleId} onClose={onClose} className="max-w-[460px] rounded-[16px] p-6">
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 h-8 rounded-full border border-card-line px-3 text-[13px] hover:border-ink/50"
      >
        {t.close}
      </button>
      <p className="mono-caps text-[10.5px] text-muted">{s.detailTitle(c.id)}</p>
      <h2 id={titleId} className="mt-1 pr-16 text-[20px] leading-snug font-semibold break-all">
        {c.fileName}
      </h2>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {tags(c).map((x) => (
          <StudioChip key={x}>{x}</StudioChip>
        ))}
      </div>
      <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-5 gap-y-2 text-[13px]">
        <dt className="text-muted">{s.col.status}</dt>
        <dd>
          <StatusPill status={c.status} />
        </dd>
        <dt className="text-muted">{s.detailLanguage}</dt>
        <dd>
          {s.langShort[c.source]} → {s.langShort[c.target]} · {s.output(c.target)}
        </dd>
        <dt className="text-muted">{s.col.by}</dt>
        <dd>{s.you(c.uploadedBy)}</dd>
        <dt className="text-muted">{s.col.size}</dt>
        <dd>{s.size(c.sizeKb)}</dd>
        <dt className="text-muted">{s.col.created}</dt>
        <dd>{s.created(c.createdAt)}</dd>
      </dl>
      <p className="mt-5 rounded-[10px] bg-tile px-3.5 py-3 text-[12.5px] leading-relaxed text-muted">{s.detailNote}</p>
    </Modal>
  );
}
