import { useEffect } from 'react';

/** Ctrl+Z: undo the last filter (not while typing in a box, which has its own undo). Ctrl+S: save. */
export function useSearchShortcuts(active: boolean, undo: () => void, save: () => void) {
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
      const k = e.key.toLowerCase();
      const typing = e.target instanceof Element && e.target.closest('input, textarea, select');
      if (k === 'z' && !e.shiftKey && !typing) {
        e.preventDefault();
        undo();
      } else if (k === 's') {
        e.preventDefault();
        save();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [active, undo, save]);
}
