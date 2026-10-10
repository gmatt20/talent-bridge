// Mirrors the API Reference in /ARCHITECTURE.md. Keep in sync with the backend.

/** Who an account belongs to. */
export type Role = 'organization' | 'student' | 'mentor';

/** A signed-in account. */
export interface User {
  id: number;
  role: Role;
  email: string;
  name: string;
  createdAt?: string;
}

/** Returned by register and login: the session token and its user. */
export interface AuthResponse {
  token: string;
  user: User;
}

/** Body of `POST /api/auth/register`. */
export interface RegisterRequest {
  role: Role;
  email: string;
  password: string;
  name: string;
}

/** Body of `POST /api/auth/login`. */
export interface LoginRequest {
  email: string;
  password: string;
}

/** A skill from the shared catalog, used to tag students and projects. */
export interface Skill {
  id: number;
  name: string;
}

/** The short form of a student, shown in lists. */
export interface StudentSummary {
  id: number;
  name: string;
  headline?: string;
}

/** A student's full public profile. */
export interface StudentProfile extends StudentSummary {
  bio?: string;
  availability?: string;
  rating?: number;
  skills: Skill[];
}

/** Body of `PUT /api/students/me`. */
export interface UpdateStudentProfileRequest {
  headline: string;
  bio: string;
  availability: string;
  skillIds: number[];
}

/** The short form of a mentor, shown in recommendations. */
export interface MentorSummary {
  id: number;
  name: string;
  headline?: string;
}

/** The short form of an organization, shown on projects. */
export interface OrganizationSummary {
  id: number;
  companyName: string;
}

/** An organization's public profile. */
export interface Organization extends OrganizationSummary {
  description?: string;
  website?: string;
  totalProjectsPosted?: number;
}

/** Where a project is in its lifecycle. */
export type ProjectStatus = 'open' | 'in_progress' | 'completed';

/** A checkpoint in a project brief. */
export interface Milestone {
  title: string;
  dueDate?: string;
}

/** The AI-structured brief for a project. */
export interface ProjectBrief {
  objectives: string[];
  deliverables: string[];
  suggestedSkills: Skill[];
  milestones: Milestone[];
  scope?: string;
}

/** A project as shown in lists. */
export interface ProjectSummary {
  id: number;
  title: string;
  description: string;
  deadline?: string;
  category?: string;
  status: ProjectStatus;
  organization: OrganizationSummary;
  proposalCount?: number;
}

/** A project with its AI brief, once analyzed. */
export interface Project extends ProjectSummary {
  brief?: ProjectBrief;
}

/** Body of `POST /api/projects`. */
export interface CreateProjectRequest {
  title: string;
  description: string;
  deadline?: string;
  category?: string;
}

/** A project the AI recommends to a student, with reasons. */
export interface StudentRecommendation {
  project: Pick<ProjectSummary, 'id' | 'title' | 'organization'>;
  matchScore: number;
  reasons: string[];
}

/** The students and mentors the AI recommends for a project. */
export interface ProjectRecommendations {
  students: {student: StudentSummary; matchScore: number; reasons: string[]}[];
  mentors: {mentor: MentorSummary; matchScore: number; reasons: string[]}[];
}

/** Where an application stands. */
export type ProposalStatus = 'pending' | 'accepted' | 'rejected';

/** A student's application to a project. */
export interface Proposal {
  id: number;
  coverLetter: string;
  status: ProposalStatus;
  student: StudentSummary & {rating?: number; skills?: Skill[]};
  createdAt: string;
}

/** Returned when an organization accepts an application. */
export interface AcceptProposalResponse {
  id: number;
  status: ProposalStatus;
  projectId: number;
  student: StudentSummary;
}

/** The organization, student and mentor working on a project. */
export interface Team {
  project: Pick<ProjectSummary, 'id' | 'title' | 'status'>;
  organization: OrganizationSummary;
  student?: StudentSummary;
  mentor?: MentorSummary;
}

/** A list response. */
export interface Paginated<T> {
  items: T[];
}
