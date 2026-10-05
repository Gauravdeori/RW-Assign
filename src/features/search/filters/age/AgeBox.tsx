import { useState } from 'react';
import { useI18n } from '../../../../i18n';
import { cx } from '../../../../lib/cx';

/**
 * Small number box for typing an exact age. Applies as soon as two valid digits are typed; shows the live value
 * otherwise. Two digits that are not accepted (outside 20-69, or below the other end) are marked invalid and not
 * applied; leaving the box puts the current age back.
 */
export function AgeBox({
  value,
  label,
  accept,
  onCommit,
}: {
  value: number;
  label: string;
  accept: (v: number) => boolean;
  onCommit: (v: number) => void;
}) {
  const { t } = useI18n();
  // While the box is being edited it shows what was typed; otherwise always the current value (slider, decades).
  const [editing, setEditing] = useState<string | null>(null);
  const invalid = editing !== null && editing.length === 2 && !accept(Number(editing));
  return (
    <input
      type="text"
      inputMode="numeric"
      maxLength={2}
      aria-label={label}
      aria-invalid={invalid || undefined}
      title={invalid ? t.ageInvalid : undefined}
      value={editing ?? String(value)}
      onFocus={() => setEditing(String(value))}
      onChange={(e) => {
        const s = e.target.value.replace(/\D/g, '');
        setEditing(s);
        if (s.length === 2 && accept(Number(s))) onCommit(Number(s));
      }}
      onBlur={() => setEditing(null)}
      onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
      className={cx(
        'tabular h-7 w-11 rounded border bg-field text-center text-[16px] text-ink outline-none hover:border-accent/50 focus:border-accent sm:text-[13.5px]',
        invalid ? 'border-accent text-pick-ink' : 'border-line',
      )}
    />
  );
}
