import { useId, type CSSProperties, type ReactNode } from 'react';
import { useI18n } from '../i18n';
import { cx } from '../lib/cx';
import { RequiredBox } from './RequiredBox';

/**
 * A filter row (Ted's grid): a fixed label column (--label-w: 92px, 112px in Japanese; wider by --indent for the
 * Gaishi score, so its indented sub-filters keep the same control line), a 12px gap,
 * then the controls, so all row labels share one left edge and all controls start on one vertical line.
 * With `required`, the label starts with the small Required box; unticked rows say "nice to have".
 * On phones (under 640px) the label sits above its controls, so the controls get the full width.
 */
export function FilterRow({
  label,
  sub,
  required,
  firstLine,
  children,
}: {
  label: string;
  sub?: string;
  required?: { on: boolean; onChange: (on: boolean) => void };
  /** Height of the first line of controls when it is not --ctl-h (40 for the Gaishi letters, 32 for degrees): the label centres on it. */
  firstLine?: number;
  children: ReactNode;
}) {
  const { t } = useI18n();
  const id = useId();
  return (
    <div
      role="group"
      aria-labelledby={id}
      data-optional={required && !required.on ? '' : undefined}
      className="grid grid-cols-1 gap-x-3 gap-y-1.5 py-[var(--row-py)] sm:grid-cols-[var(--label-w)_minmax(0,1fr)]"
    >
      <div
        className="flex items-start gap-1.5 sm:pt-[calc((var(--first-line,var(--ctl-h))-15px)/2)]"
        style={firstLine ? ({ '--first-line': `${firstLine}px` } as CSSProperties) : undefined}
      >
        {required && (
          <span className="pt-px">
            <RequiredBox on={required.on} name={label} onChange={required.onChange} />
          </span>
        )}
        <div className="min-w-0">
          <h3 id={id} className={cx('text-[12.5px] leading-[15px] font-semibold', required && !required.on && 'text-muted')}>
            {label}
          </h3>
          {required && !required.on && <p className="text-[10.5px] leading-[13px] font-medium text-accent">{t.niceTag}</p>}
          {sub && <p className="mt-1 text-[11.5px] leading-snug text-muted">{sub}</p>}
        </div>
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
