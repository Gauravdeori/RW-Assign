import { memo, useMemo } from 'react';
import { FilterRow } from '../../../../components/FilterRow';
import { useI18n } from '../../../../i18n';
import type { AgeFields } from '../../../../types';
import { AgeFilter } from '../age/AgeFilter';
import { reqFor, type Patch, type Req } from '../rowKit';

export const AgeRow = memo(function AgeRow({
  ageMode,
  decades,
  ageMin,
  ageMax,
  onChange,
  optional,
  onRequired,
}: AgeFields & Req & { onChange: Patch }) {
  const { t } = useI18n();
  const age = useMemo(() => ({ ageMode, decades, ageMin, ageMax }), [ageMode, decades, ageMin, ageMax]);
  return (
    <FilterRow label={t.rowAge} required={reqFor({ optional, onRequired }, 'age')}>
      <AgeFilter filters={age} onChange={onChange} />
    </FilterRow>
  );
});
