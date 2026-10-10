from app.ai.schemas import Brief, Milestone, Skill
from app.ai.score import score_mentor, score_student


def _brief(skills):
    return Brief(
        objectives=["o"],
        deliverables=["d"],
        suggested_skills=skills,
        milestones=[Milestone(title="m")],
        scope="s",
    )


def test_perfect_student_match(students):
    ana = next(s for s in students if s.name == "Ana Reyes")
    brief = _brief(ana.skills)
    assert score_student(brief, ana) >= 0.9


def test_zero_skill_overlap(students):
    ana = next(s for s in students if s.name == "Ana Reyes")
    brief = _brief([Skill(id=999, name="Quantum")])
    score = score_student(brief, ana)
    assert 0.0 <= score <= 0.4  # availability and rating still contribute


def test_availability_bump(students):
    jordan = next(s for s in students if s.name == "Jordan Kim")  # 15 hrs/week
    casey = next(s for s in students if s.name == "Casey Brown")  # 4 hrs/week
    brief = _brief([Skill(id=3, name="Python")])
    assert score_student(brief, jordan) > score_student(brief, casey)


def test_mentor_score_in_range(mentors):
    david = next(m for m in mentors if m.name == "David Kim")
    brief = _brief(david.skills)
    assert 0.0 <= score_mentor(brief, david) <= 1.0
    assert score_mentor(brief, david) >= 0.9
