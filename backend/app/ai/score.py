"""Deterministic scoring. No LLM calls here: fast, cheap, testable."""

import re

from app.ai import schemas

_HOURS_RE = re.compile(
    r"(\d+)\s*(?:hrs?|hours?)\s*/\s*(?:week|wk)", re.IGNORECASE
)


def _hours_per_week(text: str | None) -> float | None:
    if not text:
        return None
    m = _HOURS_RE.search(text)
    return float(m.group(1)) if m else None


def _skill_overlap(required: set[int], have: set[int]) -> float:
    if not required:
        return 0.5
    return len(required & have) / len(required)


def score_student(
    brief: schemas.Brief, student: schemas.StudentProfile
) -> float:
    """Scores a student for a brief from 0.0 to 1.0.

    Weights: 70% skill overlap, 20% availability, 10% rating.
    """
    required = {s.id for s in brief.suggested_skills}
    have = {s.id for s in student.skills}
    skill_component = _skill_overlap(required, have)

    hours = _hours_per_week(student.availability)
    if hours is None:
        avail_component = 0.5
    elif hours >= 10:
        avail_component = 1.0
    elif hours >= 5:
        avail_component = 0.7
    else:
        avail_component = 0.4

    # Rating is a stored column but may be unset in the MVP; treat missing as
    # neutral.
    rating_component = (student.rating or 4.0) / 5.0

    return round(
        0.70 * skill_component
        + 0.20 * avail_component
        + 0.10 * rating_component,
        3,
    )


def score_mentor(brief: schemas.Brief, mentor: schemas.MentorProfile) -> float:
    """Scores a mentor for a brief from 0.0 to 1.0.

    Weights: 75% skill overlap, 25% availability. Mentors have no rating.
    """
    required = {s.id for s in brief.suggested_skills}
    have = {s.id for s in mentor.skills}
    skill_component = _skill_overlap(required, have)

    hours = _hours_per_week(mentor.availability)
    if hours is None:
        avail_component = 0.5
    elif hours >= 4:
        avail_component = 1.0
    else:
        avail_component = 0.6

    return round(0.75 * skill_component + 0.25 * avail_component, 3)
