import { memo } from 'react';
import { FilterRow } from '../../../../components/FilterRow';
import { Toggle } from '../../../../components/Toggle';
import type { Filters, RowKey } from '../../../../types';
import { WRAP, reqFor, type Patch, type Req } from '../rowKit';

/** Pick one choice; clicking the selected one again goes back to "Any". */
export const ChoiceRow = memo(function ChoiceRow({
  label,
  field,
  row,
  value,
  options,
  labels,
  onChange,
  optional,
  onRequired,
}: Req & {
  label: string;
  field: 'foreign' | 'overseas';
  row: RowKey;
  value: string;
  options: readonly string[];
  labels: Record<string, string>;
  onChange: Patch;
}) {
  return (
    <FilterRow label={label} required={reqFor({ optional, onRequired }, row)}>
      <div className={WRAP}>
        {options.map((o) => (
          <Toggle key={o} on={value === o} onClick={() => onChange({ [field]: value === o ? 'any' : o } as Partial<Filters>)}>
            {labels[o]}
          </Toggle>
        ))}
      </div>
    </FilterRow>
  );
});
