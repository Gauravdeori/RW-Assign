import type { Assignment } from '../types';
import { sampleAssignments } from './assignmentMock';
import { readJson, removeKey, writeJson } from './storage';

/**
 * The Assignment page's data, shared by every page (Assignment, Analytics) and kept in this browser, so changes
 * survive switching pages and reloading. Admin's "Reset demo data" puts the sample back. A backend replaces this file.
 */

const KEY = 'resumeFinder.assignments.v1';

const isRow = (r: unknown): r is Assignment => {
  if (typeof r !== 'object' || r === null) return false;
  const x = r as Record<string, unknown>;
  return (
    typeof x.id === 'string' &&
    typeof x.firstName === 'string' &&
    typeof x.receivedAt === 'string' &&
    typeof x.stepsDone === 'number' &&
    typeof x.jobsSent === 'number' &&
    typeof x.interviews === 'number' &&
    'meeting' in x &&
    'reassignReason' in x &&
    typeof x.cv === 'object' &&
    x.cv !== null
  );
};

/** Stored rows, or null when missing or from an older shape (then the sample data is used). */
const parse = (raw: unknown): Assignment[] | null => (Array.isArray(raw) && raw.length > 0 && raw.every(isRow) ? raw : null);

let rows: Assignment[] | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const getAssignments = (): Assignment[] => (rows ??= readJson(KEY, sampleAssignments, parse));

export function subscribeAssignments(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Change some rows and save. */
export function updateAssignments(change: (list: Assignment[]) => Assignment[]): void {
  rows = change(getAssignments());
  writeJson(KEY, rows);
  emit();
}

/** Forget the changes: back to the sample data. */
export function resetAssignments(): void {
  removeKey(KEY);
  rows = sampleAssignments();
  emit();
}
