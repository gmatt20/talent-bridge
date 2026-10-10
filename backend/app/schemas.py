"""HTTP-facing request/response models. Field names match ARCHITECTURE.md's
JSON contract exactly (camelCase), so the frontend's types/api.ts and these
models stay in lockstep without an alias layer.
"""

from __future__ import annotations

from pydantic import BaseModel


class Skill(BaseModel):
    id: int
    name: str


class UserOut(BaseModel):
    id: int
    role: str
    email: str
    name: str
    createdAt: str | None = None


class AuthResponse(BaseModel):
    token: str
    user: UserOut


class RegisterRequest(BaseModel):
    role: str
    email: str
    password: str
    name: str


class LoginRequest(BaseModel):
    email: str
    password: str


class StudentSummary(BaseModel):
    id: int
    name: str
    headline: str | None = None


class StudentProfileOut(StudentSummary):
    bio: str | None = None
    availability: str | None = None
    rating: float | None = None
    skills: list[Skill] = []


class UpdateStudentProfileRequest(BaseModel):
    headline: str | None = None
    bio: str | None = None
    availability: str | None = None
    skillIds: list[int] = []


class MentorSummary(BaseModel):
    id: int
    name: str
    headline: str | None = None


class OrganizationSummary(BaseModel):
    id: int
    companyName: str


class OrganizationOut(OrganizationSummary):
    description: str | None = None
    website: str | None = None
    totalProjectsPosted: int | None = None


class UpdateOrganizationRequest(BaseModel):
    companyName: str
    description: str | None = None
    website: str | None = None


class Milestone(BaseModel):
    title: str
    dueDate: str | None = None


class ProjectBriefOut(BaseModel):
    objectives: list[str]
    deliverables: list[str]
    suggestedSkills: list[Skill]
    milestones: list[Milestone]
    scope: str | None = None


class ProjectSummaryOut(BaseModel):
    id: int
    title: str
    description: str
    deadline: str | None = None
    category: str | None = None
    status: str
    organization: OrganizationSummary
    proposalCount: int | None = None


class ProjectOut(ProjectSummaryOut):
    brief: ProjectBriefOut | None = None


class CreateProjectRequest(BaseModel):
    title: str
    description: str
    deadline: str | None = None
    category: str | None = None


class ProjectRef(BaseModel):
    id: int
    title: str
    organization: OrganizationSummary


class StudentRecommendationOut(BaseModel):
    project: ProjectRef
    matchScore: float
    reasons: list[str]


class StudentRecoItem(BaseModel):
    student: StudentSummary
    matchScore: float
    reasons: list[str]


class MentorRecoItem(BaseModel):
    mentor: MentorSummary
    matchScore: float
    reasons: list[str]


class ProjectRecommendationsOut(BaseModel):
    students: list[StudentRecoItem]
    mentors: list[MentorRecoItem]


class ProposalStudent(StudentSummary):
    rating: float | None = None
    skills: list[Skill] = []


class ProposalOut(BaseModel):
    id: int
    coverLetter: str
    status: str
    student: ProposalStudent
    createdAt: str


class CreateProposalRequest(BaseModel):
    coverLetter: str


class AcceptProposalResponseOut(BaseModel):
    id: int
    status: str
    projectId: int
    student: StudentSummary


class JoinMentorRequest(BaseModel):
    note: str | None = None


class JoinMentorResponseOut(BaseModel):
    projectId: int
    mentor: MentorSummary
    status: str


class TeamProjectRef(BaseModel):
    id: int
    title: str
    status: str


class TeamOut(BaseModel):
    project: TeamProjectRef
    organization: OrganizationSummary
    student: StudentSummary | None = None
    mentor: MentorSummary | None = None
