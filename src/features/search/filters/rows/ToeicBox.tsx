import { useState } from 'react';
import { useDebouncedCommit } from '../../../../hooks/useDebouncedCommit';
import { useI18n } from '../../../../i18n';
import { cx } from '../../../../lib/cx';
import { TOEIC_MAX, TOEIC_MIN } from '../../../../lib/languageTests';

/**
 * Typed TOEIC text as: a score to apply, null (empty: clear), 'pending' (not a score yet, but more digits could make
 * it one: "8" may become 820), or 'invalid' (no more digits can fix it: 1200, 995, 005).
 */
export function parseToeic(s: string): number | null | 'pending' | 'invalid' {
  if (s === '') return null;
  if (!/^\d+$/.test(s)) return 'invalid';
  const n = Number(s);
  if (n > TOEIC_MAX || (s.length >= 3 && n < TOEIC_MIN)) return 'invalid';
  return n < TOEIC_MIN ? 'pending' : n;
}

/**
 * TOEIC box: a valid score (10 to 990) applies after a short typing pause (or at once on Enter / leaving the box),
 * so typing 1200 never applies 120 on the way. A number no more digits can fix is marked invalid and not applied;
 * `onInvalid` lets the row say why. Leaving the box shows the current score again.
 */
export function ToeicBox({
  value,
  onScore,
  onInvalid,
  describedBy,
}: {
  value: number | null;
  onScore: (v: number | null) => void;
  onInvalid: (invalid: boolean) => void;
  describedBy: string;
}) {
  const { t } = useI18n();
  // While the box is being edited it shows what was typed; otherwise the current score.
  const [editing, setEditing] = useState<string | null>(null);
  const { schedule, flush, cancel } = useDebouncedCommit(onScore);
  const shown = value === null ? '' : String(value);
  const invalid = editing !== null && parseToeic(editing) === 'invalid';
  return (
    <input
      type="text"
      inputMode="numeric"
      maxLength={4}
      aria-label={t.toeicLabel}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      placeholder={t.toeicPlaceholder}
      value={editing ?? shown}
      onFocus={() => setEditing(shown)}
      onChange={(e) => {
        const s = e.target.value.replace(/\D/g, '').slice(0, 4);
        setEditing(s);
        const v = parseToeic(s);
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
        'tabular h-[var(--ctl-h)] w-[76px] rounded border px-2 text-center text-[16px] outline-none placeholder:font-normal placeholder:text-muted sm:text-[13.5px]',
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
