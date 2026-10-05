import { memo, useId, useState } from 'react';
import { FitToScreen } from '../../../components/FitToScreen';
import { CONFIG } from '../../../config';
import { useI18n } from '../../../i18n';
import type { Filters } from '../../../types';
import { JdButton } from '../jd/JdButton';
import { GroupRows } from './GroupRows';
import type { Patch, Req } from './rowKit';
import { SectionTabs } from './SectionTabs';
import { SECTIONS, activeIn, type SectionKey } from './sections';
import { Zone } from './Zone';
import { Zones } from './Zones';

/**
 * Every filter, in one of two layouts:
 * - "zones": the full-screen search. Four boxes of exactly the same size in a 2x2 grid (Candidate, Role /
 *   Gaishi fit, Education), all visible at once and filling the height beside the saved-searches column.
 * - "tabs": the split view's side panel. One group at a time under a tab strip.
 * Memoised, so it does not re-render when only the results, sort, page or CV drawer change.
 */
export const FilterPanel = memo(function FilterPanel({
  filters: f,
  onChange,
  onRequired,
  onJdFill,
  showGender = true,
  showJdFill = true,
  heading = true,
  layout = 'tabs',
  onAllFilters,
  fitMin = CONFIG.fitMinScale,
}: {
  filters: Filters;
  onChange: Patch;
  /** A Required box was ticked (true) or unticked (false: nice to have). */
  onRequired: Req['onRequired'];
  onJdFill: Patch;
  /** Admin settings: the gender filter can be switched off per country; the JD box can be hidden. */
  showGender?: boolean;
  showJdFill?: boolean;
  /** Show the page title (tabs layout; off in the phone sheet, which has its own). */
  heading?: boolean;
  layout?: 'tabs' | 'zones';
  /** Tabs layout: go back to the full-screen search. */
  onAllFilters?: () => void;
  /** Tabs layout: the smallest scale used to fit a short screen (phones keep text larger and scroll instead). */
  fitMin?: number;
}) {
  const { t } = useI18n();
  const [tab, setTab] = useState<SectionKey>('candidate');
  const baseId = useId();
  const idFor = (k: SectionKey, part: 'tab' | 'panel') => `${baseId}-${part}-${k}`;
  const counts = Object.fromEntries(SECTIONS.map((k) => [k, activeIn(k, f, showGender)])) as Record<SectionKey, number>;

  if (layout === 'zones')
    return (
      <Zones label={t.filtersLabel}>
        {SECTIONS.map((k) => (
          <Zone key={k} title={t.sections[k]} count={counts[k]}>
            <GroupRows group={k} f={f} onChange={onChange} showGender={showGender} onRequired={onRequired} />
          </Zone>
        ))}
      </Zones>
    );

  return (
    <div className="flex h-full min-h-0 flex-col">
      {(heading || showJdFill || onAllFilters) && (
        <div className="flex flex-none items-center gap-2 px-4 pt-3 pb-2">
          {heading && <h1 className="mr-auto text-[18px] leading-tight font-bold tracking-[-0.02em]">{t.pageTitle}</h1>}
          {onAllFilters && (
            <button
              type="button"
              onClick={onAllFilters}
              title={t.allFiltersHint}
              className={`inline-flex h-8 flex-none items-center gap-1.5 rounded-lg border border-line bg-field px-2.5 text-[12px] font-medium hover:border-accent/50 ${heading ? '' : 'mr-auto'}`}
            >
              <svg
                viewBox="0 0 16 16"
                aria-hidden
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              >
                <rect x="2" y="2" width="5" height="5" rx="1" />
                <rect x="9" y="2" width="5" height="5" rx="1" />
                <rect x="2" y="9" width="5" height="5" rx="1" />
                <rect x="9" y="9" width="5" height="5" rx="1" />
              </svg>
              {t.allFilters}
            </button>
          )}
          {showJdFill && <JdButton onFill={onJdFill} />}
        </div>
      )}
      <SectionTabs current={tab} counts={counts} onSelect={setTab} idFor={idFor} />
      <h2 className="sr-only">{t.sections[tab]}</h2>
      {/* Each group is sized to fit; on short screens it scales down slightly instead of scrolling. */}
      <div role="tabpanel" id={idFor(tab, 'panel')} aria-labelledby={idFor(tab, 'tab')} className="flex min-h-0 flex-1 flex-col">
        <FitToScreen className="flex-1 px-4" min={fitMin}>
          <div className="divide-y divide-line">
            <GroupRows group={tab} f={f} onChange={onChange} showGender={showGender} onRequired={onRequired} />
          </div>
        </FitToScreen>
      </div>
    </div>
  );
});
