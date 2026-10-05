import { useCallback, useEffect, useState } from 'react';
import { hrefFor, parseRoute, type Route } from '../lib/route';

/** The current page (from the URL hash) and a function to go to another one. */
export function useHashRoute(): [Route, (r: Route) => void] {
  const [route, setRoute] = useState<Route>(() => parseRoute(window.location.hash));

  useEffect(() => {
    const onHash = () => {
      setRoute(parseRoute(window.location.hash));
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const go = useCallback((r: Route) => {
    if (parseRoute(window.location.hash) === r) return;
    window.location.hash = hrefFor(r);
  }, []);
  return [route, go];
}
