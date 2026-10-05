import { describe, expect, it } from 'vitest';
import {
  assignTo,
  findRecruiters,
  inView,
  matchesFilter,
  matchesQuery,
  newestFirst,
  nextWorkingDays,
  openCount,
  reassign,
  recruiterFor,
  statusOf,
  summarize,
  timesSent,
} from './assignment';
import { ASSIGNMENT_NOW, ME, MY_TEAM, RECRUITERS, sampleAssignments } from './assignmentMock';
import type { Assignment } from '../types';

const NOW = ASSIGNMENT_NOW;
const rows = sampleAssignments();
const byName = (first: string, list: Assignment[] = rows) => {
  const a = list.find((r) => r.firstName === first);
  if (!a) throw new Error(`No sample candidate ${first}`);
  return a;
};
const recruiter = (first: string) => {
  const r = RECRUITERS.find((x) => x.firstName === first);
  if (!r) throw new Error(`No recruiter ${first}`);
  return r;
};
const recruiterMap = new Map(RECRUITERS.map((r) => [r.id, r]));
const kinds = (list: Assignment[]) =>
  list.reduce<Record<string, number>>((acc, a) => {
    const k = statusOf(a, NOW).kind;
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});

describe('sample data', () => {
  it('has about 30 candidates with the agreed mix of statuses', () => {
    expect(rows).toHaveLength(30);
    expect(kinds(rows)).toEqual({ notActed: 6, reassigned: 3, unassigned: 3, hired: 2, inProgress: 16 });
  });

  it('has 6 recruiters in Finance hiring and 3 in Technology', () => {
    expect(RECRUITERS.filter((r) => r.team === 'finance')).toHaveLength(6);
    expect(RECRUITERS.filter((r) => r.team === 'technology')).toHaveLength(3);
  });

  it('includes the candidates named in the spec test', () => {
    for (const first of ['Tomoko', 'Haruka', 'Kenta']) expect(() => byName(first)).not.toThrow();
    expect(byName('Tomoko').recruiterId).toBeNull();
  });
});

describe('status', () => {
  it('is red after 48 hours with no step done, counting whole days', () => {
    expect(statusOf(byName('Haruka'), NOW)).toEqual({ kind: 'notActed', days: 2 });
    expect(statusOf(byName('Yuki'), NOW)).toEqual({ kind: 'notActed', days: 3 });
  });

  it('stays in progress inside 48 hours, and once any step is done', () => {
    expect(statusOf(byName('Kenta'), NOW).kind).toBe('inProgress');
    expect(statusOf(byName('Kenta'), '2026-10-07T17:09').kind).toBe('inProgress');
    expect(statusOf(byName('Kenta'), '2026-10-07T17:10').kind).toBe('notActed');
    expect(statusOf(timesSent(byName('Haruka')), NOW).kind).toBe('inProgress');
  });

  it('is hired after all five steps, unassigned in the pool, orange when reassigned', () => {
    expect(statusOf(byName('Aiko'), NOW).kind).toBe('hired');
    expect(statusOf(byName('Tomoko'), NOW).kind).toBe('unassigned');
    expect(statusOf(byName('Lucas'), NOW).kind).toBe('reassigned');
  });
});

describe('views, filters and search', () => {
  it('shows mine, my team or everyone', () => {
    expect(rows.filter((a) => inView(a, 'individual', ME, MY_TEAM))).toHaveLength(6);
    expect(rows.filter((a) => inView(a, 'team', ME, MY_TEAM))).toHaveLength(21);
    expect(rows.filter((a) => inView(a, 'global', ME, MY_TEAM))).toHaveLength(30);
  });

  it('filters by status; Unassigned means in the pool', () => {
    expect(rows.filter((a) => matchesFilter(a, 'notActed', NOW))).toHaveLength(6);
    expect(rows.filter((a) => matchesFilter(a, 'reassigned', NOW))).toHaveLength(3);
    expect(rows.filter((a) => matchesFilter(a, 'unassigned', NOW))).toHaveLength(3);
  });

  it('searches candidate names in either order and recruiter names and emails', () => {
    expect(matchesQuery(byName('Haruka'), 'yamamoto haruka', recruiterMap)).toBe(true);
    expect(matchesQuery(byName('Haruka'), '  HARUKA ', recruiterMap)).toBe(true);
    expect(rows.filter((a) => matchesQuery(a, 'mai.suzuki@', recruiterMap)).map((a) => a.firstName)).toEqual(['Lucas', 'Sarah']);
    expect(matchesQuery(byName('Tomoko'), 'kondo', recruiterMap)).toBe(false);
  });

  it('sorts newest first', () => {
    const sorted = [...rows].sort(newestFirst);
    expect(sorted[0].firstName).toBe('Sota');
    expect(sorted.at(-1)?.firstName).toBe('Aiko');
  });
});

describe('left panel numbers', () => {
  it('counts per view, with the pool across everyone', () => {
    expect(summarize(rows, 'individual', ME, MY_TEAM, NOW)).toEqual({ notActed: 2, reassigned: 0, inProgress: 4, pool: 3, needAction: 3 });
    expect(summarize(rows, 'team', ME, MY_TEAM, NOW)).toMatchObject({ notActed: 5, reassigned: 2, inProgress: 12, pool: 3 });
    expect(summarize(rows, 'global', ME, MY_TEAM, NOW)).toMatchObject({ notActed: 6, reassigned: 3, inProgress: 18, pool: 3 });
  });

  it('counts each recruiter’s open candidates, including the ones in the list', () => {
    expect(openCount(recruiter('Mai'), rows)).toBe(4);
    expect(openCount(recruiter('Masato'), rows)).toBe(9);
  });
});

describe('assign, reassign, schedule', () => {
  it('assigns in one step: the recruiter shows and the status is In progress', () => {
    const a = assignTo(byName('Tomoko'), recruiter('Mai'), NOW);
    expect(a.recruiterId).toBe(recruiter('Mai').id);
    expect(statusOf(a, NOW).kind).toBe('inProgress');
    const pool = summarize(
      rows.map((r) => (r.id === a.id ? a : r)),
      'global',
      ME,
      MY_TEAM,
      NOW,
    ).pool;
    expect(pool).toBe(2);
  });

  it('reassigning sends the candidate back to the pool, orange, still on my list', () => {
    const a = reassign(byName('Haruka'), null, NOW);
    expect(a.recruiterId).toBeNull();
    expect(statusOf(a, NOW).kind).toBe('reassigned');
    expect(inView(a, 'individual', ME, MY_TEAM)).toBe(true);
    expect(matchesFilter(a, 'unassigned', NOW)).toBe(true);
  });

  it('reassigning to a suggested recruiter hands it over and starts from the first step', () => {
    const a = reassign(byName('Olivia'), recruiter('Daniel'), NOW);
    expect(a).toMatchObject({ recruiterId: recruiter('Daniel').id, reassignedFrom: ME, stepsDone: 0 });
    expect(statusOf(a, NOW).kind).toBe('reassigned');
  });

  it('sending open times lights up Reached out', () => {
    expect(timesSent(byName('Kenta')).stepsDone).toBe(1);
    expect(timesSent(byName('Aiko')).stepsDone).toBe(5);
  });

  it('offers the next three working days', () => {
    expect(nextWorkingDays(NOW, 3)).toEqual(['2026-10-06', '2026-10-07', '2026-10-08']);
    expect(nextWorkingDays('2026-10-09T10:00', 3)).toEqual(['2026-10-12', '2026-10-13', '2026-10-14']);
  });
});

describe('finding recruiters', () => {
  const team = (t: string) => (t === 'finance' ? 'Finance hiring' : 'Technology');

  it('filters by name, email or team as you type', () => {
    expect(findRecruiters(RECRUITERS, 'mai.su', team).map((r) => r.firstName)).toEqual(['Mai']);
    expect(findRecruiters(RECRUITERS, 'technology', team)).toHaveLength(3);
    expect(findRecruiters(RECRUITERS, '', team)).toHaveLength(RECRUITERS.length);
  });

  it('resolves a typed email or name only when it points at one recruiter', () => {
    expect(recruiterFor(RECRUITERS, 'mai.suzuki@robertwalters.co.jp')?.firstName).toBe('Mai');
    expect(recruiterFor(RECRUITERS, 'Masato')?.firstName).toBe('Masato');
    expect(recruiterFor(RECRUITERS, 'ma')).toBeNull();
    expect(recruiterFor(RECRUITERS, 'nobody@example.com')).toBeNull();
  });
});
