import { useId } from 'react';
import { useI18n } from '../../i18n';
import type { AssignmentView } from '../../types';
import { CAPTION, PANEL, choice } from './styles';

const VIEWS: AssignmentView[] = ['individual', 'team', 'global'];

/** The three dashboards: My assignments (Individual), Finance hiring team (Team), All Robert Walters (Global). */
export function ViewSwitch({ value, onChange }: { value: AssignmentView; onChange: (v: AssignmentView) => void }) {
  const { t } = useI18n();
  const id = useId();
  return (
    <section aria-labelledby={id} className={`${PANEL} p-[18px]`}>
      <h2 id={id} className={CAPTION}>
        {t.assign.viewHeading}
      </h2>
      <div role="group" aria-labelledby={id} className="mt-2.5 flex flex-col gap-2">
        {VIEWS.map((v) => {
          const on = v === value;
          return (
            <button
              key={v}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(v)}
              className={`${choice(on)} h-[38px] w-full justify-between px-3 text-[15px]`}
            >
              <span className="truncate">{t.assign.viewTitle[v]}</span>
              <span className={on ? 'text-[13px] font-semibold' : 'text-[13px] font-normal text-muted'}>{t.assign.viewTag[v]}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
