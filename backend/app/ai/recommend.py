"""Recommenders: deterministic scoring plus Bedrock-generated rationales."""

from collections.abc import Callable, Sequence
from concurrent import futures
import logging
import pathlib
from typing import Any

from app.ai import bedrock
from app.ai import schemas
from app.ai import score

log = logging.getLogger(__name__)

_PROMPTS = pathlib.Path(__file__).parent / "prompts"
_SYS_STUDENT = (_PROMPTS / "reasons_student.txt").read_text()
_SYS_MENTOR = (_PROMPTS / "reasons_mentor.txt").read_text()

DEFAULT_STUDENTS_TOP_N = 5
DEFAULT_MENTORS_TOP_N = 3
DEFAULT_PROJECTS_TOP_N = 10
_PARALLEL_WORKERS = 5


def _first(pair: tuple[float, Any]) -> float:
    return pair[0]


def recommend_students(
    brief: schemas.Brief,
    students: list[schemas.StudentProfile],
    *,
    top_n: int = DEFAULT_STUDENTS_TOP_N,
) -> list[schemas.StudentRecommendation]:
    """Ranks students for a brief and explains the top `top_n` matches."""
    scored = sorted(
        ((score.score_student(brief, s), s) for s in students),
        key=_first,
        reverse=True,
    )[:top_n]
    reasons_list = _parallel_reasons(
        [(brief, s) for _, s in scored], _student_reasons
    )
    return [
        schemas.StudentRecommendation(
            student=student, match_score=match_score, reasons=reasons
        )
        for (match_score, student), reasons in zip(scored, reasons_list)
    ]


def recommend_mentors(
    brief: schemas.Brief,
    mentors: list[schemas.MentorProfile],
    *,
    top_n: int = DEFAULT_MENTORS_TOP_N,
) -> list[schemas.MentorRecommendation]:
    """Ranks mentors for a brief and explains the top `top_n` matches."""
    scored = sorted(
        ((score.score_mentor(brief, m), m) for m in mentors),
        key=_first,
        reverse=True,
    )[:top_n]
    reasons_list = _parallel_reasons(
        [(brief, m) for _, m in scored], _mentor_reasons
    )
    return [
        schemas.MentorRecommendation(
            mentor=mentor, match_score=match_score, reasons=reasons
        )
        for (match_score, mentor), reasons in zip(scored, reasons_list)
    ]


def recommend_projects_for_student(
    student: schemas.StudentProfile,
    projects: list[tuple[schemas.ProjectRef, schemas.Brief]],
    *,
    top_n: int = DEFAULT_PROJECTS_TOP_N,
) -> list[schemas.ProjectRecommendation]:
    """Ranks projects for a student. Each project is paired with its brief.

    Projects without a brief (not yet analyzed) should not be passed in; the
    UI only surfaces analyzed projects on the student dashboard.
    """
    scored = sorted(
        (
            (score.score_student(brief, student), ref, brief)
            for ref, brief in projects
        ),
        key=_first,
        reverse=True,
    )[:top_n]
    reasons_list = _parallel_reasons(
        [(brief, student) for _, _, brief in scored], _student_reasons
    )
    return [
        schemas.ProjectRecommendation(
            project=ref, match_score=match_score, reasons=reasons
        )
        for (match_score, ref, _), reasons in zip(scored, reasons_list)
    ]


# Rationale generation (Bedrock).


def _names(skills: list[schemas.Skill]) -> list[str]:
    return [s.name for s in skills]


def _clean_reasons(raw: dict[str, Any]) -> list[str]:
    return [
        r for r in raw.get("reasons", []) if isinstance(r, str) and r.strip()
    ]


def _student_reasons(
    brief: schemas.Brief, student: schemas.StudentProfile
) -> list[str]:
    user = (
        "Project brief:\n"
        f"  objectives: {brief.objectives}\n"
        f"  deliverables: {brief.deliverables}\n"
        f"  required_skills: {_names(brief.suggested_skills)}\n\n"
        "Student:\n"
        f"  name: {student.name}\n"
        f"  headline: {student.headline or ''}\n"
        f"  bio: {student.bio or ''}\n"
        f"  availability: {student.availability or ''}\n"
        f"  skills: {_names(student.skills)}\n"
        f"  interests: {student.interests}\n"
        f"  learning_goals: {student.learning_goals or ''}\n"
    )
    try:
        raw = bedrock.invoke_json(_SYS_STUDENT, user, max_tokens=500)
    except bedrock.BedrockError as e:
        log.warning("student reason fallback: %s", e)
        return _deterministic_student_reasons(brief, student)
    return _clean_reasons(raw)[:3] or _deterministic_student_reasons(
        brief, student
    )


def _mentor_reasons(
    brief: schemas.Brief, mentor: schemas.MentorProfile
) -> list[str]:
    user = (
        "Project brief:\n"
        f"  objectives: {brief.objectives}\n"
        f"  required_skills: {_names(brief.suggested_skills)}\n\n"
        "Mentor:\n"
        f"  name: {mentor.name}\n"
        f"  headline: {mentor.headline or ''}\n"
        f"  bio: {mentor.bio or ''}\n"
        f"  availability: {mentor.availability or ''}\n"
        f"  skills: {_names(mentor.skills)}\n"
    )
    try:
        raw = bedrock.invoke_json(_SYS_MENTOR, user, max_tokens=400)
    except bedrock.BedrockError as e:
        log.warning("mentor reason fallback: %s", e)
        return _deterministic_mentor_reasons(brief, mentor)
    return _clean_reasons(raw)[:2] or _deterministic_mentor_reasons(
        brief, mentor
    )


def _deterministic_student_reasons(
    brief: schemas.Brief, student: schemas.StudentProfile
) -> list[str]:
    required = set(_names(brief.suggested_skills))
    have = set(_names(student.skills))
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


def _deterministic_mentor_reasons(
    brief: schemas.Brief, mentor: schemas.MentorProfile
) -> list[str]:
    required = set(_names(brief.suggested_skills))
    have = set(_names(mentor.skills))
    overlap = sorted(required & have)
    reasons: list[str] = []
    if overlap:
        reasons.append(f"Mentor skills align: {', '.join(overlap[:3])}.")
    if mentor.headline:
        reasons.append(mentor.headline)
    return reasons or ["Available mentor."]


def _parallel_reasons(
    args: Sequence[tuple[Any, Any]], fn: Callable[[Any, Any], list[str]]
) -> list[list[str]]:
    """Calls `fn(*a)` for each argument pair in a thread pool, in order."""
    if not args:
        return []
    workers = min(_PARALLEL_WORKERS, len(args))
    with futures.ThreadPoolExecutor(max_workers=workers) as executor:
        return list(executor.map(lambda a: fn(*a), args))
