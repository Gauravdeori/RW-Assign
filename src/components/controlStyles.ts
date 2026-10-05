/**
 * Shared look for selectable controls (Resume Studio design language). Height follows the density setting
 * (36px compact, 40px comfortable). A tap gives a quick 120ms press; only transform is animated.
 * Unselected: white with a grey border, coral border at 50% on hover.
 * Selected ("picked"): light red tint, coral border, red text, semibold. Never a black fill.
 */
export const PRESS = 'transition-transform duration-[120ms] ease-out active:scale-[0.96]';
export const OFF = 'border-line bg-field text-ink hover:border-accent/50';
export const PICKED = 'border-pick-line bg-pick text-pick-ink font-semibold';
export const CONTROL = `rounded border ${PRESS}`;
