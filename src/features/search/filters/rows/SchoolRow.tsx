import { memo } from 'react';
import { FilterRow } from '../../../../components/FilterRow';
import { TextField } from '../../../../components/TextField';
import { useI18n } from '../../../../i18n';
import { reqFor, type Patch, type Req } from '../rowKit';

/** School name: part of the name of any of the candidate's schools. */
export const SchoolRow = memo(function SchoolRow({ value, onChange, optional, onRequired }: Req & { value: string; onChange: Patch }) {
  const { t } = useI18n();
  return (
    <FilterRow label={t.schoolName} required={reqFor({ optional, onRequired }, 'school')}>
      <TextField label={t.schoolName} value={value} onChange={(v) => onChange({ schoolName: v })} hideLabel />
    </FilterRow>
  );
});
