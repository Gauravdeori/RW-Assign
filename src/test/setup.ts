import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

const hasDom = typeof window !== 'undefined';

/**
 * jsdom has no layout engine: give the browser APIs the app relies on stand-ins. ResizeObserver reports a
 * desktop-sized box once, so the results page works out how many cards fit.
 */
class ResizeObserverStub {
  private readonly cb: ResizeObserverCallback;
  constructor(cb: ResizeObserverCallback) {
    this.cb = cb;
  }
  observe(target: Element) {
    queueMicrotask(() =>
      this.cb([{ target, contentRect: { width: 1200, height: 800 } } as unknown as ResizeObserverEntry], this as unknown as ResizeObserver),
    );
  }
  unobserve() {}
  disconnect() {}
}

if (hasDom) globalThis.ResizeObserver ??= ResizeObserverStub as unknown as typeof ResizeObserver;

if (hasDom && !window.matchMedia)
  window.matchMedia = (query: string) =>
    ({
      matches: query.includes('min-width: 1024px'),
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;

if (hasDom) window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
if (hasDom) Element.prototype.scrollIntoView ??= () => {};

afterEach(() => {
  if (!hasDom) return;
  cleanup();
  localStorage.clear();
  // Each test starts from a clean address (the search lives in the URL).
  window.history.replaceState(null, '', '/');
});
