"""Analyze and recommend tests, with Bedrock stubbed (no network needed)."""

from unittest import mock

from app.ai import analyze
from app.ai import bedrock
from app.ai import recommend
from app.ai import schemas

FAKE_BRIEF_JSON = {
    "objectives": [
        "Enable one-click volunteer sign-up",
        "Reduce coordinator phone time",
    ],
    "deliverables": ["Public sign-up page", "Admin roster view"],
    "suggested_skills": ["React", "TypeScript", "Python"],
    "milestones": [
        {"title": "Design sign-up flow", "due_date": "2026-10-24"},
        {"title": "MVP review", "due_date": "2026-11-14"},
    ],
    "scope": "3-month project, ~10 hrs/week",
}

FAKE_REASONS = {
    "reasons": ["Matches required React skills", "Available 10 hrs/week"]
}

_INVOKE_JSON = "app.ai.bedrock.invoke_json"


def _fake_brief(catalog, title="x", description="y", **kwargs):
    with mock.patch(_INVOKE_JSON, return_value=FAKE_BRIEF_JSON):
        return analyze.analyze_project(title, description, catalog, **kwargs)


def test_analyze_project_parses_response(catalog):
    with mock.patch(_INVOKE_JSON, return_value=FAKE_BRIEF_JSON):
        brief = analyze.analyze_project(
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
    with mock.patch(_INVOKE_JSON, side_effect=bedrock.BedrockError("boom")):
        brief = analyze.analyze_project(
            "x", "y", catalog, deadline="2026-12-01"
        )
    assert brief.objectives  # Non-empty fallback.
    assert brief.milestones  # Default milestones.
    assert not brief.suggested_skills


def test_recommend_students_top_n(catalog, students):
    brief = _fake_brief(catalog)
    with mock.patch(_INVOKE_JSON, return_value=FAKE_REASONS):
        recs = recommend.recommend_students(brief, students, top_n=3)
    assert len(recs) == 3
    scores = [r.match_score for r in recs]
    assert scores == sorted(scores, reverse=True)
    assert all(0.0 <= s <= 1.0 for s in scores)
    assert all(r.reasons for r in recs)


def test_recommend_mentors(catalog, mentors):
    brief = _fake_brief(catalog)
    with mock.patch(_INVOKE_JSON, return_value=FAKE_REASONS):
        recs = recommend.recommend_mentors(brief, mentors, top_n=2)
    assert len(recs) == 2
    assert all(r.reasons for r in recs)


def test_recommend_projects_for_student(catalog, students, seed):
    ana = next(s for s in students if s.name == "Ana Reyes")
    pairs = []
    for p in seed["projects"]:
        ref = schemas.ProjectRef(
            id=p["id"],
            title=p["title"],
            organization_name=p["organization_name"],
        )
        brief = _fake_brief(
            catalog, p["title"], p["description"], deadline=p["deadline"]
        )
        pairs.append((ref, brief))
    with mock.patch(_INVOKE_JSON, return_value=FAKE_REASONS):
        recs = recommend.recommend_projects_for_student(ana, pairs, top_n=3)
    assert len(recs) == 3
    assert recs[0].match_score >= recs[-1].match_score


def test_deterministic_fallback_when_reasons_fail(catalog, students):
    brief = _fake_brief(catalog)
    with mock.patch(_INVOKE_JSON, side_effect=bedrock.BedrockError("down")):
        recs = recommend.recommend_students(brief, students, top_n=2)
    for r in recs:
        assert r.reasons  # The deterministic fallback kicks in.
