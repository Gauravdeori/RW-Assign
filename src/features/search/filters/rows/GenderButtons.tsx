import { Toggle } from '../../../../components/Toggle';
import { useI18n } from '../../../../i18n';
import { toggleIn } from '../../../../lib/arrays';
import { FILTER_GENDERS, type FilterGender } from '../../../../types';
import type { Patch } from '../rowKit';

/** Male / Female toggles (shared by the English gender row and the Japanese name row). */
export function GenderButtons({ value, onChange }: { value: FilterGender[]; onChange: Patch }) {
  const { t } = useI18n();
  return (
    <>
      {FILTER_GENDERS.map((g) => (
        <Toggle key={g} on={value.includes(g)} onClick={() => onChange({ genders: toggleIn(value, g) })}>
          {t.gender[g]}
        </Toggle>
      ))}
    </>
  );
}
