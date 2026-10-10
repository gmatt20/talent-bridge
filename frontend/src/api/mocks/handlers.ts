import type {
  AuthResponse,
  GoogleAuthResponse,
  Organization,
  Project,
  ProjectBrief,
  ProjectRecommendations,
  ProjectSummary,
  Proposal,
  Role,
  Skill,
  StudentProfile,
  StudentRecommendation,
  Team,
  User,
} from '../../types/api';
import {ApiError} from '../errors';
import {seed, type MockDb, type MockUser} from './fixtures';

// In-browser stand-in for the backend, enabled by VITE_USE_MOCKS=true.
// State persists to localStorage so a page reload doesn't log you out mid-demo.

const STORAGE_KEY = 'tb.mockdb.v1';

let db: MockDb = load();

function load(): MockDb {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    // Only this module writes STORAGE_KEY, always from a MockDb.
    if (raw) return JSON.parse(raw) as MockDb;
  } catch {
    // Unreadable storage: fall through to a fresh seed.
  }
  return seed();
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    // Storage unavailable; state lives for this tab only.
  }
}

/** Restores the demo data to its original seed. */
export function resetMockDb() {
  db = seed();
  save();
}

interface Ctx {
  params: string[];
  query: URLSearchParams;
  body: Record<string, unknown>;
  user: MockUser | null;
}

type Handler = (ctx: Ctx) => unknown;

interface MockRoute {
  method: string;
  pattern: RegExp;
  handler: Handler;
  latency?: number;
}

const routes: MockRoute[] = [];

function route(
  method: string,
  path: string,
  handler: Handler,
  latency?: number,
) {
  const pattern = new RegExp('^' + path.replace(/:\w+/g, '(\\d+)') + '$');
  routes.push({method, pattern, handler, latency});
}

/**
 * Answers an API request from the in-browser mock database, after a short
 * fake network delay. Used by `request()` when `VITE_USE_MOCKS=true`.
 */
export async function mockRequest<T>(
  method: string,
  path: string,
  body: unknown,
  token: string | null,
): Promise<T> {
  const url = new URL(path, 'http://mock');
  const match = routes
    .filter(r => r.method === method)
    .map(r => ({r, m: url.pathname.match(r.pattern)}))
    .find(x => x.m);

  await new Promise(resolve => setTimeout(resolve, match?.r.latency ?? 250));

  if (!match) throw new ApiError(404, `No mock for ${method} ${url.pathname}`);

  const userId = token?.startsWith('mock.') ? Number(token.slice(5)) : null;
  const ctx: Ctx = {
    params: match.m!.slice(1),
    query: url.searchParams,
    // Request bodies are JSON objects; handlers validate each field they read.
    body: (body ?? {}) as Record<string, unknown>,
    user: db.users.find(u => u.id === userId) ?? null,
  };

  const result = match.r.handler(ctx);
  save();
  // Each route returns the shape its API function declares as T.
  return structuredClone(result) as T;
}

// ---------- helpers ----------

function requireUser(ctx: Ctx, role?: Role): MockUser {
  if (!ctx.user) throw new ApiError(401, 'Please log in to continue.');
  if (role && ctx.user.role !== role) {
    throw new ApiError(403, `Only ${role}s can do this.`);
  }
  return ctx.user;
}

function requireString(
  body: Record<string, unknown>,
  key: string,
  label = key,
): string {
  const v = body[key];
  if (typeof v !== 'string' || !v.trim()) {
    throw new ApiError(400, `${label} is required.`);
  }
  return v.trim();
}

function optString(v: unknown) {
  return typeof v === 'string' && v.trim() ? v.trim() : undefined;
}

/** Reads a JWT's claims without checking its signature. */
function decodeJwtPayload(token: string): Record<string, unknown> {
  try {
    const base64 = (token.split('.')[1] ?? '')
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    // A JWT payload is a JSON object; its fields are checked before use.
    return JSON.parse(new TextDecoder().decode(bytes)) as Record<
      string,
      unknown
    >;
  } catch {
    throw new ApiError(401, 'Google sign-in failed. Please try again.');
  }
}

function toUser(mockUser: MockUser): User {
  const {id, role, email, name, createdAt} = mockUser;
  return {id, role, email, name, createdAt};
}

function skillsOf(ids: number[]): Skill[] {
  return ids
    .map(id => db.skills.find(s => s.id === id))
    .filter((s): s is Skill => !!s);
}

function findProject(id: number) {
  const p = db.projects.find(p => p.id === id);
  if (!p) throw new ApiError(404, 'Project not found.');
  return p;
}

function requireOwner(ctx: Ctx, projectId: number) {
  const user = requireUser(ctx, 'organization');
  const p = findProject(projectId);
  if (p.organizationId !== user.id) {
    throw new ApiError(403, 'This project belongs to another organization.');
  }
  return p;
}

function orgSummary(userId: number) {
  const o = db.organizations.find(o => o.userId === userId);
  return {id: userId, companyName: o?.companyName ?? 'Unknown organization'};
}

function studentSummary(userId: number) {
  const u = db.users.find(u => u.id === userId);
  const s = db.students.find(s => s.userId === userId);
  return {
    id: userId,
    name: u?.name ?? 'Unknown student',
    headline: s?.headline,
  };
}

function studentProfile(userId: number): StudentProfile {
  const s = db.students.find(s => s.userId === userId);
  if (!s) throw new ApiError(404, 'Student not found.');
  return {
    ...studentSummary(userId),
    bio: s.bio,
    availability: s.availability,
    rating: s.rating,
    skills: skillsOf(s.skillIds),
  };
}

function projectSummary(p: MockDb['projects'][number]): ProjectSummary {
  return {
    id: p.id,
    title: p.title,
    description: p.description,
    deadline: p.deadline,
    category: p.category,
    status: p.status,
    organization: orgSummary(p.organizationId),
    proposalCount: db.proposals.filter(x => x.projectId === p.id).length,
  };
}

function toBrief(
  b: NonNullable<MockDb['projects'][number]['brief']>,
): ProjectBrief {
  const {suggestedSkillIds, ...rest} = b;
  return {...rest, suggestedSkills: skillsOf(suggestedSkillIds)};
}

function projectDetail(p: MockDb['projects'][number]): Project {
  return {...projectSummary(p), brief: p.brief && toBrief(p.brief)};
}

function proposalView(x: MockDb['proposals'][number]): Proposal {
  const s = db.students.find(s => s.userId === x.studentId);
  return {
    id: x.id,
    coverLetter: x.coverLetter,
    status: x.status,
    createdAt: x.createdAt,
    student: {
      ...studentSummary(x.studentId),
      rating: s?.rating,
      skills: skillsOf(s?.skillIds ?? []),
    },
  };
}

function hoursPerWeek(text?: string) {
  const m = text?.match(/(\d+)\s*hrs?\b/i);
  return m ? Number(m[1]) : undefined;
}

function formatList(items: string[]) {
  if (items.length <= 1) return items[0] ?? '';
  return `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`;
}

// ---------- fake "AI" (deterministic, so demos are repeatable) ----------

const KEYWORD_SKILLS: [RegExp, string[]][] = [
  [
    /\b(app|website|web|online|sign ?up|portal|form)\b/i,
    ['React', 'Web Development', 'UI Design'],
  ],
  [
    /\b(data|spreadsheets?|reports?|numbers|dashboard|track)\b/i,
    ['Data Analysis', 'Excel', 'SQL'],
  ],
  [
    /\b(instagram|social|followers|posts?|marketing|customers|audience)\b/i,
    ['Social Media', 'Marketing', 'Copywriting'],
  ],
  [/\b(logo|flyers?|brand|poster|design)\b/i, ['Graphic Design', 'Figma']],
  [/\bvideos?\b/i, ['Video Editing']],
  [/\bphotos?\b/i, ['Photography']],
  [/\b(mobile|iphone|android)\b/i, ['Mobile Apps']],
];

function analyzeDescription(p: MockDb['projects'][number]) {
  const text = `${p.title} ${p.description} ${p.category ?? ''}`;
  const names = [
    ...new Set(
      KEYWORD_SKILLS.filter(([re]) => re.test(text)).flatMap(([, s]) => s),
    ),
  ];
  if (names.length === 0) names.push('Project Management');
  const suggestedSkillIds = names
    .map(n => db.skills.find(s => s.name === n)?.id)
    .filter((id): id is number => id !== undefined)
    .slice(0, 5);

  const objectives = [`Deliver a working solution for "${p.title}"`];
  if (/\b(hours|time|manual|phone|weekend)\b/i.test(text)) {
    objectives.push('Cut down the manual work your staff does today');
  }
  if (/\b(customers|locals|community|volunteers|followers)\b/i.test(text)) {
    objectives.push('Reach and serve more people in the community');
  }
  objectives.push('Leave your team able to maintain it after handoff');

  const deliverables = [
    'Short discovery summary of current process',
    'Working first version',
    'Handoff guide for your staff',
  ];

  const start = Date.now();
  const end = p.deadline
    ? Date.parse(p.deadline)
    : start + 1000 * 60 * 60 * 24 * 56;
  const at = (f: number) =>
    new Date(start + (end - start) * f).toISOString().slice(0, 10);
  const weeks = Math.max(
    2,
    Math.round((end - start) / (1000 * 60 * 60 * 24 * 7)),
  );

  return {
    objectives,
    deliverables,
    suggestedSkillIds,
    milestones: [
      {title: 'Discovery & requirements', dueDate: at(0.2)},
      {title: 'Build first version', dueDate: at(0.65)},
      {title: 'Review, polish & handoff', dueDate: at(1)},
    ],
    scope: `${weeks}-week project, ~8 hrs/week`,
  };
}

function score(studentSkillIds: number[], projectSkillIds: number[]) {
  const overlap = projectSkillIds.filter(id => studentSkillIds.includes(id));
  const missing = projectSkillIds.filter(id => !studentSkillIds.includes(id));
  const ratio = projectSkillIds.length
    ? overlap.length / projectSkillIds.length
    : 0;
  return {
    value: Math.min(0.98, Math.round((0.2 + ratio * 0.75) * 100) / 100),
    overlap,
    missing,
  };
}

// ---------- routes ----------

route('POST', '/api/auth/register', ({body}): AuthResponse => {
  // Checked against the allowed roles on the next line.
  const role = body.role as Role;
  if (!['organization', 'student', 'mentor'].includes(role)) {
    throw new ApiError(400, 'Choose a role.');
  }
  const name = requireString(body, 'name', 'Name');
  const email = requireString(body, 'email', 'Email').toLowerCase();
  const password = requireString(body, 'password_hash', 'Password');
  if (password.length < 8) {
    throw new ApiError(400, 'Password must be at least 8 characters.');
  }
  if (db.users.some(u => u.email === email)) {
    throw new ApiError(409, 'An account with this email already exists.');
  }

  const user: MockUser = {
    id: db.nextId++,
    role,
    email,
    password,
    name,
    createdAt: new Date().toISOString(),
  };
  db.users.push(user);
  if (role === 'organization') {
    db.organizations.push({userId: user.id, companyName: name});
  }
  if (role === 'student') db.students.push({userId: user.id, skillIds: []});
  if (role === 'mentor') db.mentors.push({userId: user.id, skillIds: []});
  return {token: `mock.${user.id}`, user: toUser(user)};
});

route('POST', '/api/auth/login', ({body}): AuthResponse => {
  const email = String(body.email ?? '')
    .trim()
    .toLowerCase();
  const user = db.users.find(
    u => u.email === email && u.password === body.password_hash,
  );
  if (!user) throw new ApiError(401, 'Invalid email or password.');
  return {token: `mock.${user.id}`, user: toUser(user)};
});

route('POST', '/api/auth/google', ({body}): GoogleAuthResponse => {
  // Mock mode trusts the token's claims; only the real backend verifies them.
  const claims = decodeJwtPayload(requireString(body, 'credential'));
  const email = optString(claims.email)?.toLowerCase();
  if (!email) {
    throw new ApiError(401, 'Google sign-in failed. Please try again.');
  }

  const existing = db.users.find(u => u.email === email);
  if (existing) {
    return {
      token: `mock.${existing.id}`,
      user: toUser(existing),
      isNewUser: false,
    };
  }

  if (body.role === undefined) {
    throw new ApiError(
      404,
      'No account uses this Google email yet. Create an account to continue.',
    );
  }
  // Checked against the allowed roles on the next line.
  const role = body.role as Role;
  if (!['organization', 'student', 'mentor'].includes(role)) {
    throw new ApiError(400, 'Choose a role.');
  }
  const name = optString(body.name) ?? optString(claims.name);
  if (!name) throw new ApiError(400, 'Name is required.');

  const user: MockUser = {
    id: db.nextId++,
    role,
    email,
    // Random, so the account can't be opened with a password.
    password: crypto.randomUUID(),
    name,
    createdAt: new Date().toISOString(),
  };
  db.users.push(user);
  if (role === 'organization') {
    db.organizations.push({userId: user.id, companyName: name});
  }
  if (role === 'student') db.students.push({userId: user.id, skillIds: []});
  if (role === 'mentor') db.mentors.push({userId: user.id, skillIds: []});
  return {token: `mock.${user.id}`, user: toUser(user), isNewUser: true};
});

route('GET', '/api/users/me', (ctx): User => toUser(requireUser(ctx)));

route('PUT', '/api/students/me', (ctx): StudentProfile => {
  const user = requireUser(ctx, 'student');
  const s = db.students.find(s => s.userId === user.id)!;
  s.headline = optString(ctx.body.headline);
  s.bio = optString(ctx.body.bio);
  s.availability = optString(ctx.body.availability);
  if (Array.isArray(ctx.body.skillIds)) {
    const skillIds = ctx.body.skillIds.filter(id => typeof id === 'number');
    const known = new Set(db.skills.map(skill => skill.id));
    const missing = skillIds.find(id => !known.has(id));
    if (missing !== undefined) {
      throw new ApiError(404, `Skill ${missing} not found.`);
    }
    s.skillIds = skillIds;
  }
  return studentProfile(user.id);
});

route(
  'GET',
  '/api/students/me/recommendations',
  (ctx): {items: StudentRecommendation[]} => {
    const user = requireUser(ctx, 'student');
    const s = db.students.find(s => s.userId === user.id)!;
    const applied = new Set(
      db.proposals.filter(x => x.studentId === user.id).map(x => x.projectId),
    );
    const items = db.projects
      .filter(p => p.status === 'open' && p.brief && !applied.has(p.id))
      .map(p => {
        const {value, overlap, missing} = score(
          s.skillIds,
          p.brief!.suggestedSkillIds,
        );
        const reasons: string[] = [];
        if (overlap.length) {
          reasons.push(
            `Matches your ${formatList(skillsOf(overlap).map(k => k.name))} skills`,
          );
        }
        if (missing.length) {
          reasons.push(
            `A chance to grow in ${formatList(skillsOf(missing.slice(0, 2)).map(k => k.name))}`,
          );
        }
        const have = hoursPerWeek(s.availability);
        const need = hoursPerWeek(p.brief!.scope);
        if (have !== undefined && need !== undefined && have >= need) {
          reasons.push(
            `Your ${have} hrs/week covers the ~${need} hrs/week this project needs`,
          );
        }
        const recommendation: StudentRecommendation = {
          project: {
            id: p.id,
            title: p.title,
            organization: orgSummary(p.organizationId),
          },
          matchScore: value,
          reasons,
        };
        return {recommendation, hasOverlap: overlap.length > 0};
      })
      .filter(x => x.hasOverlap)
      .map(x => x.recommendation)
      .sort((a, b) => b.matchScore - a.matchScore);
    return {items};
  },
);

route('GET', '/api/students/me/proposals', ctx => {
  const user = requireUser(ctx, 'student');
  return {
    items: db.proposals
      .filter(x => x.studentId === user.id)
      .map(x => ({
        ...proposalView(x),
        project: {id: x.projectId, title: findProject(x.projectId).title},
      })),
  };
});

route('GET', '/api/students/:id', ({params}) =>
  studentProfile(Number(params[0])),
);

route('PUT', '/api/organizations/me', (ctx): Organization => {
  const user = requireUser(ctx, 'organization');
  const o = db.organizations.find(o => o.userId === user.id)!;
  o.companyName = requireString(ctx.body, 'companyName', 'Organization name');
  o.description = optString(ctx.body.description);
  const website = optString(ctx.body.website);
  if (website && !/^https?:\/\/[^\s]+$/.test(website)) {
    throw new ApiError(400, 'Please enter a valid website URL.');
  }
  o.website = website;
  return {
    id: user.id,
    companyName: o.companyName,
    description: o.description,
    website: o.website,
  };
});

route('GET', '/api/organizations/me/projects', ctx => {
  const user = requireUser(ctx, 'organization');
  return {
    items: db.projects
      .filter(p => p.organizationId === user.id)
      .map(p => projectSummary(p))
      .reverse(),
  };
});

route('GET', '/api/organizations/:id', ({params}): Organization => {
  const id = Number(params[0]);
  const o = db.organizations.find(o => o.userId === id);
  if (!o) throw new ApiError(404, 'Organization not found.');
  return {
    id,
    companyName: o.companyName,
    description: o.description,
    website: o.website,
    totalProjectsPosted: db.projects.filter(p => p.organizationId === id)
      .length,
  };
});

route(
  'GET',
  '/api/skills',
  ({query}): Skill[] => {
    const q = (query.get('q') ?? '').trim().toLowerCase();
    return db.skills.filter(s => s.name.toLowerCase().includes(q)).slice(0, 10);
  },
  120,
);

route('POST', '/api/projects', (ctx): Project => {
  const user = requireUser(ctx, 'organization');
  const deadline = optString(ctx.body.deadline);
  if (deadline && !/^\d{4}-\d{2}-\d{2}$/.test(deadline)) {
    throw new ApiError(400, 'Please use a valid date in YYYY-MM-DD format.');
  }
  const p = {
    id: db.nextId++,
    organizationId: user.id,
    title: requireString(ctx.body, 'title', 'Title'),
    description: requireString(ctx.body, 'description', 'Description'),
    deadline,
    category: optString(ctx.body.category),
    status: 'open' as const,
    createdAt: new Date().toISOString(),
  };
  db.projects.push(p);
  return projectDetail(p);
});

route('GET', '/api/projects', () => ({
  items: db.projects
    .filter(p => p.status === 'open')
    .map(p => projectSummary(p))
    .reverse(),
}));

route('GET', '/api/projects/:id', ({params}) =>
  projectDetail(findProject(Number(params[0]))),
);

route(
  'POST',
  '/api/projects/:id/analyze',
  (ctx): ProjectBrief => {
    const p = requireOwner(ctx, Number(ctx.params[0]));
    p.brief = analyzeDescription(p);
    return toBrief(p.brief);
  },
  1800,
);

route(
  'GET',
  '/api/projects/:id/recommendations',
  (ctx): ProjectRecommendations => {
    const p = requireOwner(ctx, Number(ctx.params[0]));
    const want = p.brief?.suggestedSkillIds ?? [];
    const students = db.students
      .map(s => {
        const {value, overlap} = score(s.skillIds, want);
        const reasons: string[] = [];
        if (overlap.length) {
          reasons.push(
            `Has ${formatList(skillsOf(overlap).map(k => k.name))} skills`,
          );
        }
        if (s.availability) reasons.push(`Available ${s.availability}`);
        if (s.rating) {
          reasons.push(`Rated ${s.rating.toFixed(1)} by past project partners`);
        }
        return {student: studentSummary(s.userId), matchScore: value, reasons};
      })
      .filter(x => x.matchScore > 0.2)
      .sort((a, b) => b.matchScore - a.matchScore);
    const mentors = db.mentors
      .map(m => {
        const {value, overlap} = score(m.skillIds, want);
        const u = db.users.find(u => u.id === m.userId)!;
        const reasons = overlap.length
          ? [
              `Professional experience in ${formatList(skillsOf(overlap).map(k => k.name))}`,
            ]
          : [];
        return {
          mentor: {id: m.userId, name: u.name, headline: m.headline},
          matchScore: value,
          reasons,
        };
      })
      .filter(x => x.reasons.length);
    return {students, mentors};
  },
  900,
);

route('POST', '/api/projects/:id/proposals', (ctx): Proposal => {
  const user = requireUser(ctx, 'student');
  const p = findProject(Number(ctx.params[0]));
  if (p.status !== 'open') {
    throw new ApiError(
      409,
      'This project is no longer accepting applications.',
    );
  }
  if (db.proposals.some(x => x.projectId === p.id && x.studentId === user.id)) {
    throw new ApiError(409, "You've already applied to this project.");
  }
  const x = {
    id: db.nextId++,
    projectId: p.id,
    studentId: user.id,
    coverLetter: requireString(ctx.body, 'coverLetter', 'Cover letter'),
    status: 'pending' as const,
    createdAt: new Date().toISOString(),
  };
  db.proposals.push(x);
  return proposalView(x);
});

route('GET', '/api/projects/:id/proposals', (ctx): Proposal[] => {
  const p = requireOwner(ctx, Number(ctx.params[0]));
  return db.proposals
    .filter(x => x.projectId === p.id)
    .map(x => proposalView(x));
});

route('POST', '/api/proposals/:id/accept', ctx => {
  const x = db.proposals.find(x => x.id === Number(ctx.params[0]));
  if (!x) throw new ApiError(404, 'Application not found.');
  const p = requireOwner(ctx, x.projectId);
  if (p.status !== 'open') {
    throw new ApiError(
      409,
      'A student has already been selected for this project.',
    );
  }
  x.status = 'accepted';
  p.status = 'in_progress';
  for (const other of db.proposals) {
    if (
      other.projectId === p.id &&
      other.id !== x.id &&
      other.status === 'pending'
    ) {
      other.status = 'rejected';
    }
  }
  return {
    id: x.id,
    status: x.status,
    projectId: p.id,
    student: studentSummary(x.studentId),
  };
});

route('POST', '/api/projects/:id/mentors', ctx => {
  const user = requireUser(ctx, 'mentor');
  const p = findProject(Number(ctx.params[0]));
  if (
    !db.projectMentors.some(m => m.projectId === p.id && m.mentorId === user.id)
  ) {
    db.projectMentors.push({
      projectId: p.id,
      mentorId: user.id,
      note: optString(ctx.body.note),
    });
  }
  return {
    projectId: p.id,
    mentor: {id: user.id, name: user.name},
    status: 'joined',
  };
});

route('GET', '/api/projects/:id/team', ({params}): Team => {
  const p = findProject(Number(params[0]));
  const accepted = db.proposals.find(
    x => x.projectId === p.id && x.status === 'accepted',
  );
  const mentorLink = db.projectMentors.find(m => m.projectId === p.id);
  const mentorUser =
    mentorLink && db.users.find(u => u.id === mentorLink.mentorId);
  return {
    project: {id: p.id, title: p.title, status: p.status},
    organization: orgSummary(p.organizationId),
    student: accepted && studentSummary(accepted.studentId),
    mentor: mentorUser && {
      id: mentorUser.id,
      name: mentorUser.name,
      headline: db.mentors.find(m => m.userId === mentorUser.id)?.headline,
    },
  };
});
