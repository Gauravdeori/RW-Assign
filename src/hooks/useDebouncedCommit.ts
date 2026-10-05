import { useCallback, useEffect, useRef } from 'react';
import { CONFIG } from '../config';

/**
 * Apply a typed value after a short pause (CONFIG.textDebounceMs), so a number typed digit by digit is applied once:
 * typing 1200 never applies 120 on the way. `flush` applies at once (leaving the box, Enter); `cancel` drops it.
 */
export function useDebouncedCommit<T>(commit: (v: T) => void) {
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pending = useRef<{ value: T } | null>(null);
  const commitRef = useRef(commit);
  useEffect(() => {
    commitRef.current = commit;
  });
  const flush = useCallback(() => {
    clearTimeout(timer.current);
    const p = pending.current;
    pending.current = null;
    if (p) commitRef.current(p.value);
  }, []);
  const schedule = useCallback(
    (value: T) => {
      clearTimeout(timer.current);
      pending.current = { value };
      timer.current = setTimeout(flush, CONFIG.textDebounceMs);
    },
    [flush],
  );
  const cancel = useCallback(() => {
    clearTimeout(timer.current);
    pending.current = null;
  }, []);
  useEffect(() => () => clearTimeout(timer.current), []);
  return { schedule, flush, cancel };
}
