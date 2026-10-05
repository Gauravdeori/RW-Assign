import type { Candidate } from './candidate';

/** Assignment page: new resumes handed to recruiters, and how far each recruiter has got. */

export const TEAMS = ['finance', 'technology'] as const;
export type TeamId = (typeof TEAMS)[number];

export interface Recruiter {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  team: TeamId;
  /** Open candidates outside this list (older resumes); the "4 open" count adds the ones in the list. */
  openElsewhere: number;
}

/** The five progress steps, left to right. They light up in order and never skip. */
export const PROGRESS_STEPS = ['reachedOut', 'met', 'jobSent', 'interview', 'hired'] as const;
export type ProgressStep = (typeof PROGRESS_STEPS)[number];

export interface Assignment {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
  company: string;
  /** When the resume arrived: 'YYYY-MM-DDTHH:mm', Japan time. */
  receivedAt: string;
  /** The hiring team whose pool the resume sits in (the recruiter's team once assigned). */
  team: TeamId;
  recruiterId: string | null;
  /** When the current recruiter got it ('YYYY-MM-DDTHH:mm', Japan time); null while in the pool. */
  assignedAt: string | null;
  /** Steps done, counted from the left: 0 = nothing yet, 5 = hired. */
  stepsDone: number;
  jobsSent: number;
  interviews: number;
  /** Who handed it on (too busy, or it reached the wrong person). Shown orange until the next recruiter acts. */
  reassignedFrom: string | null;
  /** The CV shown in the preview drawer. */
  cv: Candidate;
}

export type AssignmentStatus = 'notActed' | 'reassigned' | 'inProgress' | 'hired' | 'unassigned';
export type AssignmentView = 'individual' | 'team' | 'global';
export type AssignmentFilter = 'all' | 'notActed' | 'reassigned' | 'unassigned';
export type ReassignReason = 'busy' | 'wrong' | 'other';
export type MeetingType = 'video' | 'office' | 'phone';
