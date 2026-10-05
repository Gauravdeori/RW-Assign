import { Toggle } from '../../../components/Toggle';
import { useI18n } from '../../../i18n';
import type { SortKey } from '../../../types';

/** Best CVs / New CVs. */
export function SortGroup({ sort, onSort }: { sort: SortKey; onSort: (s: SortKey) => void }) {
  const { t } = useI18n();
  return (
    <div role="group" aria-label={t.sortBy} className="flex items-center gap-1.5">
      <span className="mr-1 hidden text-[12px] text-muted lg:inline">{t.sortBy}</span>
      <Toggle size="xs" on={sort === 'best'} onClick={() => onSort('best')}>
        {t.sortBest}
      </Toggle>
      <Toggle size="xs" on={sort === 'new'} onClick={() => onSort('new')}>
        {t.sortNew}
      </Toggle>
    </div>
  );
}
