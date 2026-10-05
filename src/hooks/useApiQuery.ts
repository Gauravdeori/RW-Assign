import { useCallback, useEffect, useRef, useState } from 'react';

export interface ApiQuery<T> {
  /** The latest answer; while a new question is loading, the previous answer (so numbers do not flash). */
  data: T | undefined;
  /** True while the answer for the current key is on its way. */
  loading: boolean;
  /** The error for the current key, if it failed. */
  error: Error | null;
  retry: () => void;
}

interface Answer<T> {
  key: string;
  data: T | undefined;
  error: Error | null;
}

/**
 * Ask the API something identified by `key`, and ask again whenever the key changes. Answers to out-of-date keys
 * are ignored (a fast click after a slow request never shows the older result). `key: null` asks nothing.
 */
export function useApiQuery<T>(key: string | null, fetcher: () => Promise<T>): ApiQuery<T> {
  const [answer, setAnswer] = useState<Answer<T>>({ key: '', data: undefined, error: null });
  const [attempt, setAttempt] = useState(0);
  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  useEffect(() => {
    if (key === null) return;
    let live = true;
    fetcherRef
      .current()
      .then((data) => live && setAnswer({ key, data, error: null }))
      .catch((e: unknown) => live && setAnswer((prev) => ({ key, data: prev.data, error: e instanceof Error ? e : new Error(String(e)) })));
    return () => {
      live = false;
    };
  }, [key, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  const current = answer.key === key;
  return { data: answer.data, loading: key !== null && !current, error: current ? answer.error : null, retry };
}
