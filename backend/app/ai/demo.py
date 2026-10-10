"""Runs an end-to-end AI flow against the seed data. Needs live Bedrock access.

Usage:
    uv run python -m app.ai.demo

Prerequisite: `aws login --profile AsherC` so Bedrock calls can authenticate.
"""

import json
import os
import pathlib

from app.ai import analyze
from app.ai import recommend
from app.ai import schemas

_SEED = pathlib.Path(__file__).parent.parent / "data" / "seed.json"


def _load_seed() -> dict:
    with _SEED.open() as f:
        return json.load(f)


def _print_reasons(reasons: list[str]) -> None:
    for reason in reasons:
        print(f"    · {reason}")


def main() -> None:
    """Analyzes the seed projects and prints the recommendations for each."""
    os.environ.setdefault("AWS_PROFILE", "AsherC")
    seed = _load_seed()
    catalog = [schemas.Skill(**s) for s in seed["skills"]]
    students = [schemas.StudentProfile(**s) for s in seed["students"]]
    mentors = [schemas.MentorProfile(**m) for m in seed["mentors"]]
    project = seed["projects"][0]

    print(f"\n=== Analyzing: {project['title']} ===")
    brief = analyze.analyze_project(
        title=project["title"],
        description=project["description"],
        skills_catalog=catalog,
        deadline=project["deadline"],
    )
    print(json.dumps(brief.model_dump(), indent=2))

    print("\n=== Top student matches ===")
    for rec in recommend.recommend_students(brief, students, top_n=3):
        print(f"  {rec.student.name} — score={rec.match_score}")
        _print_reasons(rec.reasons)

    print("\n=== Top mentor matches ===")
    for rec in recommend.recommend_mentors(brief, mentors, top_n=2):
        print(f"  {rec.mentor.name} — score={rec.match_score}")
        _print_reasons(rec.reasons)

    print("\n=== Project recommendations for Ana Reyes ===")
    ana = next(s for s in students if s.name == "Ana Reyes")
    # Build (ref, brief) pairs. For the demo, analyze all the seed projects.
    pairs = []
    for p in seed["projects"]:
        project_brief = analyze.analyze_project(
            title=p["title"],
            description=p["description"],
            skills_catalog=catalog,
            deadline=p["deadline"],
        )
        ref = schemas.ProjectRef(
            id=p["id"],
            title=p["title"],
            organization_name=p["organization_name"],
        )
        pairs.append((ref, project_brief))
    for rec in recommend.recommend_projects_for_student(ana, pairs, top_n=3):
        print(f"  {rec.project.title} — score={rec.match_score}")
        _print_reasons(rec.reasons)


if __name__ == "__main__":
    main()
