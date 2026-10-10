"""Pydantic models for the AI module's inputs and outputs.

Internal to the AI module; the HTTP layer converts them to the API's JSON.
"""

import pydantic


class Skill(pydantic.BaseModel):
    """A catalog skill. Frozen so it can be put in sets."""

    model_config = pydantic.ConfigDict(frozen=True)

    id: int
    name: str


class Milestone(pydantic.BaseModel):
    """A checkpoint in a brief; `due_date` is an ISO date ("YYYY-MM-DD")."""

    title: str
    due_date: str | None = None


class Brief(pydantic.BaseModel):
    """A project description structured into a brief."""

    objectives: list[str]
    deliverables: list[str]
    suggested_skills: list[Skill]
    milestones: list[Milestone]
    scope: str


class StudentProfile(pydantic.BaseModel):
    """A student, as the scorer and the reasons prompt see them.

    `interests` and `learning_goals` are optional; scoring falls back to the
    bio when they are empty.
    """

    id: int
    name: str
    headline: str | None = None
    bio: str | None = None
    availability: str | None = None
    rating: float | None = None
    skills: list[Skill] = pydantic.Field(default_factory=list)
    interests: list[str] = pydantic.Field(default_factory=list)
    learning_goals: str | None = None


class MentorProfile(pydantic.BaseModel):
    """A mentor, as the scorer and the reasons prompt see them."""

    id: int
    name: str
    headline: str | None = None
    bio: str | None = None
    availability: str | None = None
    skills: list[Skill] = pydantic.Field(default_factory=list)


class ProjectRef(pydantic.BaseModel):
    """A reference to a project in a student's recommendations."""

    id: int
    title: str
    organization_name: str | None = None


class _Recommendation(pydantic.BaseModel):
    match_score: float = pydantic.Field(ge=0.0, le=1.0)
    reasons: list[str]


class StudentRecommendation(_Recommendation):
    """A student recommended for a project, with a score and reasons."""

    student: StudentProfile


class MentorRecommendation(_Recommendation):
    """A mentor recommended for a project, with a score and reasons."""

    mentor: MentorProfile


class ProjectRecommendation(_Recommendation):
    """A project recommended to a student, with a score and reasons."""

    project: ProjectRef
