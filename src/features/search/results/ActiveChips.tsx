import { memo, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { CONFIG } from '../../../config';
import { useI18n } from '../../../i18n';
import { activeChips } from '../../../lib/describe';
import type { Filters } from '../../../types';
import { ActiveChip } from './ActiveChip';

/**
 * Removable chips for everything ticked in the current step, on one line. Chips that do not fit are listed
 * under a "+N more" button instead of wrapping onto more lines.
 */
export const ActiveChips = memo(function ActiveChips({ filters, onRemove }: { filters: Filters; onRemove: (id: string) => void }) {
  const { t } = useI18n();
  const chips = useMemo(() => activeChips(filters, t), [filters, t]);
  const rowRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState({ n: chips.length, left: 0 });
  const [width, setWidth] = useState(0);
  const [open, setOpen] = useState(false);
  const menuId = useId();

  // Every chip stays rendered (the ones that do not fit are invisible), so they can always be measured.
  useLayoutEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    const items = [...row.querySelectorAll<HTMLElement>('[data-chip]')];
    const right = (i: number) => items[i].offsetLeft + items[i].offsetWidth;
    let n = items.length;
    if (n && right(n - 1) > row.clientWidth) {
      n = 0;
      while (n < items.length && right(n) <= row.clientWidth - CONFIG.chipMoreWidth) n++;
    }
    const next = { n, left: n ? right(n - 1) + 6 : 0 };
    setFit((f) => (f.n === next.n && f.left === next.left ? f : next));
  }, [chips, width]);
  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.round(e.contentRect.width)));
    ro.observe(row);
    return () => ro.disconnect();
  }, []);
  const hidden = chips.slice(fit.n);
  const menuOpen = open && hidden.length > 0;

  return (
    <div className="relative">
      <div ref={rowRef} role="group" aria-label={t.activeFilters} className="relative flex h-7 items-center gap-1.5 overflow-hidden">
        {chips.length === 0 ? (
          <p className="truncate text-[12.5px] text-muted">{t.noActive}</p>
        ) : (
          chips.map((c, i) => (
            <ActiveChip
              key={c.id}
              id={c.id}
              label={c.label}
              nice={filters.optional.includes(c.row)}
              hidden={i >= fit.n}
              onRemove={onRemove}
            />
          ))
        )}
      </div>
      {hidden.length > 0 && (
        <button
          type="button"
          aria-expanded={menuOpen}
          aria-controls={menuId}
          onClick={() => setOpen((o) => !o)}
          className="absolute top-0 h-7 rounded-full border border-line bg-card px-2.5 text-[12px] font-semibold whitespace-nowrap hover:border-ink/45"
          style={{ left: fit.left }}
        >
          {t.moreChips(hidden.length)}
        </button>
      )}
      {menuOpen && (
        <div
          id={menuId}
          className="anim-fade-in absolute top-9 z-20 flex max-w-[min(420px,calc(100vw-32px))] flex-wrap gap-1.5 rounded-xl border border-line bg-card p-2.5 shadow-hover"
          style={{ left: Math.max(0, fit.left - 200) }}
        >
          {hidden.map((c) => (
            <ActiveChip key={c.id} id={c.id} label={c.label} nice={filters.optional.includes(c.row)} onRemove={onRemove} />
          ))}
        </div>
      )}
    </div>
  );
});
