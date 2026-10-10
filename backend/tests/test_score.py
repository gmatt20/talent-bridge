"""Tests for app.ai.score."""

from app.ai import schemas
from app.ai import score


def _brief(skills):
    return schemas.Brief(
        objectives=["o"],
        deliverables=["d"],
        suggested_skills=skills,
        milestones=[schemas.Milestone(title="m")],
        scope="s",
    )


def test_perfect_student_match(students):
    ana = next(s for s in students if s.name == "Ana Reyes")
    brief = _brief(ana.skills)
    assert score.score_student(brief, ana) >= 0.9


def test_zero_skill_overlap(students):
    ana = next(s for s in students if s.name == "Ana Reyes")
    brief = _brief([schemas.Skill(id=999, name="Quantum")])
    result = score.score_student(brief, ana)
    assert 0.0 <= result <= 0.4  # Availability and rating still contribute.


def test_availability_bump(students):
    jordan = next(s for s in students if s.name == "Jordan Kim")  # 15 hrs/wk.
    casey = next(s for s in students if s.name == "Casey Brown")  # 4 hrs/wk.
    brief = _brief([schemas.Skill(id=3, name="Python")])
    assert score.score_student(brief, jordan) > score.score_student(
        brief, casey
    )


def test_mentor_score_in_range(mentors):
    david = next(m for m in mentors if m.name == "David Kim")
    brief = _brief(david.skills)
    assert 0.0 <= score.score_mentor(brief, david) <= 1.0
    assert score.score_mentor(brief, david) >= 0.9
