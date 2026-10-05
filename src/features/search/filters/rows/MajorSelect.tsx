import { OFF, PICKED } from '../../../../components/controlStyles';
import { useI18n } from '../../../../i18n';
import { cx } from '../../../../lib/cx';
import { MAJORS, type Degree, type Major } from '../../../../types';

const isMajor = (v: string): v is Major => (MAJORS as readonly string[]).includes(v);

/** Compact dropdown for the major of one ticked degree. Red when a major is picked. */
export function MajorSelect({
  degree,
  value,
  onPick,
}: {
  degree: Degree;
  value: Major | undefined;
  onPick: (m: Major | undefined) => void;
}) {
  const { t } = useI18n();
  return (
    <div className="relative min-w-0">
      <select
        aria-label={t.majorFor(degree)}
        value={value ?? ''}
        onChange={(e) => onPick(isMajor(e.target.value) ? e.target.value : undefined)}
        className={cx(
          'h-8 max-w-full min-w-[176px] appearance-none rounded border pr-8 pl-3 text-[13px] outline-none [&>option]:bg-field [&>option]:font-normal [&>option]:text-ink',
          value ? PICKED : OFF,
        )}
      >
        <option value="">{t.anyMajor}</option>
        {MAJORS.map((m) => (
          <option key={m} value={m}>
            {t.major[m]}
          </option>
        ))}
      </select>
      <svg
        viewBox="0 0 12 12"
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-2.5 h-3 w-3 -translate-y-1/2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      >
        <path d="M2.5 4.5 6 8l3.5-3.5" />
      </svg>
    </div>
  );
}
