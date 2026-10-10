"""HTTP request and response models.

Fields are snake_case in Python and camelCase on the wire, matching the JSON
contract in ARCHITECTURE.md and the frontend's `types/api.ts`.
"""

from typing import Any

import pydantic
from pydantic import alias_generators


def _empty_list() -> Any:
    """A list field defaulting to a new empty list, documented as `[]`."""
    return pydantic.Field(
        default_factory=list, json_schema_extra={"default": []}
    )


class CamelModel(pydantic.BaseModel):
    """Base for API models: snake_case attributes, camelCase JSON keys."""

    model_config = pydantic.ConfigDict(
        alias_generator=alias_generators.to_camel
    )


class Skill(CamelModel):
    """A skill from the shared catalog."""

    id: int
    name: str


class UserOut(CamelModel):
    """A signed-in account."""

    id: int
    role: str
    email: str
    name: str
    created_at: str | None = None


class AuthResponse(CamelModel):
    """Returned by register and login: a session token and its user."""

    token: str
    user: UserOut


class RegisterRequest(CamelModel):
    """Body of `POST /api/auth/register`."""

    role: str
    email: str
    password_hash: str
    name: str


class LoginRequest(CamelModel):
    """Body of `POST /api/auth/login`."""

    email: str
    password_hash: str


class StudentSummary(CamelModel):
    """The short form of a student, shown in lists."""

    id: int
    name: str
    headline: str | None = None


class StudentProfileOut(StudentSummary):
    """A student's full public profile."""

    bio: str | None = None
    availability: str | None = None
    rating: float | None = None
    skills: list[Skill] = _empty_list()


class UpdateStudentProfileRequest(CamelModel):
    """Body of `PUT /api/students/me`."""

    headline: str | None = None
    bio: str | None = None
    availability: str | None = None
    skill_ids: list[int] = _empty_list()


class MentorSummary(CamelModel):
    """The short form of a mentor, shown in recommendations."""

    id: int
    name: str
    headline: str | None = None


class OrganizationSummary(CamelModel):
    """The short form of an organization, shown on projects."""

    id: int
    company_name: str


class OrganizationOut(OrganizationSummary):
    """An organization's public profile."""

    description: str | None = None
    website: str | None = None
    total_projects_posted: int | None = None


class UpdateOrganizationRequest(CamelModel):
    """Body of `PUT /api/organizations/me`."""

    company_name: str
    description: str | None = None
    website: str | None = None


class Milestone(CamelModel):
    """A checkpoint in a project brief."""

    title: str
    due_date: str | None = None


class ProjectBriefOut(CamelModel):
    """The AI-structured brief for a project."""

    objectives: list[str]
    deliverables: list[str]
    suggested_skills: list[Skill]
    milestones: list[Milestone]
    scope: str | None = None


class ProjectSummaryOut(CamelModel):
    """A project as shown in lists."""

    id: int
    title: str
    description: str
    deadline: str | None = None
    category: str | None = None
    status: str
    organization: OrganizationSummary
    proposal_count: int | None = None


class ProjectOut(ProjectSummaryOut):
    """A project with its AI brief, once analyzed."""

    brief: ProjectBriefOut | None = None


class CreateProjectRequest(CamelModel):
    """Body of `POST /api/projects`."""

    title: str
    description: str
    deadline: str | None = None
    category: str | None = None


class ProjectRef(CamelModel):
    """A reference to a project, shown in a student's recommendations."""

    id: int
    title: str
    organization: OrganizationSummary


class StudentRecommendationOut(CamelModel):
    """A project the AI recommends to a student, with reasons."""

    project: ProjectRef
    match_score: float
    reasons: list[str]


class StudentRecoItem(CamelModel):
    """A student the AI recommends for a project, with reasons."""

    student: StudentSummary
    match_score: float
    reasons: list[str]


class MentorRecoItem(CamelModel):
    """A mentor the AI recommends for a project, with reasons."""

    mentor: MentorSummary
    match_score: float
    reasons: list[str]


class ProjectRecommendationsOut(CamelModel):
    """The students and mentors the AI recommends for a project."""

    students: list[StudentRecoItem]
    mentors: list[MentorRecoItem]


class ProposalStudent(StudentSummary):
    """The applying student, as shown on an application."""

    rating: float | None = None
    skills: list[Skill] = _empty_list()


class ProposalOut(CamelModel):
    """A student's application to a project."""

    id: int
    cover_letter: str
    status: str
    student: ProposalStudent
    created_at: str


class CreateProposalRequest(CamelModel):
    """Body of `POST /api/projects/{project_id}/proposals`."""

    cover_letter: str


class AcceptProposalResponseOut(CamelModel):
    """Returned when an organization accepts an application."""

    id: int
    status: str
    project_id: int
    student: StudentSummary


class JoinMentorRequest(CamelModel):
    """Body of `POST /api/projects/{project_id}/mentors`."""

    note: str | None = None


class JoinMentorResponseOut(CamelModel):
    """Returned when a mentor joins a project."""

    project_id: int
    mentor: MentorSummary
    status: str


class TeamProjectRef(CamelModel):
    """The project a team is working on."""

    id: int
    title: str
    status: str


class TeamOut(CamelModel):
    """The organization, student and mentor working on a project."""

    project: TeamProjectRef
    organization: OrganizationSummary
    student: StudentSummary | None = None
    mentor: MentorSummary | None = None
