// Mirrors the API Reference in /ARCHITECTURE.md. Keep in sync with the backend.

export type Role = 'organization' | 'student' | 'mentor'

export interface User {
  id: number
  role: Role
  email: string
  name: string
  createdAt?: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface RegisterRequest {
  role: Role
  email: string
  password: string
  name: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface Skill {
  id: number
  name: string
}

export interface StudentSummary {
  id: number
  name: string
  headline?: string
}

export interface StudentProfile extends StudentSummary {
  bio?: string
  availability?: string
  rating?: number
  skills: Skill[]
}

export interface UpdateStudentProfileRequest {
  headline: string
  bio: string
  availability: string
  skillIds: number[]
}

export interface MentorSummary {
  id: number
  name: string
  headline?: string
}

export interface OrganizationSummary {
  id: number
  companyName: string
}

export interface Organization extends OrganizationSummary {
  description?: string
  website?: string
  totalProjectsPosted?: number
}

export type ProjectStatus = 'open' | 'in_progress' | 'completed'

export interface Milestone {
  title: string
  dueDate?: string
}

export interface ProjectBrief {
  objectives: string[]
  deliverables: string[]
  suggestedSkills: Skill[]
  milestones: Milestone[]
  scope?: string
}

export interface ProjectSummary {
  id: number
  title: string
  description: string
  deadline?: string
  category?: string
  status: ProjectStatus
  organization: OrganizationSummary
  proposalCount?: number
}

export interface Project extends ProjectSummary {
  brief?: ProjectBrief
}

export interface CreateProjectRequest {
  title: string
  description: string
  deadline?: string
  category?: string
}

export interface StudentRecommendation {
  project: Pick<ProjectSummary, 'id' | 'title' | 'organization'>
  matchScore: number
  reasons: string[]
}

export interface ProjectRecommendations {
  students: { student: StudentSummary; matchScore: number; reasons: string[] }[]
  mentors: { mentor: MentorSummary; matchScore: number; reasons: string[] }[]
}

export type ProposalStatus = 'pending' | 'accepted' | 'rejected'

export interface Proposal {
  id: number
  coverLetter: string
  status: ProposalStatus
  student: StudentSummary & { rating?: number; skills?: Skill[] }
  createdAt: string
}

export interface AcceptProposalResponse {
  id: number
  status: ProposalStatus
  projectId: number
  student: StudentSummary
}

export interface Team {
  project: Pick<ProjectSummary, 'id' | 'title' | 'status'>
  organization: OrganizationSummary
  student?: StudentSummary
  mentor?: MentorSummary
}

export interface Paginated<T> {
  items: T[]
}
