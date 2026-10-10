"""Pydantic schemas for AI I/O. Internal to the AI module — the HTTP layer uses plain dicts."""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field


class Skill(BaseModel):
    model_config = ConfigDict(frozen=True)
    id: int
    name: str


class Milestone(BaseModel):
    title: str
    due_date: str | None = None  # ISO date "YYYY-MM-DD"


class Brief(BaseModel):
    objectives: list[str]
    deliverables: list[str]
    suggested_skills: list[Skill]
    milestones: list[Milestone]
    scope: str


class StudentProfile(BaseModel):
    id: int
    name: str
    headline: str | None = None
    bio: str | None = None
    availability: str | None = None
    rating: float | None = None
    skills: list[Skill] = Field(default_factory=list)
    # Optional future-looking fields (requested from Jeff on PR #6).
    # Code gracefully falls back to parsing `bio` when these are absent.
    interests: list[str] = Field(default_factory=list)
    learning_goals: str | None = None


class MentorProfile(BaseModel):
    id: int
    name: str
    headline: str | None = None
    bio: str | None = None
    availability: str | None = None
    skills: list[Skill] = Field(default_factory=list)


class ProjectRef(BaseModel):
    id: int
    title: str
    organization_name: str | None = None


class _Recommendation(BaseModel):
    match_score: float = Field(ge=0.0, le=1.0)
    reasons: list[str]


class StudentRecommendation(_Recommendation):
    student: StudentProfile


class MentorRecommendation(_Recommendation):
    mentor: MentorProfile


class ProjectRecommendation(_Recommendation):
    project: ProjectRef
