import { useCallback, useMemo, useState } from 'react';
import { assignTo, reassign, timesSent } from '../../lib/assignment';
import { ASSIGNMENT_NOW, RECRUITERS, sampleAssignments } from '../../lib/assignmentMock';
import type { Assignment, Recruiter } from '../../types';

/**
 * The page's own copy of the sample candidates, and the three things people do to them. Instant, in memory only:
 * leaving the page puts the sample data back (handy before the next demo).
 */
export function useAssignments() {
  const [rows, setRows] = useState<Assignment[]>(sampleAssignments);
  const recruiters = useMemo(() => new Map(RECRUITERS.map((r) => [r.id, r])), []);

  const update = useCallback((id: string, change: (a: Assignment) => Assignment) => {
    setRows((prev) => prev.map((a) => (a.id === id ? change(a) : a)));
  }, []);

  const actions = useMemo(
    () => ({
      assign: (id: string, r: Recruiter) => update(id, (a) => assignTo(a, r, ASSIGNMENT_NOW)),
      reassign: (id: string, to: Recruiter | null) => update(id, (a) => reassign(a, to, ASSIGNMENT_NOW)),
      timesSent: (id: string) => update(id, timesSent),
    }),
    [update],
  );

  return { rows, recruiters, actions };
}
