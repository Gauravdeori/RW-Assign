import { useCallback, useEffect, useRef, useState } from 'react';
import { CONFIG } from '../config';

/** A short confirmation message that clears itself; returns the message and a function to show a new one. */
export function useToast(): [string | null, (message: string) => void] {
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const notify = useCallback((message: string) => {
    clearTimeout(timer.current);
    setToast(message);
    timer.current = setTimeout(() => setToast(null), CONFIG.toastMs);
  }, []);
  useEffect(() => () => clearTimeout(timer.current), []);
  return [toast, notify];
}
