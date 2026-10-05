import { useRef, type KeyboardEvent, type PointerEvent } from 'react';
import { useI18n } from '../../../../i18n';
import { cx } from '../../../../lib/cx';
import { AGE_MAX, AGE_MIN } from '../../../../types';

/** 20 to 69 is 50 years, so each decade is exactly one fifth of the track: the same grid as the five buttons. */
const SPAN = AGE_MAX - AGE_MIN + 1;
/** Position (%) of the start of a year on the track. The upper handle sits at the end of its year. */
const at = (yearStart: number) => ((yearStart - AGE_MIN) / SPAN) * 100;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const KEY_STEP: Partial<Record<string, number>> = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1, PageDown: -10, PageUp: 10 };

/**
 * Dual-handle slider drawn to line up exactly with the decade buttons above it: 30 to 49 runs from the left edge
 * of "30s" to the right edge of "40s". Drag either handle or the track; arrow keys move 1 year, Page Up/Down 10.
 */
export function RangeSlider({
  lo,
  hi,
  active,
  onChange,
}: {
  lo: number;
  hi: number;
  active: boolean;
  onChange: (lo: number, hi: number) => void;
}) {
  const { t } = useI18n();
  const track = useRef<HTMLDivElement>(null);
  const handles = useRef<Record<'lo' | 'hi', HTMLDivElement | null>>({ lo: null, hi: null });
  const drag = useRef<'lo' | 'hi' | null>(null);

  const yearAt = (clientX: number) => {
    const r = track.current?.getBoundingClientRect();
    return r && r.width > 0 ? AGE_MIN + ((clientX - r.left) / r.width) * SPAN : AGE_MIN;
  };
  const move = (which: 'lo' | 'hi', clientX: number) => {
    const y = Math.round(yearAt(clientX));
    if (which === 'lo') onChange(clamp(y, AGE_MIN, hi), hi);
    else onChange(lo, clamp(y - 1, lo, AGE_MAX));
  };
  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    const y = yearAt(e.clientX);
    const which = Math.abs(y - lo) <= Math.abs(y - (hi + 1)) ? 'lo' : 'hi';
    drag.current = which;
    e.currentTarget.setPointerCapture(e.pointerId);
    handles.current[which]?.focus();
    move(which, e.clientX);
  };
  const onKey = (which: 'lo' | 'hi') => (e: KeyboardEvent) => {
    const step = KEY_STEP[e.key];
    const v = which === 'lo' ? lo : hi;
    const next = e.key === 'Home' ? -Infinity : e.key === 'End' ? Infinity : step === undefined ? null : v + step;
    if (next === null) return;
    e.preventDefault();
    if (which === 'lo') onChange(clamp(next, AGE_MIN, hi), hi);
    else onChange(lo, clamp(next, lo, AGE_MAX));
  };
  const handle = (which: 'lo' | 'hi') => (
    <div
      ref={(el) => {
        handles.current[which] = el;
      }}
      role="slider"
      tabIndex={0}
      aria-label={which === 'lo' ? t.ageMinLabel : t.ageMaxLabel}
      aria-valuemin={which === 'lo' ? AGE_MIN : lo}
      aria-valuemax={which === 'lo' ? hi : AGE_MAX}
      aria-valuenow={which === 'lo' ? lo : hi}
      onKeyDown={onKey(which)}
      data-handle={which}
      className={cx(
        'absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full border-[1.5px] bg-card shadow-control active:cursor-grabbing',
        active ? 'border-accent' : 'border-muted',
      )}
      style={{ left: `${at(which === 'lo' ? lo : hi + 1)}%` }}
    />
  );

  return (
    // The track itself is a pointer target only; keyboard users move the two slider handles.
    <div
      ref={track}
      role="presentation"
      onPointerDown={onDown}
      onPointerMove={(e) => drag.current && move(drag.current, e.clientX)}
      onPointerUp={() => (drag.current = null)}
      onPointerCancel={() => (drag.current = null)}
      className="relative h-4 touch-none select-none"
      data-age-track
    >
      <div aria-hidden className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-line" />
      <div
        aria-hidden
        className={cx('absolute top-1/2 h-[3px] -translate-y-1/2 rounded-full', active ? 'bg-accent' : 'bg-muted/50')}
        style={{ left: `${at(lo)}%`, width: `${at(hi + 1) - at(lo)}%` }}
      />
      {handle('lo')}
      {handle('hi')}
    </div>
  );
}
