import { cx } from '../../lib/cx';

/** Pill-shaped two-option switch. The selected option gets a red outline. */
export function PillSegmented<T extends string>({
  label,
  options,
  value,
  onChange,
  size = 'md',
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  size?: 'sm' | 'md';
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-full border border-card-line bg-tile p-1">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            className={cx(
              'rounded-full border font-semibold whitespace-nowrap transition-colors',
              size === 'sm' ? 'h-8 px-3 text-[12.5px]' : 'h-9 px-4 text-[14px]',
              on
                ? 'border-accent bg-[color-mix(in_srgb,var(--accent)_10%,var(--card))] text-pick-ink'
                : 'border-transparent text-ink/75 hover:text-ink',
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
