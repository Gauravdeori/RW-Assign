import { memo, type ReactNode } from 'react';
import { CheckTile } from '../../../../components/CheckTile';
import { FilterRow } from '../../../../components/FilterRow';
import { Toggle } from '../../../../components/Toggle';
import { toggleIn } from '../../../../lib/arrays';
import { cx } from '../../../../lib/cx';
import type { Filters, RowKey } from '../../../../types';
import { WRAP, reqFor, type Patch, type Req } from '../rowKit';

type ListField = 'seniority' | 'industries' | 'positions' | 'schoolRatings';
/** Single letters get square buttons. */
const SQUARE = ['A', 'B', 'C', 'D', 'S'];

/** Tick any number of choices (joined with OR). Memoised: a click re-renders this row only. */
export const MultiRow = memo(function MultiRow({
  label,
  field,
  row,
  value,
  options,
  labels,
  onChange,
  tiles,
  withCode,
  titles,
  after,
  optional,
  onRequired,
}: Req & {
  label: string;
  field: ListField;
  row: RowKey;
  value: readonly string[];
  options: readonly string[];
  labels: Record<string, string>;
  onChange: Patch;
  /** Checkbox tiles (industry, position) instead of toggle buttons. */
  tiles?: boolean;
  /** Show the code in bold before the label (seniority: "K Kachō"). */
  withCode?: boolean;
  /** Full wording shown as a tooltip when `labels` are short. */
  titles?: Record<string, string>;
  /** Shown after the buttons on the same line (the school rating glossary). */
  after?: ReactNode;
}) {
  const toggle = (o: string) => onChange({ [field]: toggleIn(value, o) } as Partial<Filters>);
  return (
    <FilterRow label={label} required={reqFor({ optional, onRequired }, row)}>
      <div className={cx(tiles ? 'flex flex-wrap gap-1.5' : WRAP, !!after && 'items-center')}>
        {options.map((o) =>
          tiles ? (
            <CheckTile key={o} on={value.includes(o)} onClick={() => toggle(o)} label={labels[o]} />
          ) : (
            <Toggle
              key={o}
              on={value.includes(o)}
              onClick={() => toggle(o)}
              title={titles?.[o]}
              size={!withCode && SQUARE.includes(o) ? 'square' : 'md'}
            >
              {withCode ? (
                <>
                  <span className="font-bold">{o}</span>
                  <span>{labels[o]}</span>
                </>
              ) : (
                labels[o]
              )}
            </Toggle>
          ),
        )}
        {after}
      </div>
    </FilterRow>
  );
});
