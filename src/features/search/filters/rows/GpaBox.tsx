import { useState } from 'react';
import { useDebouncedCommit } from '../../../../hooks/useDebouncedCommit';
import { useI18n } from '../../../../i18n';
import { cx } from '../../../../lib/cx';
import { GPA_MAX } from '../../../../types';

/**
 * Typed GPA text as a minimum (rounded to 0.1): a number, null for empty or 0 (any), 'pending' for a lone "." that
 * more digits will complete, or 'invalid' (not a number, or above 4.0: no more digits can fix it).
 */
export function parseGpa(s: string): number | null | 'pending' | 'invalid' {
  if (s === '') return null;
  if (s === '.') return 'pending';
  if (!/^\d*\.?\d*$/.test(s)) return 'invalid';
  const v = Number(s);
  if (Number.isNaN(v) || v > GPA_MAX) return 'invalid';
  return v === 0 ? null : Math.round(v * 10) / 10;
}

/**
 * Small box for typing a minimum GPA (0.1 to 4.0). A valid number applies after a short typing pause (or at once on
 * Enter / leaving the box); a number above 4.0 is marked invalid and not applied (`onInvalid` lets the row say why).
 * Leaving the box shows the current value again.
 */
export function GpaBox({
  value,
  onCommit,
  onInvalid,
  describedBy,
}: {
  value: number | null;
  onCommit: (v: number | null) => void;
  onInvalid: (invalid: boolean) => void;
  describedBy: string;
}) {
  const { t } = useI18n();
  const [editing, setEditing] = useState<string | null>(null);
  const { schedule, flush, cancel } = useDebouncedCommit(onCommit);
  const shown = value === null ? '' : value.toFixed(1);
  const invalid = editing !== null && parseGpa(editing) === 'invalid';
  return (
    <input
      type="text"
      inputMode="decimal"
      maxLength={4}
      aria-label={t.gpaBox}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      placeholder="0.0"
      value={editing ?? shown}
      onFocus={() => setEditing(shown)}
      onChange={(e) => {
        const s = e.target.value.replace(/[^\d.]/g, '').slice(0, 4);
        setEditing(s);
        const v = parseGpa(s);
        onInvalid(v === 'invalid');
        if (v === 'invalid' || v === 'pending') cancel();
        else schedule(v);
      }}
      onBlur={() => {
        flush();
        setEditing(null);
        onInvalid(false);
      }}
      onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
      className={cx(
        'tabular h-[var(--ctl-h)] w-12 flex-none rounded border text-center text-[16px] outline-none placeholder:font-normal placeholder:text-muted sm:text-[13.5px]',
        'hover:border-accent/50 focus:border-accent',
        invalid
          ? 'border-accent bg-field text-pick-ink'
          : value === null
            ? 'border-line bg-field text-ink'
            : 'border-pick-line bg-pick font-semibold text-pick-ink',
      )}
    />
  );
}
