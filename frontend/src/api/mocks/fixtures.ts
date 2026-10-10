import type { Milestone, ProjectStatus, ProposalStatus, Role } from '@/types/api'

// Seed data for VITE_USE_MOCKS. Mirrors ARCHITECTURE.md examples; extra orgs and students are fictional.

export interface MockUser {
  id: number
  role: Role
  email: string
  password: string
  name: string
  createdAt: string
}

export interface MockDb {
  nextId: number
  users: MockUser[]
  skills: { id: number; name: string }[]
  organizations: { userId: number; companyName: string; description?: string; website?: string }[]
  students: {
    userId: number
    headline?: string
    bio?: string
    availability?: string
    rating?: number
    skillIds: number[]
  }[]
  mentors: { userId: number; headline?: string; skillIds: number[] }[]
  projects: {
    id: number
    organizationId: number
    title: string
    description: string
    deadline?: string
    category?: string
    status: ProjectStatus
    createdAt: string
    brief?: {
      objectives: string[]
      deliverables: string[]
      suggestedSkillIds: number[]
      milestones: Milestone[]
      scope?: string
    }
  }[]
  proposals: {
    id: number
    projectId: number
    studentId: number
    coverLetter: string
    status: ProposalStatus
    createdAt: string
  }[]
  projectMentors: { projectId: number; mentorId: number; note?: string }[]
}

const SKILLS = [
  'React',
  'Web Development',
  'Figma',
  'Python',
  'Data Analysis',
  'Marketing',
  'UI Design',
  'SQL',
  'Social Media',
  'Graphic Design',
  'Node.js',
  'Mobile Apps',
  'Excel',
  'Copywriting',
  'Photography',
  'Project Management',
  'Video Editing',
  'Accessibility',
]

const t = '2026-10-10T12:00:00Z'

export function seed(): MockDb {
  return {
    nextId: 100,
    skills: SKILLS.map((name, i) => ({ id: i + 1, name })),
    users: [
      { id: 1, role: 'organization', email: 'info@habitatoc.org', password: 'pass1234', name: 'Habitat for Humanity OC', createdAt: t },
      { id: 2, role: 'student', email: 'ana@uci.edu', password: 'pass1234', name: 'Ana Reyes', createdAt: t },
      { id: 3, role: 'organization', email: 'hello@lagunabean.co', password: 'pass1234', name: 'Laguna Bean Coffee Co.', createdAt: t },
      { id: 4, role: 'organization', email: 'team@sayouthartsco.org', password: 'pass1234', name: 'Santa Ana Youth Arts Collective', createdAt: t },
      { id: 5, role: 'mentor', email: 'david@example.com', password: 'pass1234', name: 'David Kim', createdAt: t },
      { id: 6, role: 'student', email: 'marcus@occ.edu', password: 'pass1234', name: 'Marcus Lee', createdAt: t },
      { id: 7, role: 'student', email: 'priya@csuf.edu', password: 'pass1234', name: 'Priya Shah', createdAt: t },
    ],
    organizations: [
      { userId: 1, companyName: 'Habitat for Humanity OC', description: 'We build affordable housing across Orange County.', website: 'https://habitatoc.org' },
      { userId: 3, companyName: 'Laguna Bean Coffee Co.', description: 'A family-run coffee shop serving the Laguna Beach community since 2012.' },
      { userId: 4, companyName: 'Santa Ana Youth Arts Collective', description: 'Free after-school art programs for teens in Santa Ana.' },
    ],
    students: [
      { userId: 2, headline: 'CS student at UCI', bio: 'Passionate about web dev and community impact.', availability: '10 hrs/week', rating: 4.8, skillIds: [1, 4, 7] },
      { userId: 6, headline: 'Business & marketing student at OCC', bio: 'I run social accounts for two student clubs and love storytelling.', availability: '8 hrs/week', rating: 4.6, skillIds: [6, 9, 14, 17] },
      { userId: 7, headline: 'Data science student at CSUF', bio: 'I like turning messy spreadsheets into clear answers.', availability: '12 hrs/week', rating: 4.9, skillIds: [4, 5, 8, 13] },
    ],
    mentors: [{ userId: 5, headline: 'Senior Engineer, 10 yrs web', skillIds: [1, 2, 11, 16] }],
    projects: [
      {
        id: 10,
        organizationId: 1,
        title: 'Volunteer Scheduling App',
        description:
          'We need a simple app so volunteers can see open build days and sign up. Currently we coordinate by phone, which takes hours each week.',
        deadline: '2026-12-01',
        category: 'Web App',
        status: 'open',
        createdAt: t,
        brief: {
          objectives: ['Let volunteers view and sign up for build days', 'Reduce phone coordination time'],
          deliverables: ['Sign-up form', 'Admin view of volunteer roster'],
          suggestedSkillIds: [1, 4, 7],
          milestones: [
            { title: 'Design sign-up flow', dueDate: '2026-10-24' },
            { title: 'Build MVP', dueDate: '2026-11-14' },
            { title: 'Pilot with one build site', dueDate: '2026-11-28' },
          ],
          scope: '3-month project, ~10 hrs/week',
        },
      },
      {
        id: 11,
        organizationId: 3,
        title: 'Grow our Instagram following',
        description:
          "We post on Instagram when we remember to. We'd like a plan and a month of posts that bring more locals in on weekday mornings.",
        deadline: '2026-11-20',
        category: 'Marketing',
        status: 'open',
        createdAt: t,
        brief: {
          objectives: ['Increase weekday morning foot traffic', 'Build a consistent posting habit'],
          deliverables: ['30-day content calendar', '12 ready-to-post graphics and captions', 'Simple metrics tracker'],
          suggestedSkillIds: [6, 9, 14, 10],
          milestones: [
            { title: 'Audit current account', dueDate: '2026-10-20' },
            { title: 'Content calendar approved', dueDate: '2026-10-31' },
            { title: 'First month published', dueDate: '2026-11-20' },
          ],
          scope: '6-week project, ~6 hrs/week',
        },
      },
      {
        id: 12,
        organizationId: 4,
        title: 'Attendance dashboard for grant reports',
        description:
          'Our grant reports need attendance numbers by program and month. Right now it lives in five different spreadsheets and takes a whole weekend to compile.',
        deadline: '2026-12-15',
        category: 'Data',
        status: 'open',
        createdAt: t,
        brief: {
          objectives: ['Combine attendance data into one source', 'Produce grant-ready monthly summaries'],
          deliverables: ['Cleaned master spreadsheet', 'Monthly attendance dashboard', 'How-to guide for staff'],
          suggestedSkillIds: [5, 13, 4, 8],
          milestones: [
            { title: 'Merge existing spreadsheets', dueDate: '2026-11-01' },
            { title: 'Dashboard draft', dueDate: '2026-11-22' },
            { title: 'Staff handoff', dueDate: '2026-12-10' },
          ],
          scope: '2-month project, ~8 hrs/week',
        },
      },
    ],
    proposals: [
      {
        id: 21,
        projectId: 10,
        studentId: 2,
        coverLetter:
          "I've built similar booking flows in class projects and would love to help Habitat OC save time.",
        status: 'pending',
        createdAt: t,
      },
    ],
    projectMentors: [],
  }
}
