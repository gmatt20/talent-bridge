"""Recommenders: deterministic scoring + Bedrock-generated rationales."""

from __future__ import annotations

import logging
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from .bedrock import BedrockError, invoke_json
from .schemas import (
    Brief,
    MentorProfile,
    MentorRecommendation,
    ProjectRecommendation,
    ProjectRef,
    StudentProfile,
    StudentRecommendation,
)
from .score import score_mentor, score_student

log = logging.getLogger(__name__)

_SYS_STUDENT = (Path(__file__).parent / "prompts" / "reasons_student.txt").read_text()
_SYS_MENTOR = (Path(__file__).parent / "prompts" / "reasons_mentor.txt").read_text()

DEFAULT_STUDENTS_TOP_N = 5
DEFAULT_MENTORS_TOP_N = 3
DEFAULT_PROJECTS_TOP_N = 10
_PARALLEL_WORKERS = 5


def recommend_students(
    brief: Brief,
    students: list[StudentProfile],
    *,
    top_n: int = DEFAULT_STUDENTS_TOP_N,
) -> list[StudentRecommendation]:
    scored = sorted(
        ((score_student(brief, s), s) for s in students),
        key=lambda x: x[0],
        reverse=True,
    )[:top_n]
    reasons_list = _parallel_reasons(
        [(brief, s) for _, s in scored], _student_reasons
    )
    return [
        StudentRecommendation(student=s, match_score=sc, reasons=r)
        for (sc, s), r in zip(scored, reasons_list)
    ]


def recommend_mentors(
    brief: Brief,
    mentors: list[MentorProfile],
    *,
    top_n: int = DEFAULT_MENTORS_TOP_N,
) -> list[MentorRecommendation]:
    scored = sorted(
        ((score_mentor(brief, m), m) for m in mentors),
        key=lambda x: x[0],
        reverse=True,
    )[:top_n]
    reasons_list = _parallel_reasons(
        [(brief, m) for _, m in scored], _mentor_reasons
    )
    return [
        MentorRecommendation(mentor=m, match_score=sc, reasons=r)
        for (sc, m), r in zip(scored, reasons_list)
    ]


def recommend_projects_for_student(
    student: StudentProfile,
    projects: list[tuple[ProjectRef, Brief]],
    *,
    top_n: int = DEFAULT_PROJECTS_TOP_N,
) -> list[ProjectRecommendation]:
    """Rank projects for a given student. Expects each project paired with its brief.

    Projects without a brief (not yet analyzed) are skipped — the UI should
    only surface analyzed projects on the student dashboard.
    """
    scored = sorted(
        ((score_student(brief, student), ref, brief) for ref, brief in projects),
        key=lambda x: x[0],
        reverse=True,
    )[:top_n]
    reasons_list = _parallel_reasons(
        [(brief, student) for _, _, brief in scored], _student_reasons
    )
    return [
        ProjectRecommendation(project=ref, match_score=sc, reasons=r)
        for (sc, ref, _), r in zip(scored, reasons_list)
    ]


# --- rationale generation (Bedrock) ----------------------------------------


def _student_reasons(brief: Brief, student: StudentProfile) -> list[str]:
    user = (
        "Project brief:\n"
        f"  objectives: {brief.objectives}\n"
        f"  deliverables: {brief.deliverables}\n"
        f"  required_skills: {[s.name for s in brief.suggested_skills]}\n\n"
        "Student:\n"
        f"  name: {student.name}\n"
        f"  headline: {student.headline or ''}\n"
        f"  bio: {student.bio or ''}\n"
        f"  availability: {student.availability or ''}\n"
        f"  skills: {[s.name for s in student.skills]}\n"
        f"  interests: {student.interests}\n"
        f"  learning_goals: {student.learning_goals or ''}\n"
    )
    try:
        raw = invoke_json(_SYS_STUDENT, user, max_tokens=500)
        reasons = [r for r in raw.get("reasons", []) if isinstance(r, str) and r.strip()]
        return reasons[:3] or _deterministic_student_reasons(brief, student)
    except BedrockError as e:
        log.warning("student reason fallback: %s", e)
        return _deterministic_student_reasons(brief, student)


def _mentor_reasons(brief: Brief, mentor: MentorProfile) -> list[str]:
    user = (
        "Project brief:\n"
        f"  objectives: {brief.objectives}\n"
        f"  required_skills: {[s.name for s in brief.suggested_skills]}\n\n"
        "Mentor:\n"
        f"  name: {mentor.name}\n"
        f"  headline: {mentor.headline or ''}\n"
        f"  bio: {mentor.bio or ''}\n"
        f"  availability: {mentor.availability or ''}\n"
        f"  skills: {[s.name for s in mentor.skills]}\n"
    )
    try:
        raw = invoke_json(_SYS_MENTOR, user, max_tokens=400)
        reasons = [r for r in raw.get("reasons", []) if isinstance(r, str) and r.strip()]
        return reasons[:2] or _deterministic_mentor_reasons(brief, mentor)
    except BedrockError as e:
        log.warning("mentor reason fallback: %s", e)
        return _deterministic_mentor_reasons(brief, mentor)


def _deterministic_student_reasons(brief: Brief, student: StudentProfile) -> list[str]:
    required = {s.name for s in brief.suggested_skills}
    have = {s.name for s in student.skills}
    overlap = sorted(required & have)
    missing = sorted(required - have)
    reasons: list[str] = []
    if overlap:
        reasons.append(f"Matches required skills: {', '.join(overlap[:3])}.")
    if student.availability:
        reasons.append(f"Availability: {student.availability}.")
    if missing:
        reasons.append(f"Will need support on: {', '.join(missing[:2])}.")
    return reasons or ["Profile reviewed against project requirements."]


def _deterministic_mentor_reasons(brief: Brief, mentor: MentorProfile) -> list[str]:
    required = {s.name for s in brief.suggested_skills}
    have = {s.name for s in mentor.skills}
    overlap = sorted(required & have)
    reasons: list[str] = []
    if overlap:
        reasons.append(f"Mentor skills align: {', '.join(overlap[:3])}.")
    if mentor.headline:
        reasons.append(mentor.headline)
    return reasons or ["Available mentor."]


def _parallel_reasons(args, fn):
    if not args:
        return []
    with ThreadPoolExecutor(max_workers=min(_PARALLEL_WORKERS, len(args))) as ex:
        return list(ex.map(lambda a: fn(*a), args))
