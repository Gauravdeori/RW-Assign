import { memo } from 'react';
import { Chip } from '../../../../components/Chip';
import { FilterRow } from '../../../../components/FilterRow';
import { CONFIG } from '../../../../config';
import { useI18n } from '../../../../i18n';
import { toggleIn } from '../../../../lib/arrays';
import { cx } from '../../../../lib/cx';
import { QUALIFICATIONS, type Qualification } from '../../../../types';
import { reqFor, type Patch, type Req } from '../rowKit';

/** Other qualifications: tick any (joined with OR), or type one that is not listed. */
export const QualRow = memo(function QualRow({
  value,
  text,
  onChange,
  optional,
  onRequired,
}: Req & { value: Qualification[]; text: string; onChange: Patch }) {
  const { t } = useI18n();
  return (
    <FilterRow label={t.qualLabel} required={reqFor({ optional, onRequired }, 'qualification')}>
      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
        {QUALIFICATIONS.map((q) => (
          <Chip
            key={q}
            on={value.includes(q)}
            title={t.qualificationFull[q]}
            onClick={() => onChange({ qualifications: toggleIn(value, q) })}
          >
            {t.qualification[q]}
          </Chip>
        ))}
        <input
          type="text"
          autoComplete="off"
          maxLength={CONFIG.textInputMaxLength}
          value={text}
          aria-label={t.qualOther}
          placeholder={t.qualOtherPlaceholder}
          onChange={(e) => onChange({ qualText: e.target.value })}
          className={cx(
            'h-7 min-w-[96px] flex-1 rounded-full border px-3 text-[16px] outline-none placeholder:text-muted sm:text-[12.5px]',
            'hover:border-accent/50 focus:border-accent',
            text.trim() ? 'border-pick-line bg-pick text-pick-ink' : 'border-line bg-field text-ink',
          )}
        />
      </div>
    </FilterRow>
  );
});
