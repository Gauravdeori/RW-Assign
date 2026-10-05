import type { Filters, RowKey } from '../../../types';

/** Shared bits for the filter rows. */

export type Patch = (p: Partial<Filters>) => void;

/** Rows get the list of nice-to-have rows (stable unless it changes) and one callback for their Required box. */
export type Req = { optional: RowKey[]; onRequired: (row: RowKey, required: boolean) => void };

/** Props for a row's Required box. */
export const reqFor = ({ optional, onRequired }: Req, row: RowKey) => ({
  on: !optional.includes(row),
  onChange: (on: boolean) => onRequired(row, on),
});

/** Buttons that wrap onto more lines when needed. */
export const WRAP = 'flex flex-wrap gap-x-2 gap-y-1.5';
/** Small grey helper line under a control ("or higher", "TOEIC 820 = Fluent"). */
export const CAPTION = 'mt-0.5 text-[11px] leading-[13px] whitespace-nowrap text-muted';
