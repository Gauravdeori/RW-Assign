import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useI18n } from '../../i18n';
import { findRecruiters, openCount } from '../../lib/assignment';
import { cx } from '../../lib/cx';
import type { Assignment, Recruiter } from '../../types';
import { Avatar } from './Avatar';
import { Popover } from './Popover';
import { FIELD } from './styles';

/**
 * One-step assign: a small box right under the Assign button with the email field already focused. Typing filters
 * recruiters by name, email or team; arrow keys move, Enter or a click assigns, Esc or a click outside closes.
 */
export function AssignPopover({
  anchor,
  candidate,
  recruiters,
  rows,
  onAssign,
  onClose,
}: {
  anchor: HTMLElement;
  candidate: string;
  recruiters: readonly Recruiter[];
  /** Every row, for each recruiter's "4 open". */
  rows: readonly Assignment[];
  onAssign: (r: Recruiter) => void;
  onClose: (refocus: boolean) => void;
}) {
  const { t } = useI18n();
  const list = useRef<HTMLDivElement>(null);
  const inputId = useId();
  const listId = useId();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const matches = useMemo(() => findRecruiters(recruiters, query, (team) => t.assign.team[team]), [recruiters, query, t]);
  const current = matches[Math.min(active, matches.length - 1)];

  useEffect(() => {
    list.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [current]);

  const optionId = (r: Recruiter) => `${listId}-${r.id}`;

  return (
    <Popover anchor={anchor} width={400} labelledBy={`${inputId}-label`} onClose={onClose}>
      <label id={`${inputId}-label`} htmlFor={inputId} className="block text-[13px] font-bold">
        {t.assign.assignTo(candidate)}
      </label>
      <input
        id={inputId}
        // The whole point of the box is to type straight away.
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus
        type="text"
        role="combobox"
        aria-expanded={matches.length > 0}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={current ? optionId(current) : undefined}
        autoComplete="off"
        spellCheck={false}
        placeholder={t.assign.recruiterPlaceholder}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            if (!matches.length) return;
            const step = e.key === 'ArrowDown' ? 1 : -1;
            setActive((i) => (Math.min(i, matches.length - 1) + step + matches.length) % matches.length);
          } else if (e.key === 'Enter') {
            e.preventDefault();
            if (current) onAssign(current);
          }
        }}
        className={cx(FIELD, 'mt-2')}
      />
      <div ref={list} id={listId} role="listbox" aria-label={t.assign.recruiterLabel} className="mt-2 max-h-[264px] overflow-y-auto">
        {matches.length === 0 ? (
          <p className="px-2 py-3 text-[13px] text-muted">{t.assign.noRecruiter}</p>
        ) : (
          matches.map((r) => {
            const on = r === current;
            return (
              <button
                key={r.id}
                id={optionId(r)}
                type="button"
                role="option"
                tabIndex={-1}
                aria-selected={on}
                // Keep focus in the field, so typing can go on after a mouse-over.
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setActive(matches.indexOf(r))}
                onClick={() => onAssign(r)}
                className={cx(
                  'flex w-full items-center gap-2.5 rounded-md border px-2.5 py-2 text-left',
                  on ? 'border-pick-line bg-pick' : 'border-transparent',
                )}
              >
                <Avatar recruiter={r} />
                <span className="min-w-0">
                  <span className={cx('block truncate text-[15px] font-semibold', on && 'text-pick-ink')}>
                    {t.assign.name(r.firstName, r.lastName)}
                  </span>
                  <span className="block text-[13px] leading-snug text-muted">
                    {t.assign.recruiterMeta(r.email, t.assign.team[r.team], openCount(r, rows))}
                  </span>
                </span>
              </button>
            );
          })
        )}
      </div>
      <p className="mt-2 border-t border-panel-line pt-2 text-[13px] leading-snug text-muted">{t.assign.assignHint}</p>
    </Popover>
  );
}
