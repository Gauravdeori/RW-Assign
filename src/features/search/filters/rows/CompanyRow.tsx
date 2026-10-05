import { memo } from 'react';
import { FilterRow } from '../../../../components/FilterRow';
import { TextField } from '../../../../components/TextField';
import { CONFIG } from '../../../../config';
import { useI18n } from '../../../../i18n';
import { reqFor, type Patch, type Req } from '../rowKit';

/** Current company and up to three previous companies (more would not fit the screen). */
export const CompanyRow = memo(function CompanyRow({
  current,
  previous,
  onChange,
  optional,
  onRequired,
}: Req & { current: string; previous: string[]; onChange: Patch }) {
  const { t } = useI18n();
  const setPrevious = (i: number, v: string) => onChange({ previousCompanies: previous.map((p, j) => (j === i ? v : p)) });
  const removePrevious = (i: number) => onChange({ previousCompanies: previous.filter((_, j) => j !== i) });
  return (
    <FilterRow label={t.rowCompany} required={reqFor({ optional, onRequired }, 'company')}>
      <div className="flex flex-col gap-1.5">
        <div className="grid grid-cols-2 gap-2">
          <TextField label={t.currentCompany} value={current} onChange={(v) => onChange({ currentCompany: v })} />
          <TextField label={t.previousCompany} value={previous[0] ?? ''} onChange={(v) => setPrevious(0, v)} />
        </div>
        {previous.slice(1).map((p, k) => {
          const i = k + 1;
          return (
            <TextField
              key={i}
              label={`${t.previousCompany} ${i + 1}`}
              value={p}
              onChange={(v) => setPrevious(i, v)}
              hideLabel
              trailing={
                <button
                  type="button"
                  onClick={() => removePrevious(i)}
                  aria-label={t.removePrevious}
                  className="h-[var(--ctl-h)] w-9 flex-none rounded-r border border-l-0 border-line text-[16px] text-muted hover:text-accent"
                >
                  <span aria-hidden>×</span>
                </button>
              }
            />
          );
        })}
        {previous.length < CONFIG.maxPreviousCompanies && (
          <button
            type="button"
            onClick={() => onChange({ previousCompanies: [...previous, ''] })}
            className="self-start text-left text-[12px] text-muted underline underline-offset-2 hover:text-accent"
          >
            + {t.addPrevious}
          </button>
        )}
      </div>
    </FilterRow>
  );
});
