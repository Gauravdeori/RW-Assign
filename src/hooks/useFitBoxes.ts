import { useLayoutEffect, useRef } from 'react';

/**
 * The four filter boxes are exactly the same size (a 2x2 grid with equal tracks), so their content must fit them.
 * When the screen is too short for the tallest box (short laptops, browser zoom, Comfortable density), every box's
 * content is scaled down by the same amount with CSS zoom, never below `min`, so text sizes stay equal across boxes.
 * Below `min` a box scrolls inside, as a last resort.
 *
 * A smaller zoom also gives the content more room across, so it wraps less: the largest zoom that fits is found by
 * measuring (a few halving steps), not predicted from the full-size height. Boxes are marked [data-fit-box]; their
 * first child is the content that is zoomed.
 */
export function useFitBoxes<T extends HTMLElement>(min: number) {
  const ref = useRef<T>(null);
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const boxes = [...root.querySelectorAll<HTMLElement>('[data-fit-box]')];
    const inners = boxes.map((b) => b.firstElementChild as HTMLElement);
    const overflows = (k: number) => inners[k].getBoundingClientRect().height > boxes[k].clientHeight + 0.5;
    const fitsAt = (z: number) => {
      for (const i of inners) i.style.zoom = z === 1 ? '' : String(z);
      return boxes.every((_, k) => !overflows(k));
    };
    const fit = () => {
      // Measure without scrollbars (they would narrow the content).
      for (const b of boxes) b.style.overflowY = 'hidden';
      let z = 1;
      if (!fitsAt(1)) {
        let lo = min;
        let hi = 1;
        if (fitsAt(lo)) {
          for (let step = 0; step < 7; step++) {
            const mid = (lo + hi) / 2;
            if (fitsAt(mid)) lo = mid;
            else hi = mid;
          }
        }
        z = Math.floor(lo * 1000) / 1000;
        fitsAt(z);
      }
      boxes.forEach((b, k) => (b.style.overflowY = overflows(k) ? 'auto' : 'hidden'));
    };
    fit();
    // Final sizes only change when the window or the content changes, so this does not loop.
    const ro = new ResizeObserver(fit);
    for (const el of [...boxes, ...inners]) ro.observe(el);
    return () => ro.disconnect();
  }, [min]);
  return ref;
}
