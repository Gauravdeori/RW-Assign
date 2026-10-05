import { useMemo, useSyncExternalStore } from 'react';
import { loadActivity, newId, storeActivity } from '../../lib/admin';
import { assignTo, pickTime, reassign, setCount, setSteps, timesSent } from '../../lib/assignment';
import { ASSIGNMENT_NOW, RECRUITERS } from '../../lib/assignmentMock';
import { getAssignments, subscribeAssignments, updateAssignments } from '../../lib/assignmentStore';
import type { ActivityKind, Assignment, MeetingType, ReassignReason, Recruiter } from '../../types';

const fullName = (p: { firstName: string; lastName: string }) => `${p.firstName} ${p.lastName}`;

/** Add a line to the Admin page's activity log (names are stored as written; the log puts them in a sentence). */
function log(kind: ActivityKind, a: string, b?: string) {
  storeActivity([{ id: newId('a'), at: new Date().toISOString(), kind, a, b }, ...loadActivity()]);
}

const recruiters = new Map(RECRUITERS.map((r) => [r.id, r]));

/** Change one row; returns the row as it was, for the log. */
function update(id: string, change: (a: Assignment) => Assignment): Assignment | undefined {
  const before = getAssignments().find((a) => a.id === id);
  updateAssignments((list) => list.map((a) => (a.id === id ? change(a) : a)));
  return before;
}

/**
 * The Assignment data (shared with Analytics, kept in this browser) and everything people can do to it. Each action
 * applies at once and is written to the Admin activity log.
 */
export function useAssignments() {
  const rows = useSyncExternalStore(subscribeAssignments, getAssignments);

  const actions = useMemo(
    () => ({
      assign: (id: string, r: Recruiter) => {
        const a = update(id, (x) => assignTo(x, r, ASSIGNMENT_NOW));
        if (a) log('assign', fullName(a), fullName(r));
      },
      reassign: (id: string, to: Recruiter | null, reason: ReassignReason) => {
        const a = update(id, (x) => reassign(x, to, reason, ASSIGNMENT_NOW));
        if (a) log(to ? 'reassign' : 'reassignPool', fullName(a), to ? fullName(to) : undefined);
      },
      timesSent: (id: string, type: MeetingType, times: string[]) => {
        const a = update(id, (x) => timesSent(x, type, times));
        if (a) log('timesSent', fullName(a));
      },
      pickTime: (id: string, slot: string) => {
        const a = update(id, (x) => pickTime(x, slot));
        if (a) log('meetingBooked', fullName(a));
      },
      setSteps: (id: string, steps: number) => {
        const a = update(id, (x) => setSteps(x, steps));
        if (a && a.stepsDone !== steps) log('progress', fullName(a));
      },
      setCount: (id: string, key: 'jobsSent' | 'interviews', n: number) => {
        update(id, (x) => setCount(x, key, n));
      },
    }),
    [],
  );

  return { rows, recruiters, actions };
}
