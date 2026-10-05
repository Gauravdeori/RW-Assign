import { CONFIG } from '../config';
import {
  PROGRESS_STEPS,
  type Assignment,
  type AssignmentFilter,
  type AssignmentStatus,
  type AssignmentView,
  type MeetingType,
  type ReassignReason,
  type Recruiter,
  type TeamId,
} from '../types';

/**
 * Assignment page rules, kept free of React so they can be tested and later moved behind an API.
 * Times are 'YYYY-MM-DDTHH:mm' strings in Japan time, compared as plain numbers (no time-zone conversion).
 */

/** Minutes since 1970 for a 'YYYY-MM-DDTHH:mm' stamp, treating it as a wall-clock time. */
export function stampMinutes(stamp: string): number {
  const [date, time = '00:00'] = stamp.split('T');
  const [y, m, d] = date.split('-').map(Number);
  const [h, mi] = time.split(':').map(Number);
  return Date.UTC(y, m - 1, d, h, mi) / 60_000;
}

const hoursBetween = (from: string, to: string) => (stampMinutes(to) - stampMinutes(from)) / 60;

export interface StatusInfo {
  kind: AssignmentStatus;
  /** Whole days since assignment, for "Not acted on · 2d". */
  days: number;
}

/**
 * Hired once all five steps are done. Reassigned (orange) until the next recruiter does a step. Unassigned while
 * in the pool. Not acted on (red) when assigned at least 48 hours ago (CONFIG) with no step done. Otherwise in progress.
 */
export function statusOf(a: Assignment, now: string): StatusInfo {
  if (a.stepsDone >= 5) return { kind: 'hired', days: 0 };
  if (a.reassignedFrom !== null && a.stepsDone === 0) return { kind: 'reassigned', days: 0 };
  if (a.recruiterId === null || a.assignedAt === null) return { kind: 'unassigned', days: 0 };
  const hours = hoursBetween(a.assignedAt, now);
  if (a.stepsDone === 0 && hours >= CONFIG.assignmentReturnHours) return { kind: 'notActed', days: Math.floor(hours / 24) };
  return { kind: 'inProgress', days: 0 };
}

/** Rows each dashboard shows: mine (including ones I handed on), my team's (assigned or in its pool), or everyone's. */
export function inView(a: Assignment, view: AssignmentView, me: string, myTeam: TeamId): boolean {
  if (view === 'individual') return a.recruiterId === me || a.reassignedFrom === me;
  if (view === 'team') return a.team === myTeam;
  return true;
}

export function matchesFilter(a: Assignment, filter: AssignmentFilter, now: string): boolean {
  if (filter === 'all') return true;
  if (filter === 'unassigned') return a.recruiterId === null;
  return statusOf(a, now).kind === filter;
}

const norm = (s: string) => s.toLowerCase().normalize('NFKC').replace(/\s+/g, ' ').trim();

/** Free-text search over the candidate's name (either order) and the recruiter's name and email. */
export function matchesQuery(a: Assignment, query: string, recruiters: ReadonlyMap<string, Recruiter>): boolean {
  const q = norm(query);
  if (!q) return true;
  const r = a.recruiterId ? recruiters.get(a.recruiterId) : undefined;
  const fields = [`${a.firstName} ${a.lastName}`, `${a.lastName} ${a.firstName}`];
  if (r) fields.push(`${r.firstName} ${r.lastName}`, `${r.lastName} ${r.firstName}`, r.email);
  return fields.some((f) => norm(f).includes(q));
}

/** Newest resume first. */
export const newestFirst = (a: Assignment, b: Assignment) => stampMinutes(b.receivedAt) - stampMinutes(a.receivedAt);

/** Recruiters whose name, email or team matches what was typed (all of them when nothing is typed). */
export function findRecruiters(recruiters: readonly Recruiter[], query: string, teamName: (t: TeamId) => string): Recruiter[] {
  const q = norm(query);
  if (!q) return [...recruiters];
  return recruiters.filter((r) =>
    [`${r.firstName} ${r.lastName}`, `${r.lastName} ${r.firstName}`, r.email, teamName(r.team)].some((f) => norm(f).includes(q)),
  );
}

/** The recruiter an email (or a name) in the Reassign box points at, when it points at exactly one. */
export function recruiterFor(recruiters: readonly Recruiter[], typed: string): Recruiter | null {
  const q = norm(typed);
  if (!q) return null;
  const exact = recruiters.find((r) => r.email === q || norm(`${r.firstName} ${r.lastName}`) === q);
  if (exact) return exact;
  const starts = recruiters.filter((r) => r.email.startsWith(q) || norm(`${r.firstName} ${r.lastName}`).startsWith(q));
  return starts.length === 1 ? starts[0] : null;
}

/** Open candidates per recruiter: older ones outside the list plus every unfinished one in it. */
export function openCount(r: Recruiter, rows: readonly Assignment[]): number {
  return r.openElsewhere + rows.filter((a) => a.recruiterId === r.id && a.stepsDone < 5).length;
}

export interface Summary {
  notActed: number;
  reassigned: number;
  /** In progress, hired included (both green). */
  inProgress: number;
  /** Everything in the pool, across Robert Walters. */
  pool: number;
  /** Mine with no step done yet (red or new). */
  needAction: number;
}

/** Numbers for the left panel: the status counts within the view, and the pool across everyone. */
export function summarize(rows: readonly Assignment[], view: AssignmentView, me: string, myTeam: TeamId, now: string): Summary {
  const s: Summary = { notActed: 0, reassigned: 0, inProgress: 0, pool: 0, needAction: 0 };
  for (const a of rows) {
    if (a.recruiterId === null) s.pool += 1;
    if (!inView(a, view, me, myTeam)) continue;
    const kind = statusOf(a, now).kind;
    if (kind === 'notActed') s.notActed += 1;
    else if (kind === 'reassigned') s.reassigned += 1;
    else if (kind === 'inProgress' || kind === 'hired') s.inProgress += 1;
    if (a.recruiterId === me && a.stepsDone === 0 && (kind === 'notActed' || kind === 'inProgress')) s.needAction += 1;
  }
  return s;
}

// ---------- changes (each returns a new row) ----------

/** Assign straight away: the row shows the recruiter and goes to In progress. */
export const assignTo = (a: Assignment, r: Recruiter, now: string): Assignment => ({
  ...a,
  recruiterId: r.id,
  team: r.team,
  assignedAt: now,
  reassignedFrom: null,
  reassignReason: null,
});

/**
 * Hand the candidate on: to the suggested recruiter, or back to the pool. The row turns orange; the next recruiter
 * starts from the first step, with no meeting.
 */
export const reassign = (a: Assignment, to: Recruiter | null, reason: ReassignReason, now: string): Assignment => ({
  ...a,
  reassignedFrom: a.recruiterId ?? a.reassignedFrom,
  reassignReason: reason,
  recruiterId: to?.id ?? null,
  team: to?.team ?? a.team,
  assignedAt: to ? now : null,
  stepsDone: 0,
  jobsSent: 0,
  interviews: 0,
  meeting: null,
});

/** Most jobs sent or interviews one candidate can be given in the counters. */
export const MAX_COUNT = 99;

/**
 * Set how many steps are done. Steps never skip: ticking a step ticks the ones before it, unticking one unticks the
 * ones after it. Job sent and Interview count at least 1 while done, and go back to 0 when undone.
 */
export function setSteps(a: Assignment, steps: number): Assignment {
  const n = Math.max(0, Math.min(PROGRESS_STEPS.length, Math.round(steps)));
  return {
    ...a,
    stepsDone: n,
    jobsSent: n >= 3 ? Math.max(1, a.jobsSent) : 0,
    interviews: n >= 4 ? Math.max(1, a.interviews) : 0,
  };
}

/** Change the Job sent or Interview count (only while that step is done; between 1 and MAX_COUNT). */
export function setCount(a: Assignment, key: 'jobsSent' | 'interviews', n: number): Assignment {
  const needs = key === 'jobsSent' ? 3 : 4;
  if (a.stepsDone < needs) return a;
  return { ...a, [key]: Math.max(1, Math.min(MAX_COUNT, Math.round(n))) };
}

/** Open times sent to the candidate: that counts as reaching out. A new set replaces the last one. */
export const timesSent = (a: Assignment, type: MeetingType, times: readonly string[]): Assignment => ({
  ...a,
  stepsDone: Math.max(a.stepsDone, 1),
  meeting: { type, offered: [...times].sort(), picked: null },
});

/** The candidate picked one of the times sent: the meeting is booked. */
export function pickTime(a: Assignment, slot: string): Assignment {
  if (!a.meeting || !a.meeting.offered.includes(slot)) return a;
  return { ...a, meeting: { ...a.meeting, picked: slot } };
}

/** The next `n` working days (Monday to Friday) after the day of `now`, as 'YYYY-MM-DD'. */
export function nextWorkingDays(now: string, n: number): string[] {
  const days: string[] = [];
  let t = Math.floor(stampMinutes(now) / 1440) * 1440;
  while (days.length < n) {
    t += 1440;
    const d = new Date(t * 60_000);
    const wd = d.getUTCDay();
    if (wd !== 0 && wd !== 6) days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

/** Day of the week (0 = Sunday) for a 'YYYY-MM-DD' date. */
export const weekday = (date: string) => new Date(stampMinutes(date) * 60_000).getUTCDay();

export const initials = (first: string, last: string) => `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();

export interface RecruiterStats {
  recruiter: Recruiter;
  assigned: number;
  open: number;
  notActed: number;
  /** Candidates this recruiter handed on (too busy, wrong person...). */
  handedOn: number;
  reachedOut: number;
  interviews: number;
  hired: number;
}

export interface Analytics {
  total: number;
  pool: number;
  notActed: number;
  interviews: number;
  hired: number;
  /** Assigned candidates, then how many of them reached each step (Reached out ... Hired). */
  funnel: number[];
  reasons: Record<ReassignReason, number>;
  recruiters: RecruiterStats[];
}

/** Analytics page numbers, for one team or (team null) all of Robert Walters. */
export function analyze(rows: readonly Assignment[], recruiters: readonly Recruiter[], team: TeamId | null, now: string): Analytics {
  const scoped = team ? rows.filter((a) => a.team === team) : [...rows];
  const assigned = scoped.filter((a) => a.recruiterId !== null);
  const kinds = new Map(scoped.map((a) => [a.id, statusOf(a, now).kind]));
  const reasons: Record<ReassignReason, number> = { busy: 0, wrong: 0, other: 0 };
  for (const a of scoped) if (a.reassignedFrom !== null && a.reassignReason) reasons[a.reassignReason] += 1;
  const sum = (list: readonly Assignment[], f: (a: Assignment) => number) => list.reduce((n, a) => n + f(a), 0);

  return {
    total: scoped.length,
    pool: scoped.length - assigned.length,
    notActed: scoped.filter((a) => kinds.get(a.id) === 'notActed').length,
    interviews: sum(scoped, (a) => a.interviews),
    hired: scoped.filter((a) => a.stepsDone >= PROGRESS_STEPS.length).length,
    funnel: [assigned.length, ...PROGRESS_STEPS.map((_, i) => assigned.filter((a) => a.stepsDone > i).length)],
    reasons,
    recruiters: recruiters
      .filter((r) => !team || r.team === team)
      .map((r) => {
        const mine = rows.filter((a) => a.recruiterId === r.id);
        return {
          recruiter: r,
          assigned: mine.length,
          open: openCount(r, rows),
          notActed: mine.filter((a) => statusOf(a, now).kind === 'notActed').length,
          handedOn: rows.filter((a) => a.reassignedFrom === r.id).length,
          reachedOut: mine.filter((a) => a.stepsDone >= 1).length,
          interviews: sum(mine, (a) => a.interviews),
          hired: mine.filter((a) => a.stepsDone >= PROGRESS_STEPS.length).length,
        };
      })
      .sort((x, y) => y.notActed - x.notActed || x.recruiter.lastName.localeCompare(y.recruiter.lastName)),
  };
}
