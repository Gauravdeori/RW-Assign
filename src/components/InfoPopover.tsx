import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

/**
 * (i) button that opens a small glossary. The panel is a native popover in the page's top layer (Esc and a click
 * outside close it), placed under the button and rendered at body level so the zoomed, clipped filter boxes do not
 * shrink or cut it.
 */
export function InfoPopover({ label, children }: { label: string; children: ReactNode }) {
  const id = useId().replace(/[^a-zA-Z0-9-]/g, '');
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const p = panel.current;
    if (!p) return;
    const place = (e: Event) => {
      if ((e as ToggleEvent).newState !== 'open' || !button.current) return;
      const r = button.current.getBoundingClientRect();
      const w = Math.min(340, window.innerWidth - 16);
      p.style.width = `${w}px`;
      p.style.left = `${Math.max(8, Math.min(r.left - 12, window.innerWidth - w - 8))}px`;
      p.style.top = `${r.bottom + 6}px`;
    };
    // Flip above the button when there is no room below.
    const flip = (e: Event) => {
      if ((e as ToggleEvent).newState !== 'open' || !button.current) return;
      const r = button.current.getBoundingClientRect();
      if (r.bottom + 6 + p.offsetHeight > window.innerHeight - 8) p.style.top = `${Math.max(8, r.top - 6 - p.offsetHeight)}px`;
    };
    p.addEventListener('beforetoggle', place);
    p.addEventListener('toggle', flip);
    return () => {
      p.removeEventListener('beforetoggle', place);
      p.removeEventListener('toggle', flip);
    };
  }, []);
  return (
    <>
      <button
        ref={button}
        type="button"
        popoverTarget={id}
        aria-label={label}
        title={label}
        className="flex h-6 w-6 flex-none items-center justify-center rounded-full border border-line bg-field text-muted hover:border-accent hover:text-accent"
      >
        <svg viewBox="0 0 16 16" aria-hidden className="h-3.5 w-3.5" fill="currentColor">
          <circle cx="8" cy="4.2" r="1.15" />
          <rect x="7" y="6.6" width="2" height="6.4" rx="1" />
        </svg>
      </button>
      {createPortal(
        <div
          ref={panel}
          id={id}
          popover="auto"
          role="dialog"
          aria-label={label}
          className="fixed inset-auto m-0 rounded-lg border border-line bg-card p-3.5 text-ink shadow-hover"
        >
          {children}
        </div>,
        document.body,
      )}
    </>
  );
}
