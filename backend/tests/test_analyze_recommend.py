"""Analyze + recommend tests, with Bedrock stubbed so no network/credentials needed."""

from unittest.mock import patch

from app.ai.analyze import analyze_project
from app.ai.recommend import (
    recommend_mentors,
    recommend_projects_for_student,
    recommend_students,
)
from app.ai.schemas import ProjectRef


FAKE_BRIEF_JSON = {
    "objectives": ["Enable one-click volunteer sign-up", "Reduce coordinator phone time"],
    "deliverables": ["Public sign-up page", "Admin roster view"],
    "suggested_skills": ["React", "TypeScript", "Python"],
    "milestones": [
        {"title": "Design sign-up flow", "due_date": "2026-10-24"},
        {"title": "MVP review", "due_date": "2026-11-14"},
    ],
    "scope": "3-month project, ~10 hrs/week",
}

FAKE_REASONS = {"reasons": ["Matches required React skills", "Available 10 hrs/week"]}


def test_analyze_project_parses_response(catalog):
    with patch("app.ai.analyze.invoke_json", return_value=FAKE_BRIEF_JSON):
        brief = analyze_project(
            title="Volunteer Scheduling App",
            description="raw text",
            skills_catalog=catalog,
            deadline="2026-12-01",
        )
    assert brief.objectives[0].startswith("Enable")
    skill_names = {s.name for s in brief.suggested_skills}
    assert "React" in skill_names
    assert "Python" in skill_names
    assert len(brief.milestones) == 2
    assert brief.milestones[0].due_date == "2026-10-24"


def test_analyze_falls_back_on_bedrock_error(catalog):
    from app.ai.bedrock import BedrockError

    with patch("app.ai.analyze.invoke_json", side_effect=BedrockError("boom")):
        brief = analyze_project("x", "y", catalog, deadline="2026-12-01")
    assert brief.objectives  # non-empty fallback
    assert brief.milestones  # default milestones
    assert brief.suggested_skills == []


def test_recommend_students_top_n(catalog, students):
    with patch("app.ai.analyze.invoke_json", return_value=FAKE_BRIEF_JSON), patch(
        "app.ai.recommend.invoke_json", return_value=FAKE_REASONS
    ):
        brief = analyze_project("x", "y", catalog)
        recs = recommend_students(brief, students, top_n=3)
    assert len(recs) == 3
    scores = [r.match_score for r in recs]
    assert scores == sorted(scores, reverse=True)
    assert all(0.0 <= s <= 1.0 for s in scores)
    assert all(r.reasons for r in recs)


def test_recommend_mentors(catalog, mentors):
    with patch("app.ai.analyze.invoke_json", return_value=FAKE_BRIEF_JSON), patch(
        "app.ai.recommend.invoke_json", return_value=FAKE_REASONS
    ):
        brief = analyze_project("x", "y", catalog)
        recs = recommend_mentors(brief, mentors, top_n=2)
    assert len(recs) == 2
    assert all(r.reasons for r in recs)


def test_recommend_projects_for_student(catalog, students, seed):
    ana = next(s for s in students if s.name == "Ana Reyes")
    with patch("app.ai.analyze.invoke_json", return_value=FAKE_BRIEF_JSON), patch(
        "app.ai.recommend.invoke_json", return_value=FAKE_REASONS
    ):
        pairs = []
        for p in seed["projects"]:
            brief = analyze_project(p["title"], p["description"], catalog, deadline=p["deadline"])
            pairs.append(
                (ProjectRef(id=p["id"], title=p["title"], organization_name=p["organization_name"]), brief)
            )
        recs = recommend_projects_for_student(ana, pairs, top_n=3)
    assert len(recs) == 3
    assert recs[0].match_score >= recs[-1].match_score


def test_deterministic_fallback_when_reasons_fail(catalog, students):
    from app.ai.bedrock import BedrockError

    with patch("app.ai.analyze.invoke_json", return_value=FAKE_BRIEF_JSON), patch(
        "app.ai.recommend.invoke_json", side_effect=BedrockError("down")
    ):
        brief = analyze_project("x", "y", catalog)
        recs = recommend_students(brief, students, top_n=2)
    for r in recs:
        assert r.reasons  # deterministic fallback kicks in
