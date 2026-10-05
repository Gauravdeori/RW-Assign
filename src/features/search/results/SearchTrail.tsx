import { memo } from 'react';
import { useI18n } from '../../../i18n';
import { useSearch } from '../state/SearchContext';
import { Trail, type TrailItem } from './Trail';

/**
 * All candidates › Search 1 › Search 2 (current), with counts. Earlier steps are clickable. The trail keeps to one
 * line: with many steps, the middle ones fold into "…".
 */
export const SearchTrail = memo(function SearchTrail({
  stepCounts,
  count,
}: {
  stepCounts: number[] | undefined;
  count: number | undefined;
}) {
  const { t } = useI18n();
  const { state, actions } = useSearch();
  const steps = state.steps;
  const items: TrailItem[] = [{ label: t.allCandidates, count: stepCounts?.[0], current: false, onClick: () => actions.jumpTo(-1) }];
  steps.forEach((_, i) => {
    if (steps.length > 3 && i < steps.length - 2) {
      if (i === 0) items.push({ label: '…', current: false });
      return;
    }
    items.push({ label: t.searchN(i + 1), count: stepCounts?.[i + 1], current: false, onClick: () => actions.jumpTo(i) });
  });
  items.push({ label: t.searchN(steps.length + 1), count, current: true });
  return <Trail items={items} />;
});
