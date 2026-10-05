/** Resume Studio conversions (Upload Resume and Dashboard pages) and the Admin page. */

export type Lang = 'en' | 'ja';
export type ConversionMode = 'exact' | 'optimized';
export type ConversionEngine = 'standard' | 'complex';
export type ConversionStatus = 'exported' | 'review';

export interface Conversion {
  id: number;
  fileName: string;
  sizeKb: number;
  source: Lang;
  target: Lang;
  mode: ConversionMode;
  dualLanguage: boolean;
  hasTables: boolean;
  engine: ConversionEngine;
  status: ConversionStatus;
  uploadedBy: string;
  createdAt: string; // ISO date-time
}

export interface UploadSettings {
  source: Lang;
  target: Lang;
  mode: ConversionMode;
  engine: ConversionEngine;
}

export type FileProblem = 'type' | 'size' | null;

export const ROLES = ['admin', 'recruiter', 'viewer'] as const;
export type Role = (typeof ROLES)[number];
export type UserStatus = 'active' | 'invited' | 'deactivated';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  lastActive: string | null; // ISO date-time
}

/** Settings that change how the Search page behaves. */
export interface AppSettings {
  /** Some countries do not allow filtering by gender (open question in the requirements). */
  showGender: boolean;
  /** "Start from a job description" panel. */
  showJdFill: boolean;
  /** Language for people who have not picked one yet. */
  defaultLang: Lang;
}

export type SettingKey = 'gender' | 'jd';

export type ActivityKind =
  | 'login'
  | 'export'
  | 'search'
  | 'invite'
  | 'resend'
  | 'role'
  | 'activate'
  | 'deactivate'
  | 'remove'
  | 'settingOn'
  | 'settingOff'
  | 'lang'
  | 'reset';

export interface Activity {
  id: string;
  at: string; // ISO date-time
  kind: ActivityKind;
  /** Usually a person's name; for settings, the setting key; for lang, the language. */
  a?: string;
  /** Second detail: a file or search name, or a role key. */
  b?: string;
}
