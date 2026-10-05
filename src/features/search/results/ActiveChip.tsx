import { memo } from 'react';
import { useI18n } from '../../../i18n';
import { cx } from '../../../lib/cx';

/** One removable active-filter chip. Nice-to-have filters get a dashed outline. */
export const ActiveChip = memo(function ActiveChip({
  id,
  label,
  hidden,
  nice,
  onRemove,
}: {
  id: string;
  label: string;
  /** Measured but not shown (it is listed under "+N more"). */
  hidden?: boolean;
  nice?: boolean;
  onRemove: (id: string) => void;
}) {
  const { t } = useI18n();
  return (
    <span
      data-chip
      className={cx(
        'inline-flex h-7 max-w-full flex-none items-center gap-1 rounded-full border pr-1 pl-2.5 text-[12px] font-medium whitespace-nowrap',
        nice
          ? 'border-dashed border-accent/60 bg-card text-muted'
          : 'border-accent/30 bg-[color-mix(in_srgb,var(--accent)_8%,var(--card))]',
        hidden && 'invisible',
      )}
      title={nice ? t.niceTag : label}
    >
      <span className="min-w-0 truncate">{label}</span>
      {nice && <span className="sr-only"> ({t.niceTag})</span>}
      <button
        type="button"
        onClick={() => onRemove(id)}
        aria-label={t.removeChip(label)}
        tabIndex={hidden ? -1 : undefined}
        className="flex h-5 w-5 flex-none items-center justify-center rounded-full text-[14px] leading-none text-muted hover:bg-accent hover:text-white"
      >
        <span aria-hidden>×</span>
      </button>
    </span>
  );
});
