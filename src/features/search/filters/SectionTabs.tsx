import { useRef, type KeyboardEvent } from 'react';
import { CountBadge } from '../../../components/CountBadge';
import { useI18n } from '../../../i18n';
import { cx } from '../../../lib/cx';
import { SECTIONS, type SectionKey } from './sections';

/** Tab strip: Candidate | Role | Gaishi fit | Education, each with a badge counting its active filters. Arrow keys move. */
export function SectionTabs({
  current,
  counts,
  onSelect,
  idFor,
}: {
  current: SectionKey;
  counts: Record<SectionKey, number>;
  onSelect: (k: SectionKey) => void;
  idFor: (k: SectionKey, part: 'tab' | 'panel') => string;
}) {
  const { t } = useI18n();
  const refs = useRef<Partial<Record<SectionKey, HTMLButtonElement | null>>>({});
  const onKey = (e: KeyboardEvent) => {
    const i = SECTIONS.indexOf(current);
    const to =
      e.key === 'ArrowRight'
        ? SECTIONS[(i + 1) % SECTIONS.length]
        : e.key === 'ArrowLeft'
          ? SECTIONS[(i + SECTIONS.length - 1) % SECTIONS.length]
          : e.key === 'Home'
            ? SECTIONS[0]
            : e.key === 'End'
              ? SECTIONS[SECTIONS.length - 1]
              : null;
    if (!to) return;
    e.preventDefault();
    onSelect(to);
    refs.current[to]?.focus();
  };
  return (
    <div role="tablist" aria-label={t.filtersLabel} className="flex flex-none border-b border-line px-2">
      {SECTIONS.map((k) => {
        const on = k === current;
        return (
          <button
            key={k}
            ref={(el) => {
              refs.current[k] = el;
            }}
            type="button"
            role="tab"
            id={idFor(k, 'tab')}
            aria-selected={on}
            aria-controls={idFor(k, 'panel')}
            tabIndex={on ? 0 : -1}
            onClick={() => onSelect(k)}
            onKeyDown={onKey}
            className={cx(
              'relative flex h-11 min-w-0 flex-1 items-center justify-center gap-1.5 px-1 text-[12.5px] whitespace-nowrap',
              on
                ? 'font-semibold text-pick-ink after:absolute after:inset-x-2 after:-bottom-px after:h-[2px] after:bg-accent'
                : 'text-muted hover:text-ink',
            )}
          >
            {t.sections[k]}
            <CountBadge n={counts[k]} />
          </button>
        );
      })}
    </div>
  );
}
