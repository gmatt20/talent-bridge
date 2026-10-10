"""Run an end-to-end AI flow against the seed data. Requires live Bedrock access.

Usage:
    uv run python -m app.ai.demo

Prereq: `aws login --profile AsherC` so Bedrock calls can authenticate.
"""

from __future__ import annotations

import json
import os
from pathlib import Path

from . import (
    analyze_project,
    recommend_mentors,
    recommend_projects_for_student,
    recommend_students,
)
from .schemas import MentorProfile, ProjectRef, Skill, StudentProfile

_SEED = Path(__file__).parent.parent / "data" / "seed.json"


def _load_seed() -> dict:
    with _SEED.open() as f:
        return json.load(f)


def main() -> None:
    os.environ.setdefault("AWS_PROFILE", "AsherC")
    seed = _load_seed()
    catalog = [Skill(**s) for s in seed["skills"]]
    students = [StudentProfile(**s) for s in seed["students"]]
    mentors = [MentorProfile(**m) for m in seed["mentors"]]
    project = seed["projects"][0]

    print(f"\n=== Analyzing: {project['title']} ===")
    brief = analyze_project(
        title=project["title"],
        description=project["description"],
        skills_catalog=catalog,
        deadline=project["deadline"],
    )
    print(json.dumps(brief.model_dump(), indent=2))

    print("\n=== Top student matches ===")
    for rec in recommend_students(brief, students, top_n=3):
        print(f"  {rec.student.name} — score={rec.match_score}")
        for r in rec.reasons:
            print(f"    · {r}")

    print("\n=== Top mentor matches ===")
    for rec in recommend_mentors(brief, mentors, top_n=2):
        print(f"  {rec.mentor.name} — score={rec.match_score}")
        for r in rec.reasons:
            print(f"    · {r}")

    print("\n=== Project recommendations for Ana Reyes ===")
    ana = next(s for s in students if s.name == "Ana Reyes")
    # Build (ref, brief) pairs. For the demo, we analyze all three projects.
    pairs = []
    for p in seed["projects"]:
        b = analyze_project(
            title=p["title"],
            description=p["description"],
            skills_catalog=catalog,
            deadline=p["deadline"],
        )
        pairs.append((ProjectRef(id=p["id"], title=p["title"], organization_name=p["organization_name"]), b))
    for rec in recommend_projects_for_student(ana, pairs, top_n=3):
        print(f"  {rec.project.title} — score={rec.match_score}")
        for r in rec.reasons:
            print(f"    · {r}")


if __name__ == "__main__":
    main()
