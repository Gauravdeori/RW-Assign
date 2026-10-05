import type {
  Assignment,
  Candidate,
  Industry,
  Level,
  Major,
  Position,
  PreviousCompany,
  Recruiter,
  SchoolRating,
  Seniority,
  TeamId,
} from '../types';

/**
 * Sample data for the Assignment page (proof of concept). Every person here is invented.
 * Everything the page shows comes from this one module, so a backend can replace it later
 * (see lib/assignment.ts for the rules the page applies to it).
 */

/** The demo clock: statuses ("Not acted on · 2d") are worked out against this time, not the real one. */
export const ASSIGNMENT_NOW = '2026-10-05T21:00';

/** The signed-in recruiter, and the team the Team view shows. */
export const ME = 'r1';
export const MY_TEAM: TeamId = 'finance';

const recruiter = (id: string, firstName: string, lastName: string, team: TeamId, openElsewhere: number): Recruiter => ({
  id,
  firstName,
  lastName,
  email: `${firstName}.${lastName}@robertwalters.co.jp`.toLowerCase(),
  team,
  openElsewhere,
});

export const RECRUITERS: Recruiter[] = [
  recruiter('r1', 'Takeshi', 'Kondo', 'finance', 2),
  recruiter('r2', 'Mai', 'Suzuki', 'finance', 2),
  recruiter('r3', 'Daniel', 'Lee', 'finance', 3),
  recruiter('r4', 'Hana', 'Yoshida', 'finance', 2),
  recruiter('r5', 'Ryo', 'Matsumoto', 'finance', 4),
  recruiter('r6', 'Emily', 'Clarke', 'finance', 1),
  recruiter('r7', 'Masato', 'Shimizu', 'technology', 6),
  recruiter('r8', 'Priya', 'Nair', 'technology', 3),
  recruiter('r9', 'Kenji', 'Mori', 'technology', 5),
];

/**
 * The recruiter's open times offered in the Schedule dialog, one list per working day after today.
 * Japan time. The same for every recruiter in the prototype.
 */
export const OPEN_TIMES: string[][] = [
  ['10:00', '13:30', '16:00'],
  ['09:30', '11:00', '15:00'],
  ['10:00', '14:00', '17:30'],
];

// ---------- candidates ----------

interface Seed {
  first: string;
  last: string;
  title: string;
  company: string;
  received: string;
  team: TeamId;
  /** Recruiter id, or null while in the pool. */
  to: string | null;
  assigned?: string;
  steps?: number;
  jobs?: number;
  interviews?: number;
  from?: string;
  industry: Industry;
  position: Position;
  /** Japanese name (Japanese native, business English) or international (English native, business Japanese). */
  jp: boolean;
}

/*
 * 30 candidates over the last five days. About 20% red (assigned over 48 hours ago, nothing done), 10% orange
 * (reassigned), 10% unassigned, two hired, the rest in progress.
 */
const SEEDS: Seed[] = [
  // Finance hiring team
  {
    first: 'Sota',
    last: 'Nakamura',
    title: 'Financial Controller',
    company: 'Sony',
    received: '2026-10-05T18:42',
    team: 'finance',
    to: 'r1',
    assigned: '2026-10-05T19:05',
    steps: 1,
    industry: 'technology',
    position: 'finance',
    jp: true,
  },
  {
    first: 'Kenta',
    last: 'Endo',
    title: 'Sales Manager',
    company: 'MUFG Bank',
    received: '2026-10-05T16:05',
    team: 'finance',
    to: 'r1',
    assigned: '2026-10-05T17:10',
    industry: 'financial',
    position: 'sales',
    jp: true,
  },
  {
    first: 'Emma',
    last: 'Schmidt',
    title: 'Compliance Officer',
    company: 'MUFG Bank',
    received: '2026-10-05T13:20',
    team: 'finance',
    to: null,
    industry: 'financial',
    position: 'legal',
    jp: false,
  },
  {
    first: 'Lucas',
    last: 'Laurent',
    title: 'Supply Chain Manager',
    company: 'J.P. Morgan',
    received: '2026-10-05T11:30',
    team: 'finance',
    to: 'r2',
    assigned: '2026-10-05T12:10',
    from: 'r5',
    industry: 'financial',
    position: 'supply',
    jp: false,
  },
  {
    first: 'Ren',
    last: 'Watanabe',
    title: 'Senior Accountant',
    company: 'Deloitte Japan',
    received: '2026-10-05T09:15',
    team: 'finance',
    to: 'r6',
    assigned: '2026-10-05T10:00',
    steps: 1,
    industry: 'professional',
    position: 'finance',
    jp: true,
  },
  {
    first: 'Nana',
    last: 'Kimura',
    title: 'Internal Audit Manager',
    company: 'Rakuten',
    received: '2026-10-04T20:05',
    team: 'finance',
    to: 'r3',
    assigned: '2026-10-04T20:30',
    steps: 1,
    industry: 'technology',
    position: 'finance',
    jp: true,
  },
  {
    first: 'Kazuki',
    last: 'Shimada',
    title: 'Investment Analyst',
    company: 'Nomura',
    received: '2026-10-04T18:10',
    team: 'finance',
    to: 'r4',
    assigned: '2026-10-04T18:30',
    steps: 3,
    jobs: 2,
    industry: 'financial',
    position: 'finance',
    jp: true,
  },
  {
    first: 'Olivia',
    last: 'Bennett',
    title: 'FP&A Manager',
    company: 'Nestlé Japan',
    received: '2026-10-04T15:20',
    team: 'finance',
    to: 'r1',
    assigned: '2026-10-04T16:00',
    steps: 2,
    industry: 'consumer',
    position: 'finance',
    jp: false,
  },
  {
    first: 'Misaki',
    last: 'Fujita',
    title: 'Treasury Manager',
    company: 'Mitsubishi Corporation',
    received: '2026-10-04T11:05',
    team: 'finance',
    to: 'r5',
    assigned: '2026-10-04T12:00',
    steps: 3,
    jobs: 4,
    industry: 'energy',
    position: 'finance',
    jp: true,
  },
  {
    first: 'Ayaka',
    last: 'Hasegawa',
    title: 'Payroll Manager',
    company: 'Fast Retailing',
    received: '2026-10-04T10:25',
    team: 'finance',
    to: 'r3',
    assigned: '2026-10-04T11:00',
    steps: 1,
    industry: 'consumer',
    position: 'hr',
    jp: true,
  },
  {
    first: 'Tomoko',
    last: 'Tanaka',
    title: 'Marketing Manager',
    company: 'Google Japan',
    received: '2026-10-04T09:48',
    team: 'finance',
    to: null,
    industry: 'technology',
    position: 'marketing',
    jp: true,
  },
  {
    first: 'Daisuke',
    last: 'Hayashi',
    title: 'General Manager',
    company: 'J.P. Morgan',
    received: '2026-10-03T19:26',
    team: 'finance',
    to: 'r4',
    assigned: '2026-10-03T20:00',
    steps: 4,
    jobs: 3,
    industry: 'financial',
    position: 'gm',
    jp: true,
  },
  {
    first: 'Sarah',
    last: 'Kim',
    title: 'Audit Manager',
    company: 'PwC Japan',
    received: '2026-10-03T16:55',
    team: 'finance',
    to: 'r2',
    assigned: '2026-10-03T17:30',
    steps: 2,
    industry: 'professional',
    position: 'finance',
    jp: false,
  },
  {
    first: 'Jun',
    last: 'Inoue',
    title: 'Marketing Manager',
    company: 'Microsoft Japan',
    received: '2026-10-03T14:02',
    team: 'finance',
    to: 'r3',
    assigned: '2026-10-03T15:00',
    industry: 'technology',
    position: 'marketing',
    jp: true,
  },
  {
    first: 'Haruka',
    last: 'Yamamoto',
    title: 'Engineering Manager',
    company: 'KPMG Japan',
    received: '2026-10-03T10:12',
    team: 'finance',
    to: 'r1',
    assigned: '2026-10-03T11:05',
    industry: 'professional',
    position: 'it',
    jp: true,
  },
  {
    first: 'Yusuke',
    last: 'Kato',
    title: 'Credit Analyst',
    company: 'SMBC',
    received: '2026-10-03T09:30',
    team: 'finance',
    to: 'r6',
    assigned: '2026-10-04T09:00',
    from: 'r3',
    industry: 'financial',
    position: 'finance',
    jp: true,
  },
  {
    first: 'Takumi',
    last: 'Ono',
    title: 'Finance Director',
    company: 'Rakuten',
    received: '2026-10-02T15:30',
    team: 'finance',
    to: 'r6',
    assigned: '2026-10-02T16:00',
    industry: 'technology',
    position: 'finance',
    jp: true,
  },
  {
    first: 'Yuki',
    last: 'Kobayashi',
    title: 'General Counsel',
    company: 'J.P. Morgan',
    received: '2026-10-02T12:11',
    team: 'finance',
    to: 'r1',
    assigned: '2026-10-02T13:00',
    industry: 'financial',
    position: 'legal',
    jp: true,
  },
  {
    first: 'Hiroshi',
    last: 'Saito',
    title: 'Head of Tax',
    company: 'EY Japan',
    received: '2026-10-02T10:40',
    team: 'finance',
    to: 'r5',
    assigned: '2026-10-02T11:30',
    industry: 'professional',
    position: 'finance',
    jp: true,
  },
  {
    first: 'Naomi',
    last: 'Walsh',
    title: 'Risk Manager',
    company: 'Goldman Sachs Japan',
    received: '2026-10-01T14:05',
    team: 'finance',
    to: 'r3',
    assigned: '2026-10-01T15:00',
    steps: 5,
    jobs: 5,
    interviews: 3,
    industry: 'financial',
    position: 'finance',
    jp: false,
  },
  {
    first: 'Aiko',
    last: 'Ito',
    title: 'Managing Director',
    company: 'J.P. Morgan',
    received: '2026-10-01T09:20',
    team: 'finance',
    to: 'r1',
    assigned: '2026-10-01T10:00',
    steps: 5,
    jobs: 7,
    interviews: 4,
    industry: 'financial',
    position: 'gm',
    jp: true,
  },
  // Technology team
  {
    first: 'Riku',
    last: 'Ishikawa',
    title: 'Software Engineer',
    company: 'Google Japan',
    received: '2026-10-05T15:10',
    team: 'technology',
    to: 'r7',
    assigned: '2026-10-05T15:40',
    steps: 1,
    industry: 'technology',
    position: 'it',
    jp: true,
  },
  {
    first: 'James',
    last: "O'Connor",
    title: 'Cloud Architect',
    company: 'Microsoft Japan',
    received: '2026-10-05T10:35',
    team: 'technology',
    to: null,
    industry: 'technology',
    position: 'it',
    jp: false,
  },
  {
    first: 'Mei',
    last: 'Takahashi',
    title: 'Data Scientist',
    company: 'Sony',
    received: '2026-10-04T13:50',
    team: 'technology',
    to: 'r8',
    assigned: '2026-10-04T14:30',
    steps: 2,
    industry: 'technology',
    position: 'it',
    jp: true,
  },
  {
    first: 'Daichi',
    last: 'Ogawa',
    title: 'Product Manager',
    company: 'LY Corporation',
    received: '2026-10-03T11:20',
    team: 'technology',
    to: 'r9',
    assigned: '2026-10-03T12:00',
    industry: 'technology',
    position: 'it',
    jp: true,
  },
  {
    first: 'Sophie',
    last: 'Martin',
    title: 'UX Designer',
    company: 'Rakuten',
    received: '2026-10-02T17:05',
    team: 'technology',
    to: 'r7',
    assigned: '2026-10-03T10:00',
    from: 'r9',
    industry: 'technology',
    position: 'marketing',
    jp: false,
  },
  {
    first: 'Shota',
    last: 'Yamada',
    title: 'DevOps Engineer',
    company: 'Mercari',
    received: '2026-10-02T09:10',
    team: 'technology',
    to: 'r8',
    assigned: '2026-10-02T10:00',
    steps: 3,
    jobs: 3,
    industry: 'technology',
    position: 'it',
    jp: true,
  },
  {
    first: 'Arjun',
    last: 'Patel',
    title: 'Security Engineer',
    company: 'Amazon Japan',
    received: '2026-10-01T16:30',
    team: 'technology',
    to: 'r9',
    assigned: '2026-10-01T17:00',
    steps: 4,
    jobs: 4,
    interviews: 2,
    industry: 'technology',
    position: 'it',
    jp: false,
  },
  {
    first: 'Chen',
    last: 'Wei',
    title: 'IT Project Manager',
    company: 'Accenture Japan',
    received: '2026-10-01T11:45',
    team: 'technology',
    to: 'r7',
    assigned: '2026-10-01T13:00',
    steps: 4,
    jobs: 3,
    interviews: 2,
    industry: 'professional',
    position: 'it',
    jp: false,
  },
  {
    first: 'Leo',
    last: 'Fischer',
    title: 'Data Engineer',
    company: 'Google Japan',
    received: '2026-10-01T10:00',
    team: 'technology',
    to: 'r8',
    assigned: '2026-10-01T11:00',
    steps: 2,
    industry: 'technology',
    position: 'it',
    jp: false,
  },
];

// ---------- CVs (built from the seed, so the CV preview has something real to show) ----------

const JP_SCHOOLS: [string, SchoolRating][] = [
  ['Keio University', 'S'],
  ['Waseda University', 'S'],
  ['Hitotsubashi University', 'A'],
  ['University of Tokyo', 'S'],
  ['Osaka University', 'A'],
  ['Sophia University', 'A'],
  ['Kyoto University', 'S'],
  ['Tohoku University', 'A'],
];
const OVERSEAS_SCHOOLS = [
  'University of Toronto',
  'National University of Singapore',
  'University of Manchester',
  'Sciences Po',
  'Seoul National University',
  'University of Melbourne',
];
const PREVIOUS: Record<Position, [string, string]> = {
  finance: ['Deloitte Japan', 'Senior Associate'],
  sales: ['Mizuho Bank', 'Relationship Manager'],
  marketing: ['Unilever Japan', 'Brand Manager'],
  legal: ['Nishimura & Asahi', 'Associate'],
  supply: ['Toyota Tsusho', 'Logistics Planner'],
  hr: ['Recruit Holdings', 'HR Business Partner'],
  it: ['Fujitsu', 'Systems Engineer'],
  gm: ['Morgan Stanley MUFG', 'Executive Director'],
};
const MAJOR_FOR: Record<Position, Major> = {
  finance: 'business',
  sales: 'business',
  marketing: 'humanities',
  legal: 'law',
  supply: 'engineering',
  hr: 'humanities',
  it: 'infosci',
  gm: 'business',
};

function seniorityOf(title: string): Seniority {
  if (/Managing Director|General Counsel|Director|Head of/.test(title)) return 'B';
  if (/General Manager/.test(title)) return 'B';
  if (/Manager|Architect/.test(title)) return 'K';
  if (/Senior/.test(title)) return 'S+';
  return 'S';
}

const YEARS: Record<Seniority, number> = { S: 4, 'S+': 7, K: 11, B: 16, Y: 22 };

function cvFor(s: Seed, i: number): Candidate {
  const seniority = seniorityOf(s.title);
  const years = YEARS[seniority] + (i % 3);
  const currentStartYear = 2026 - Math.min(5, Math.max(1, Math.floor(years / 3)));
  const [prevCompany, prevTitle] = PREVIOUS[s.position];
  const previous: PreviousCompany = {
    company: prevCompany,
    title: prevTitle,
    startYear: 2026 - years,
    endYear: currentStartYear,
    isForeign: false,
  };
  const [school, schoolRating] = s.jp
    ? JP_SCHOOLS[i % JP_SCHOOLS.length]
    : [OVERSEAS_SCHOOLS[i % OVERSEAS_SCHOOLS.length], 'Overseas' as const];
  const english: Level = s.jp ? (i % 2 ? 'Business' : 'Fluent') : 'Native';
  const japanese: Level = s.jp ? 'Native' : i % 2 ? 'Business' : 'Conversational';
  return {
    id: `asg-${i + 1}`,
    firstName: s.first,
    lastName: s.last,
    dateOfBirth: `${2026 - years - 23}-0${(i % 9) + 1}-1${i % 10}`,
    age: years + 23,
    gender: 'not_stated',
    currentCompany: s.company,
    currentTitle: s.title,
    currentStartYear,
    currentIsForeign: /Japan|Morgan|Goldman|Nestlé|Amazon/.test(s.company),
    previousCompanies: [previous],
    seniority,
    industry: s.industry,
    position: s.position,
    englishLevel: english,
    japaneseLevel: japanese,
    foreignCompanyCount: s.jp ? 1 : 2,
    yearsOverseas: s.jp ? i % 3 : 3 + (i % 4),
    gaishiScore: s.jp ? 'B' : 'A',
    toeicScore: s.jp ? 800 + (i % 5) * 30 : null,
    jlpt: s.jp ? null : japanese === 'Business' ? 'N2' : 'N3',
    education: [{ degree: "Bachelor's", major: MAJOR_FOR[s.position], school, schoolRating, gpa: null, gpaScale: 4 }],
    qualifications: s.position === 'finance' && i % 2 === 0 ? ['uscpa'] : [],
    otherQualifications: [],
    cvUpdatedAt: s.received.slice(0, 10),
    yearsExperience: years,
  };
}

/** A fresh copy of the sample candidates (the page changes its own copy as people assign and reassign). */
export function sampleAssignments(): Assignment[] {
  return SEEDS.map((s, i) => ({
    id: `asg-${i + 1}`,
    firstName: s.first,
    lastName: s.last,
    title: s.title,
    company: s.company,
    receivedAt: s.received,
    team: s.team,
    recruiterId: s.to,
    assignedAt: s.to ? (s.assigned ?? s.received) : null,
    stepsDone: s.steps ?? 0,
    jobsSent: s.jobs ?? (s.steps && s.steps >= 3 ? 1 : 0),
    interviews: s.interviews ?? (s.steps && s.steps >= 4 ? 1 : 0),
    reassignedFrom: s.from ?? null,
    cv: cvFor(s, i),
  }));
}
