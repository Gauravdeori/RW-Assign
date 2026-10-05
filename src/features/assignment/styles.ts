import { OFF, PICKED, PRESS } from '../../components/controlStyles';

/**
 * Assignment page controls, in the search page's design language (controlStyles): 6px corners, white with a grey
 * border, light red when picked, coral fill for the main action. Text is never under 13px.
 */
const BTN = `inline-flex items-center gap-1.5 rounded-md border leading-none whitespace-nowrap ${PRESS}`;

/** Row buttons (CV, Reassign, Schedule): 34px tall so a row stays compact. */
export const ROW_BTN = `${BTN} h-[34px] justify-center px-2.5 text-[15px] ${OFF} disabled:pointer-events-none disabled:border-panel-line disabled:text-muted/60`;
/** Coral main action (Assign, Reassign, Send). Same fill and text colour as the search page's Save. */
const PRIMARY = `${BTN} justify-center border-accent bg-accent text-[15px] font-semibold text-on-accent hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none`;
export const PRIMARY_BTN = `${PRIMARY} h-[38px] px-4 shadow-accent`;
/** The red Assign button in a row. */
export const ROW_PRIMARY_BTN = `${PRIMARY} h-[34px] px-4`;
export const SECONDARY_BTN = `${BTN} h-[38px] justify-center px-4 text-[15px] ${OFF}`;
/** A choice that can be picked (filter chips, view switch, reasons, meeting types, times). Callers set the alignment. */
export const choice = (on: boolean) => `${BTN} ${on ? PICKED : OFF}`;

/** 38px input: grey border; focused = coral border with a soft light-red glow. Phones get 16px so iOS does not zoom. */
export const FIELD =
  'h-[38px] w-full min-w-0 rounded-md border border-line bg-field px-3 text-[16px] text-ink outline-none placeholder:text-muted hover:border-accent/50 focus:border-accent focus:shadow-[0_0_0_3px_var(--pick-bg)] focus-visible:outline-none sm:text-[15px]';

/** White card: 1px #E4E4E4 border, 10px corners. */
export const PANEL = 'rounded-[10px] border border-panel-line bg-card shadow-card';

/** Small caption above a group (View, Status, Reason). */
export const CAPTION = 'text-[13px] font-bold text-muted';
