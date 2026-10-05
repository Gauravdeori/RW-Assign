/**
 * Dummy Admin data: workspace users, search settings and an activity log.
 * Stored in the browser. Every person and email address is invented (example.com).
 */

import type { Activity, AdminUser } from '../types';
import { CURRENT_USER } from './conversions';
import { readJson, removeKey, writeJson } from './storage';

const USERS_KEY = 'resumeFinder.admin.users.v1';
const ACTIVITY_KEY = 'resumeFinder.admin.activity.v1';
const MAX_ACTIVITY = 30;

const MINUTE = 60_000;
const WEEK = 7 * 24 * 60 * MINUTE;
const ago = (minutes: number) => new Date(Date.now() - minutes * MINUTE).toISOString();
export const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;

function seedUsers(): AdminUser[] {
  return [
    { id: 'u-1', name: CURRENT_USER, email: 'resume-tester@example.com', role: 'admin', status: 'active', lastActive: ago(2) },
    { id: 'u-2', name: 'Aiko Mori', email: 'aiko.mori@example.com', role: 'recruiter', status: 'active', lastActive: ago(25) },
    { id: 'u-3', name: 'Daniel Hughes', email: 'daniel.hughes@example.com', role: 'recruiter', status: 'active', lastActive: ago(130) },
    {
      id: 'u-4',
      name: 'Kenta Fujiwara',
      email: 'kenta.fujiwara@example.com',
      role: 'viewer',
      status: 'active',
      lastActive: ago(60 * 24 * 9),
    },
    { id: 'u-5', name: 'Sara Lindqvist', email: 'sara.lindqvist@example.com', role: 'recruiter', status: 'invited', lastActive: null },
    {
      id: 'u-6',
      name: 'Hiroshi Nakano',
      email: 'hiroshi.nakano@example.com',
      role: 'recruiter',
      status: 'deactivated',
      lastActive: ago(60 * 24 * 41),
    },
  ];
}

function seedActivity(): Activity[] {
  return [
    { id: 'a-1', at: ago(2), kind: 'login', a: CURRENT_USER },
    { id: 'a-2', at: ago(25), kind: 'export', a: 'Aiko Mori', b: 'Haruki Tanabe.pdf' },
    { id: 'a-3', at: ago(130), kind: 'search', a: 'Daniel Hughes', b: 'Bilingual finance leaders' },
    { id: 'a-4', at: ago(60 * 26), kind: 'invite', a: 'Sara Lindqvist' },
    { id: 'a-5', at: ago(60 * 24 * 9), kind: 'login', a: 'Kenta Fujiwara' },
  ];
}

const isList = <T>(v: unknown): T[] | null => (Array.isArray(v) ? (v as T[]) : null);
export const loadUsers = () => readJson<AdminUser[]>(USERS_KEY, seedUsers, isList);
export const storeUsers = (v: AdminUser[]) => writeJson(USERS_KEY, v);
export const loadActivity = () => readJson<Activity[]>(ACTIVITY_KEY, seedActivity, isList);
export const storeActivity = (v: Activity[]) => writeJson(ACTIVITY_KEY, v.slice(0, MAX_ACTIVITY));

/** Forget the users and activity the admin page stored, so the next load returns the seed data. */
export function clearAdminStorage(): void {
  for (const k of [USERS_KEY, ACTIVITY_KEY]) removeKey(k);
}

export const isValidEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());

export const activeThisWeek = (u: AdminUser) =>
  u.status === 'active' && !!u.lastActive && Date.now() - new Date(u.lastActive).getTime() < WEEK;
