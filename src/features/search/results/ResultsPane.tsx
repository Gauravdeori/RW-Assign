import { memo, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { CONFIG } from '../../../config';
import { useApiQuery } from '../../../hooks/useApiQuery';
import { useI18n } from '../../../i18n';
import { api } from '../../../lib/api';
import type { Candidate, Density, Filters, ResultsView, SearchQuery } from '../../../types';
import { useSearchActions } from '../state/SearchContext';
import { ActiveChips } from './ActiveChips';
import { CandidateCard } from './CandidateCard';
import { CARD_H } from './cardSizes';
import { CountCard } from './CountCard';
import { SortGroup } from './SortGroup';

const LIFT = 'transition-transform duration-150 hover:-translate-y-px active:translate-y-0';
const SECONDARY = `h-9 rounded-lg border border-line bg-card px-3 text-[12.5px] font-medium whitespace-nowrap hover:border-ink/45 hover:shadow-control disabled:cursor-not-allowed disabled:opacity-45 ${LIFT}`;

interface Props {
  /** What is shown: the steps, the current filters (gender setting applied) and the sort. */
  query: SearchQuery;
  /** Identifies the query: a new one goes back to page 1. */
  queryKey: string;
  /** How many candidates match (from the count request), shown while the page loads. */
  count: number | undefined;
  ofLine: string;
  /** "Ranked by 2 nice-to-haves", when any filter is nice to have. */
  note?: string;
  trail: ReactNode;
  /** The current step's filters, shown as removable chips. */
  chips: Filters;
  canSearchWithin: boolean;
  onSave: () => void;
  onOpenCv: (c: Candidate) => void;
  /** View menu: a 3-column grid of compact cards (default) or a 1-column list. */
  view: ResultsView;
  density: Density;
}

/**
 * The results side of the one-page layout. Nothing scrolls: as many cards as fit the space are shown, and
 * Previous / Next move through the rest a page at a time. Only that page is requested from the API and rendered.
 */
export const ResultsPane = memo(function ResultsPane({
  query,
  queryKey,
  count,
  ofLine,
  note,
  trail,
  chips,
  canSearchWithin,
  onSave,
  onOpenCv,
  view,
  density,
}: Props) {
  const { t } = useI18n();
  const actions = useSearchActions();
  const listRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });

  // How much room the cards have: measured before the first paint, then whenever the window resizes.
  useLayoutEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setBox({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const gap = CONFIG.resultsGap;
  const variant = view === 'grid' ? 'tile' : 'row';
  const cols = view === 'grid' ? Math.max(1, Math.min(3, Math.floor((box.w + gap) / (CONFIG.minTileWidth + gap)))) : 1;
  const rows = Math.max(1, Math.floor((box.h + gap) / (CARD_H[variant][density] + gap)));
  const pageSize = rows * cols;

  // A new result set starts at page 1. Resizing keeps the first card on screen in view.
  const [pos, setPos] = useState({ key: queryKey, first: 0 });
  const total = count ?? 0;
  const first = pos.key === queryKey ? Math.min(pos.first, Math.max(0, total - 1)) : 0;
  const start = Math.floor(first / pageSize) * pageSize;
  const go = (to: number) => setPos({ key: queryKey, first: to });

  const page = useApiQuery(box.h > 0 ? `${queryKey}|${start}|${pageSize}` : null, () =>
    api.searchCandidates(query, { offset: start, limit: pageSize }),
  );
  const items = page.data && page.data.offset === start ? page.data.items : [];
  const shownTotal = page.data && !page.loading ? page.data.total : total;
  const end = Math.min(shownTotal, start + pageSize);
  const pages = Math.max(1, Math.ceil(shownTotal / pageSize));
  const pageNo = Math.floor(start / pageSize) + 1;
  const sortGroup = <SortGroup sort={query.sort} onSort={actions.setSort} />;

  return (
    <div className="flex h-full min-h-0 flex-col gap-3" aria-label={t.resultsLabel} role="region">
      <div className="flex flex-none gap-4">
        <CountCard count={count} ofLine={ofLine} note={note} />
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <div className="min-w-0 flex-1 basis-[260px] overflow-hidden">{trail}</div>
            {/* Phones: sort and the actions share one line, with shorter labels. */}
            <div className="flex w-full items-center justify-between gap-2 lg:ml-auto lg:w-auto">
              <div className="lg:hidden">{sortGroup}</div>
              <div className="flex flex-none items-center gap-2">
                <button
                  type="button"
                  onClick={actions.searchWithin}
                  disabled={!canSearchWithin}
                  className={`h-9 rounded-lg bg-[linear-gradient(135deg,var(--accent),var(--accent-deep))] px-3.5 text-[12.5px] font-bold whitespace-nowrap text-on-accent shadow-accent disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none ${LIFT}`}
                >
                  <span className="sm:hidden">{t.searchWithinShort}</span>
                  <span className="hidden sm:inline">{t.searchWithin}</span>
                </button>
                <button type="button" onClick={onSave} className={SECONDARY}>
                  <span className="sm:hidden">{t.save}</span>
                  <span className="hidden sm:inline">{t.saveSearch}</span>
                </button>
                <button
                  type="button"
                  onClick={actions.clear}
                  className="hidden h-9 px-1 text-[12.5px] whitespace-nowrap text-muted underline underline-offset-2 hover:text-ink lg:block"
                >
                  {t.clearAll}
                </button>
              </div>
            </div>
          </div>
          <ActiveChips filters={chips} onRemove={actions.removeChip} />
        </div>
      </div>

      <div
        ref={listRef}
        role="list"
        aria-label={t.resultsTitle(shownTotal)}
        aria-busy={page.loading || undefined}
        className="grid min-h-0 flex-1 content-start overflow-hidden"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap }}
      >
        {page.error ? (
          <div role="alert" className="col-span-full rounded-xl border border-line bg-card px-6 py-8 text-[14px] shadow-card">
            <p>{t.loadError}</p>
            <button type="button" onClick={page.retry} className={`mt-3 ${SECONDARY}`}>
              {t.retry}
            </button>
          </div>
        ) : count === 0 ? (
          <p role="status" className="col-span-full rounded-xl border border-line bg-card px-6 py-10 text-[14px] shadow-card">
            {t.zero}
          </p>
        ) : (
          items.map(({ candidate, niceMatched }) => (
            <div key={candidate.id} role="listitem">
              <CandidateCard
                c={candidate}
                variant={variant}
                density={density}
                prefN={niceMatched}
                prefTotal={page.data?.niceTotal ?? 0}
                onOpenCv={onOpenCv}
              />
            </div>
          ))
        )}
      </div>

      <nav aria-label={t.pagesLabel} className="flex h-9 flex-none items-center justify-between gap-3">
        <div className="hidden lg:block">{sortGroup}</div>
        <p className="hidden min-w-0 flex-1 truncate text-center text-[11px] text-muted xl:block">{t.footer}</p>
        <div className="flex flex-1 items-center justify-end gap-2 lg:flex-none">
          <button type="button" onClick={() => go(start - pageSize)} disabled={start === 0} className={SECONDARY}>
            <span aria-hidden>‹ </span>
            {t.prevPage}
          </button>
          <p className="tabular min-w-[112px] text-center text-[12.5px]" title={t.pageN(pageNo, pages)}>
            {shownTotal ? t.pageRange(start + 1, end, shownTotal) : 0}
          </p>
          <button type="button" onClick={() => go(start + pageSize)} disabled={end >= shownTotal} className={SECONDARY}>
            {t.nextPage}
            <span aria-hidden> ›</span>
          </button>
        </div>
      </nav>
    </div>
  );
});
