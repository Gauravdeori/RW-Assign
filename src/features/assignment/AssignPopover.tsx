import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useI18n } from '../../i18n';
import { findRecruiters, openCount } from '../../lib/assignment';
import { cx } from '../../lib/cx';
import type { Assignment, Recruiter } from '../../types';
import { Avatar } from './Avatar';
import { FIELD } from './styles';

const WIDTH = 400;
/** Room the box needs below the button; with less, it opens above instead. */
const ROOM = 360;
const GAP = 6;

type Place = { left: number; top?: number; bottom?: number };

function placeUnder(anchor: HTMLElement): Place {
  const r = anchor.getBoundingClientRect();
  const left = Math.max(8, Math.min(r.left, window.innerWidth - WIDTH - 8));
  const below = window.innerHeight - r.bottom;
  return below >= ROOM || below >= r.top ? { left, top: r.bottom + GAP } : { left, bottom: window.innerHeight - r.top + GAP };
}

/**
 * One-step assign: a small box right under the Assign button with the email field already focused. Typing filters
 * recruiters by name, email or team; arrow keys move, Enter or a click assigns, Esc or a click outside closes.
 * Drawn over the page (portal), so the table's scroll box never cuts it off.
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
  const box = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const inputId = useId();
  const listId = useId();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [place, setPlace] = useState<Place>(() => placeUnder(anchor));
  const matches = useMemo(() => findRecruiters(recruiters, query, (team) => t.assign.team[team]), [recruiters, query, t]);
  const current = matches[Math.min(active, matches.length - 1)];

  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });

  // Follow the button when the page or the table scrolls, or the window resizes.
  useLayoutEffect(() => {
    const follow = () => setPlace(placeUnder(anchor));
    window.addEventListener('scroll', follow, true);
    window.addEventListener('resize', follow);
    return () => {
      window.removeEventListener('scroll', follow, true);
      window.removeEventListener('resize', follow);
    };
  }, [anchor]);

  // A click anywhere else closes (a click on the Assign button itself is left to the button, which toggles).
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (box.current?.contains(target) || anchor.contains(target)) return;
      closeRef.current(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [anchor]);

  useEffect(() => {
    list.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [current]);

  const optionId = (r: Recruiter) => `${listId}-${r.id}`;

  return createPortal(
    <div
      ref={box}
      role="dialog"
      aria-labelledby={`${inputId}-label`}
      style={{ left: place.left, top: place.top, bottom: place.bottom, width: WIDTH }}
      className="anim-fade-up fixed z-40 max-w-[calc(100vw-16px)] rounded-[10px] border border-panel-line bg-card p-3 text-ink shadow-[0_16px_40px_rgba(0,0,0,0.16)]"
      onBlur={(e) => {
        if (!box.current?.contains(e.relatedTarget as Node | null) && e.relatedTarget !== null) closeRef.current(false);
      }}
    >
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
          } else if (e.key === 'Escape') {
            e.preventDefault();
            e.stopPropagation();
            onClose(true);
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
    </div>,
    document.body,
  );
}
