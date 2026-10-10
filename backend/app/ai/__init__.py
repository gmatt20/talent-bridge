"""Talent Bridge AI module — analyze projects, score matches, recommend students and mentors."""

from .analyze import analyze_project
from .recommend import (
    recommend_students,
    recommend_mentors,
    recommend_projects_for_student,
)
from .schemas import (
    Brief,
    Milestone,
    Skill,
    StudentProfile,
    MentorProfile,
    ProjectRef,
    StudentRecommendation,
    MentorRecommendation,
    ProjectRecommendation,
)

__all__ = [
    "analyze_project",
    "recommend_students",
    "recommend_mentors",
    "recommend_projects_for_student",
    "Brief",
    "Milestone",
    "Skill",
    "StudentProfile",
    "MentorProfile",
    "ProjectRef",
    "StudentRecommendation",
    "MentorRecommendation",
    "ProjectRecommendation",
]
