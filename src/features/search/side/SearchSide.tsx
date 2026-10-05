import { memo } from 'react';
import { PRESS } from '../../../components/controlStyles';
import { CONFIG } from '../../../config';
import { useAnimatedNumber } from '../../../hooks/useAnimatedNumber';
import { fmtNum, useI18n } from '../../../i18n';
import { savedSummary, suggestName } from '../../../lib/describe';
import { JdButton } from '../jd/JdButton';
import { useSavedSearches } from '../state/SavedSearchesContext';
import { useSearchActions } from '../state/SearchContext';
import { SearchList } from './SearchList';

/**
 * Left column of the full-screen search (220px, full height): the big live count, "Show candidates",
 * "Save search", "Clear all", "Start from a job description", then saved and recent searches.
 * Picking a saved or recent search loads it into the filters at once.
 */
export const SearchSide = memo(function SearchSide({
  count,
  ofLine,
  note,
  showJdFill,
  onSave,
  onShowAllSaved,
}: {
  count: number | undefined;
  ofLine: string;
  /** "Ranked by 2 nice-to-haves", when any filter is nice to have. */
  note?: string;
  showJdFill: boolean;
  onSave: () => void;
  onShowAllSaved: () => void;
}) {
  const { t } = useI18n();
  const actions = useSearchActions();
  const { saved, recent } = useSavedSearches();
  const shown = useAnimatedNumber(count ?? 0);

  return (
    // Same height as the 2x2 filter boxes beside it: the count card's top lines up with the upper boxes and the
    // saved-searches panel's bottom with the lower boxes. The panel takes all the room under the buttons.
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="flex flex-none flex-col gap-3">
        <h1 className="sr-only">{t.pageTitle}</h1>
        <div className="flex flex-col rounded-xl bg-[linear-gradient(135deg,var(--accent)_0%,var(--accent-deep)_100%)] px-5 py-4 shadow-accent">
          <div aria-hidden className="tabular text-[48px] leading-none font-bold tracking-[-0.03em] text-white">
            {count === undefined ? t.noCount : fmtNum(shown)}
          </div>
          <p className="mt-2 text-[14px] leading-tight font-bold text-on-accent" aria-live="polite" aria-atomic="true">
            <span className="sr-only">{count === undefined ? t.loading : fmtNum(count)} </span>
            {t.countMatch}
          </p>
          <p className="mt-0.5 text-[12px] leading-tight text-on-accent">{ofLine}</p>
          {note && <p className="mt-1 text-[11.5px] leading-tight font-semibold text-on-accent">★ {note}</p>}
        </div>

        <button
          type="button"
          onClick={actions.showResults}
          className={`h-11 rounded-lg bg-ink text-[14px] font-bold text-page shadow-control hover:bg-ink/90 ${PRESS}`}
        >
          {t.showCandidates}
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSave}
            className={`h-9 flex-1 rounded-lg border border-line bg-card text-[12.5px] font-medium hover:border-accent/50 ${PRESS}`}
          >
            {t.saveSearch}
          </button>
          <button
            type="button"
            onClick={actions.clear}
            className="h-9 px-1.5 text-[12.5px] whitespace-nowrap text-muted underline underline-offset-2 hover:text-accent"
          >
            {t.clearAll}
          </button>
        </div>
        {showJdFill && <JdButton onFill={actions.fill} />}
      </div>

      {/* Scrolls inside only if the lists are taller than the room left (short screens). */}
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain rounded-xl border border-line bg-card px-2 py-2.5 shadow-card">
        <SearchList
          title={t.savedSearches}
          empty={t.noSavedSearches}
          items={saved
            .slice(0, CONFIG.sideListMax)
            .map((s) => ({ id: s.id, name: s.name, summary: savedSummary(s, t), onPick: () => actions.load(s.steps, s.id) }))}
          more={saved.length > CONFIG.sideListMax ? { label: t.showAllSaved(saved.length), onClick: onShowAllSaved } : undefined}
        />
        <SearchList
          title={t.recentSearches}
          empty={t.noRecent}
          items={recent.slice(0, CONFIG.sideListMax).map((r) => ({
            id: r.key,
            name: suggestName(r.steps, t),
            summary: savedSummary(r, t),
            onPick: () => actions.load(r.steps),
          }))}
        />
      </div>
    </div>
  );
});
