"""Deterministic scoring. No LLM calls here — fast, cheap, testable."""

from __future__ import annotations

import re

from .schemas import Brief, MentorProfile, StudentProfile

_HOURS_RE = re.compile(r"(\d+)\s*(?:hrs?|hours?)\s*/\s*(?:week|wk)", re.IGNORECASE)


def _hours_per_week(text: str | None) -> float | None:
    if not text:
        return None
    m = _HOURS_RE.search(text)
    return float(m.group(1)) if m else None


def _skill_overlap(required: set[int], have: set[int]) -> float:
    if not required:
        return 0.5
    return len(required & have) / len(required)


def score_student(brief: Brief, student: StudentProfile) -> float:
    """0.0–1.0. Weights: 70% skill overlap, 20% availability, 10% rating."""
    required = {s.id for s in brief.suggested_skills}
    have = {s.id for s in student.skills}
    skill_component = _skill_overlap(required, have)

    hrs = _hours_per_week(student.availability)
    if hrs is None:
        avail_component = 0.5
    elif hrs >= 10:
        avail_component = 1.0
    elif hrs >= 5:
        avail_component = 0.7
    else:
        avail_component = 0.4

    # Rating is a stored column but may be unset in MVP; treat missing as neutral.
    rating_component = (student.rating or 4.0) / 5.0

    return round(
        0.70 * skill_component + 0.20 * avail_component + 0.10 * rating_component,
        3,
    )


def score_mentor(brief: Brief, mentor: MentorProfile) -> float:
    """0.0–1.0. Weights: 75% skill overlap, 25% availability. No rating field for mentors."""
    required = {s.id for s in brief.suggested_skills}
    have = {s.id for s in mentor.skills}
    skill_component = _skill_overlap(required, have)

    hrs = _hours_per_week(mentor.availability)
    if hrs is None:
        avail_component = 0.5
    elif hrs >= 4:
        avail_component = 1.0
    else:
        avail_component = 0.6

    return round(0.75 * skill_component + 0.25 * avail_component, 3)
