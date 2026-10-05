import { readString, writeString } from './storage';

export type Theme = 'light' | 'dark';

const KEY = 'resumeFinder.theme';
const darkQuery = () => window.matchMedia('(prefers-color-scheme: dark)');

function readStored(): Theme | null {
  const v = readString(KEY);
  return v === 'light' || v === 'dark' ? v : null;
}

/**
 * Light / dark theme store, shared so the top-bar switch and the View menu always agree. Follows the device setting
 * until the recruiter picks one; the choice is then remembered and applied as data-theme on <html>
 * (index.html applies it before first paint).
 */
let chosen: Theme | null = readStored();
const listeners = new Set<() => void>();

export const themeStore = {
  subscribe(fn: () => void) {
    listeners.add(fn);
    const mq = darkQuery();
    mq.addEventListener('change', fn);
    return () => {
      listeners.delete(fn);
      mq.removeEventListener('change', fn);
    };
  },
  get: (): Theme => chosen ?? (darkQuery().matches ? 'dark' : 'light'),
  set(t: Theme) {
    chosen = t;
    document.documentElement.setAttribute('data-theme', t);
    writeString(KEY, t);
    listeners.forEach((fn) => fn());
  },
};
