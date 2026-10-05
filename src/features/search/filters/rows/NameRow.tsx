import { memo, useId } from 'react';
import { FilterRow } from '../../../../components/FilterRow';
import { RequiredBox } from '../../../../components/RequiredBox';
import { TextField } from '../../../../components/TextField';
import { useI18n } from '../../../../i18n';
import { cx } from '../../../../lib/cx';
import type { FilterGender } from '../../../../types';
import { reqFor, type Patch, type Req } from '../rowKit';
import { GenderButtons } from './GenderButtons';

/**
 * Name. Japanese names are rarely over three characters, so in Japanese the two boxes are half width and the
 * gender buttons share the row; English keeps two wide boxes (gender gets its own row).
 */
export const NameRow = memo(function NameRow({
  last,
  first,
  genders,
  showGender,
  onChange,
  optional,
  onRequired,
}: Req & {
  last: string;
  first: string;
  genders: FilterGender[];
  showGender: boolean;
  onChange: Patch;
}) {
  const { t, lang } = useI18n();
  const genderId = useId();
  if (lang === 'ja')
    return (
      <FilterRow label={t.rowName} required={reqFor({ optional, onRequired }, 'name')}>
        <div className="flex flex-wrap items-end gap-x-2 gap-y-1.5">
          <TextField label={t.lastName} value={last} onChange={(v) => onChange({ lastName: v })} className="w-[84px]" />
          <TextField label={t.firstName} value={first} onChange={(v) => onChange({ firstName: v })} className="w-[84px]" />
          {showGender && (
            <div role="group" aria-labelledby={genderId} className="ml-auto flex items-center gap-2">
              <RequiredBox on={!optional.includes('gender')} name={t.rowGender} onChange={(on) => onRequired('gender', on)} />
              <span id={genderId} className={cx('text-[12.5px] font-semibold', optional.includes('gender') && 'text-muted')}>
                {t.rowGender}
              </span>
              <GenderButtons value={genders} onChange={onChange} />
            </div>
          )}
        </div>
      </FilterRow>
    );
  return (
    <FilterRow label={t.rowName} required={reqFor({ optional, onRequired }, 'name')}>
      <div className="grid grid-cols-2 gap-2">
        <TextField label={t.lastName} value={last} onChange={(v) => onChange({ lastName: v })} />
        <TextField label={t.firstName} value={first} onChange={(v) => onChange({ firstName: v })} />
      </div>
    </FilterRow>
  );
});
