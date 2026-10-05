import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { MenuBar } from '../../components/MenuBar';
import { Toast } from '../../components/Toast';
import { CONFIG } from '../../config';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useTheme } from '../../hooks/useTheme';
import { useToast } from '../../hooks/useToast';
import { fmtNum, useI18n } from '../../i18n';
import { api } from '../../lib/api';
import { countActiveFilters, suggestName } from '../../lib/describe';
import { applyGenderSetting, niceRowCount } from '../../lib/filters';
import { loadView, storeView } from '../../lib/viewPrefs';
import type { Candidate, Filters, SavedSearch, ViewPrefs } from '../../types';
import { useSettings } from '../settings/SettingsContext';
import { HelpDialog, type HelpTopic } from './dialogs/HelpDialog';
import { OpenSavedDialog } from './dialogs/OpenSavedDialog';
import { SaveSearchModal } from './dialogs/SaveSearchModal';
import { FilterPanel } from './filters/FilterPanel';
import { JdButton } from './jd/JdButton';
import { ResultsPane } from './results/ResultsPane';
import { SearchTrail } from './results/SearchTrail';
import { FilterSheet } from './side/FilterSheet';
import { MobileBar } from './side/MobileBar';
import { SearchSide } from './side/SearchSide';
import { useSavedSearches } from './state/SavedSearchesContext';
import { useSearch } from './state/SearchContext';
import { canSearchWithin, stepsToSave } from './state/searchReducer';
import { useSearchCounts } from './useSearchCounts';
import { useSearchMenus } from './useSearchMenus';
import { useSearchShortcuts } from './useSearchShortcuts';

// Loaded on demand: the CV drawer when a CV is first opened.
const CvDrawer = lazy(() => import('./cv/CvDrawer'));

/**
 * Resume Finder: one screen, no page scrolling. First the full-screen search (left column + four filter boxes);
 * after "Show candidates" the split view (filter side panel + results).
 */
export function SearchPage() {
  const { t } = useI18n();
  const { state, liveDraft, onResults, actions } = useSearch();
  const { saved, addSaved, updateSaved } = useSavedSearches();
  const { settings } = useSettings();
  const desktop = useMediaQuery(CONFIG.desktopQuery);
  const [theme, setTheme] = useTheme();
  const [toast, notify] = useToast();
  const [view, setViewState] = useState<ViewPrefs>(loadView);
  useEffect(() => storeView(view), [view]);

  const [cv, setCv] = useState<Candidate | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [saveDialog, setSaveDialog] = useState<null | { steps: Filters[]; suggested: string }>(null);
  const [openSavedDialog, setOpenSavedDialog] = useState(false);
  const [help, setHelp] = useState<HelpTopic | null>(null);

  // What is searched: with the gender filter switched off in Admin, gender choices are ignored everywhere.
  const steps = useMemo(() => state.steps.map((f) => applyGenderSetting(f, settings.showGender)), [state.steps, settings.showGender]);
  const filters = useMemo(() => applyGenderSetting(liveDraft, settings.showGender), [liveDraft, settings.showGender]);
  const query = useMemo(() => ({ steps, filters, sort: state.sort }), [steps, filters, state.sort]);
  const queryKey = useMemo(() => JSON.stringify([steps, filters, state.sort]), [steps, filters, state.sort]);
  const { count, stepCounts } = useSearchCounts(steps, filters);
  const niceTotal = niceRowCount([...steps, filters]);
  const note = niceTotal ? t.niceRanked(niceTotal) : undefined;
  const base = stepCounts?.[stepCounts.length - 1];
  const ofLine = steps.length ? t.ofInSearch(fmtNum(base ?? 0), steps.length) : t.ofDatabase(fmtNum(stepCounts?.[0] ?? 0));

  // ---------- saving and exporting ----------

  const saveAs = useCallback(() => {
    const list = stepsToSave(state);
    setSaveDialog({ steps: list, suggested: suggestName(list, t) });
  }, [state, t]);
  /** File > Save: updates the loaded saved search; otherwise asks for a name (Save as). */
  const save = useCallback(() => {
    const current = saved.find((s) => s.id === state.currentSavedId);
    if (!current) return saveAs();
    updateSaved(current.id, stepsToSave(state));
    notify(t.toastSaved(current.name));
  }, [saved, state, saveAs, updateSaved, notify, t]);
  const confirmSave = (name: string) => {
    if (!saveDialog) return;
    const entry = addSaved(name, saveDialog.steps);
    actions.setSavedId(entry.id);
    setSaveDialog(null);
    notify(t.toastSaved(entry.name));
  };
  const exportResults = useCallback(async () => {
    try {
      const [rows, { buildCsv, downloadCsv }] = await Promise.all([api.exportCandidates(query), import('../../lib/exportCsv')]);
      downloadCsv(buildCsv(rows, t), `${t.csvFilePrefix}-${new Date().toISOString().slice(0, 10)}.csv`);
      notify(t.toastExported(rows.length));
    } catch {
      notify(t.loadError);
    }
  }, [query, t, notify]);

  const openSaved = useCallback(() => setOpenSavedDialog(true), []);
  const pickSaved = (s: SavedSearch) => {
    setOpenSavedDialog(false);
    actions.load(s.steps, s.id);
  };
  const setView = useCallback((v: ViewPrefs) => setViewState(v), []);
  const showHelp = useCallback((topic: HelpTopic) => setHelp(topic), []);
  const closeCv = useCallback(() => setCv(null), []);

  useSearchShortcuts(true, actions.undo, save);
  const menus = useSearchMenus({
    t,
    actions,
    canUndo: state.history.length > 0,
    openSaved,
    save,
    saveAs,
    exportResults,
    theme,
    setTheme,
    view,
    setView,
    showHelp,
  });

  const zones = (
    <FilterPanel
      layout="zones"
      filters={state.draft}
      onChange={actions.patch}
      onRequired={actions.setRequired}
      onJdFill={actions.fill}
      showGender={settings.showGender}
      showJdFill={false}
    />
  );

  return (
    <div data-density={view.density} className="one-screen flex min-h-0 flex-1 flex-col overflow-hidden">
      <nav aria-label={t.menu.label}>
        <MenuBar menus={menus} label={t.menu.label} />
      </nav>

      {!onResults ? (
        desktop ? (
          // Left column and the 2x2 boxes share one height: the count card lines up with the upper boxes and the
          // saved-searches panel's bottom with the lower boxes; every gap is 12px.
          <main className="flex min-h-0 flex-1 gap-3 px-4 py-2">
            <aside aria-label={t.filtersLabel} className="w-[220px] flex-none">
              <SearchSide
                count={count}
                ofLine={ofLine}
                note={note}
                showJdFill={settings.showJdFill}
                onSave={saveAs}
                onShowAllSaved={openSaved}
              />
            </aside>
            {/* Fits at 1440x900 as is; on shorter screens the boxes' content scales down slightly instead of scrolling. */}
            <div className="min-h-0 min-w-0 flex-1">{zones}</div>
          </main>
        ) : (
          <>
            <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3">
              <h1 className="mb-3 text-[20px] font-bold">{t.pageTitle}</h1>
              {settings.showJdFill && (
                <div className="mb-3">
                  <JdButton onFill={actions.fill} />
                </div>
              )}
              {zones}
            </main>
            <MobileBar count={count} active={countActiveFilters(filters, t)} onOpen={actions.showResults} label={t.showCandidates} />
          </>
        )
      ) : (
        <>
          <main className="flex min-h-0 flex-1 gap-5 px-4 pt-3 pb-2 lg:px-5 lg:pt-3 lg:pb-3">
            {desktop ? (
              <aside
                aria-label={t.filtersLabel}
                className="w-[420px] flex-none overflow-hidden rounded-xl border border-line bg-card shadow-card 2xl:w-[460px]"
              >
                <h1 className="sr-only">{t.pageTitle}</h1>
                <FilterPanel
                  heading={false}
                  filters={state.draft}
                  onChange={actions.patch}
                  onRequired={actions.setRequired}
                  onJdFill={actions.fill}
                  showGender={settings.showGender}
                  showJdFill={settings.showJdFill}
                  onAllFilters={state.steps.length ? undefined : actions.showAllFilters}
                />
              </aside>
            ) : (
              <h1 className="sr-only">{t.pageTitle}</h1>
            )}
            <div className="min-w-0 flex-1">
              <ResultsPane
                query={query}
                queryKey={queryKey}
                count={count}
                ofLine={ofLine}
                note={note}
                trail={<SearchTrail stepCounts={stepCounts} count={count} />}
                chips={filters}
                canSearchWithin={canSearchWithin(state)}
                onSave={saveAs}
                onOpenCv={setCv}
                view={desktop ? view.results : 'list'}
                density={view.density}
              />
            </div>
          </main>
          {!desktop && <MobileBar count={count} active={countActiveFilters(filters, t)} onOpen={() => setSheetOpen(true)} />}
          {!desktop && sheetOpen && (
            <FilterSheet
              count={count}
              onClose={() => setSheetOpen(false)}
              onClear={actions.clear}
              action={settings.showJdFill ? <JdButton onFill={actions.fill} /> : null}
            >
              <FilterPanel
                filters={state.draft}
                onChange={actions.patch}
                onRequired={actions.setRequired}
                onJdFill={actions.fill}
                showGender={settings.showGender}
                showJdFill={false}
                heading={false}
                fitMin={0.9}
              />
            </FilterSheet>
          )}
        </>
      )}

      {cv && (
        <Suspense fallback={null}>
          <CvDrawer summary={cv} onClose={closeCv} />
        </Suspense>
      )}
      {saveDialog && <SaveSearchModal suggested={saveDialog.suggested} onCancel={() => setSaveDialog(null)} onSave={confirmSave} />}
      {openSavedDialog && <OpenSavedDialog saved={saved} onPick={pickSaved} onClose={() => setOpenSavedDialog(false)} />}
      {help && <HelpDialog topic={help} onClose={() => setHelp(null)} />}
      <Toast message={toast} />
    </div>
  );
}
