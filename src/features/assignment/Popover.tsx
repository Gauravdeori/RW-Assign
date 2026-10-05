import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cx } from '../../lib/cx';

const GAP = 6;

type Place = { left: number; top?: number; bottom?: number };

function placeNear(anchor: HTMLElement, width: number, room: number): Place {
  const r = anchor.getBoundingClientRect();
  const left = Math.max(8, Math.min(r.left, window.innerWidth - width - 8));
  const below = window.innerHeight - r.bottom;
  return below >= room || below >= r.top ? { left, top: r.bottom + GAP } : { left, bottom: window.innerHeight - r.top + GAP };
}

/**
 * A small box right under a button (above it when there is no room), drawn over the page so a scroll box never cuts
 * it off. Follows the button on scroll and resize. Esc closes and gives focus back to the button; a click elsewhere
 * or tabbing out closes it. A click on the button itself is left to the button (which toggles).
 */
export function Popover({
  anchor,
  width,
  room = 360,
  labelledBy,
  onClose,
  className,
  children,
}: {
  anchor: HTMLElement;
  width: number;
  /** Height the box needs below the button before it opens above instead. */
  room?: number;
  labelledBy: string;
  /** `refocus`: put focus back on the button (Esc). */
  onClose: (refocus: boolean) => void;
  className?: string;
  children: ReactNode;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [place, setPlace] = useState<Place>(() => placeNear(anchor, width, room));
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });

  useLayoutEffect(() => {
    const follow = () => setPlace(placeNear(anchor, width, room));
    window.addEventListener('scroll', follow, true);
    window.addEventListener('resize', follow);
    return () => {
      window.removeEventListener('scroll', follow, true);
      window.removeEventListener('resize', follow);
    };
  }, [anchor, width, room]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (box.current?.contains(target) || anchor.contains(target)) return;
      closeRef.current(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || !box.current?.contains(document.activeElement)) return;
      e.preventDefault();
      e.stopPropagation();
      closeRef.current(true);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [anchor]);

  return createPortal(
    <div
      ref={box}
      role="dialog"
      aria-labelledby={labelledBy}
      style={{ left: place.left, top: place.top, bottom: place.bottom, width }}
      className={cx(
        'anim-fade-up fixed z-40 max-w-[calc(100vw-16px)] rounded-[10px] border border-panel-line bg-card p-3 text-ink shadow-[0_16px_40px_rgba(0,0,0,0.16)]',
        className,
      )}
      onBlur={(e) => {
        if (e.relatedTarget !== null && !box.current?.contains(e.relatedTarget as Node)) closeRef.current(false);
      }}
    >
      {children}
    </div>,
    document.body,
  );
}
