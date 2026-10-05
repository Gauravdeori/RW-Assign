/**
 * Pages reachable from the top bar. Hash routes work on any static host (Vercel, Netlify) without rewrites.
 * 'search' is the candidate search, shown in the menu as "Resume Finder".
 */
export const ROUTES = ['search', 'upload', 'dashboard', 'assignment', 'analytics', 'admin'] as const;
export type Route = (typeof ROUTES)[number];

export function parseRoute(hash: string): Route {
  const r = hash.replace(/^#\/?/, '');
  return (ROUTES as readonly string[]).includes(r) ? (r as Route) : 'search';
}

export const hrefFor = (r: Route) => `#/${r}`;
