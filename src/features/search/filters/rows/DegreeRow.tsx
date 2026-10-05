import { memo } from 'react';
import { FilterRow } from '../../../../components/FilterRow';
import { Toggle } from '../../../../components/Toggle';
import { useI18n } from '../../../../i18n';
import { DEGREES, DEGREES_WITH_MAJOR, type Degree, type Filters } from '../../../../types';
import { reqFor, type Patch, type Req } from '../rowKit';
import { MajorSelect } from './MajorSelect';

/**
 * One line per degree. Ticking a degree turns it red and shows a Major dropdown on the same line, for that degree
 * only (MBA has none). A candidate matches a ticked degree when they hold it, with the picked major for that degree.
 */
export const DegreeRow = memo(function DegreeRow({
  degrees,
  majorFor,
  onChange,
  optional,
  onRequired,
}: Req & { degrees: Degree[]; majorFor: Filters['majorFor']; onChange: Patch }) {
  const { t } = useI18n();
  const toggle = (d: Degree) => {
    if (!degrees.includes(d)) return onChange({ degrees: [...degrees, d] });
    const rest = { ...majorFor };
    delete rest[d];
    onChange({ degrees: degrees.filter((x) => x !== d), majorFor: rest });
  };
  return (
    <FilterRow label={t.degreeLabel} required={reqFor({ optional, onRequired }, 'degree')} firstLine={32}>
      <div className="flex flex-col gap-[3px]">
        {DEGREES.map((d) => {
          const on = degrees.includes(d);
          return (
            <div key={d} className="flex items-center gap-2">
              <Toggle on={on} onClick={() => toggle(d)} size="sm" className="w-24 flex-none">
                {t.degree[d]}
              </Toggle>
              {on && DEGREES_WITH_MAJOR.includes(d) && (
                <MajorSelect degree={d} value={majorFor[d]} onPick={(m) => onChange({ majorFor: { ...majorFor, [d]: m } })} />
              )}
            </div>
          );
        })}
      </div>
    </FilterRow>
  );
});
