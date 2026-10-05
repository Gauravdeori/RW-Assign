import { memo } from 'react';
import { FilterRow } from '../../../../components/FilterRow';
import { useI18n } from '../../../../i18n';
import type { FilterGender } from '../../../../types';
import { WRAP, reqFor, type Patch, type Req } from '../rowKit';
import { GenderButtons } from './GenderButtons';

/** Gender (English only; in Japanese it shares the name row). */
export const GenderRow = memo(function GenderRow({
  value,
  onChange,
  optional,
  onRequired,
}: Req & { value: FilterGender[]; onChange: Patch }) {
  const { t, lang } = useI18n();
  if (lang === 'ja') return null;
  return (
    <FilterRow label={t.rowGender} required={reqFor({ optional, onRequired }, 'gender')}>
      <div className={WRAP}>
        <GenderButtons value={value} onChange={onChange} />
      </div>
    </FilterRow>
  );
});
