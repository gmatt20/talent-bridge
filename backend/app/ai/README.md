# AI module

Internal library for Talent Bridge's AI matchmaking. **No HTTP, no DB** — the
backend handler imports these functions, passes plain dicts/objects, and gets
Pydantic models back that it serializes to JSON.

## Integration contract

```python
from app.ai import (
    analyze_project,
    recommend_students,
    recommend_mentors,
    recommend_projects_for_student,
    Skill, StudentProfile, MentorProfile, ProjectRef,
)

# 1. POST /api/projects/{id}/analyze
brief = analyze_project(
    title=row["title"],
    description=row["description"],
    skills_catalog=[Skill(id=r["id"], name=r["name"]) for r in catalog_rows],
    deadline=row["deadline"],
)
# brief.model_dump() is the response body. Also persist to project_briefs,
# milestones, project_brief_skills tables.

# 2. GET /api/projects/{id}/recommendations
recs = recommend_students(brief, students, top_n=5)
mentor_recs = recommend_mentors(brief, mentors, top_n=3)
# [r.model_dump() for r in recs]  →  response body

# 3. GET /api/students/me/recommendations
pairs = [(ProjectRef(**ref), stored_brief) for ref, stored_brief in analyzed_projects]
proj_recs = recommend_projects_for_student(me, pairs, top_n=10)
```

## Design decisions

| | |
|---|---|
| Model | Amazon Nova Lite (`amazon.nova-lite-v1:0`) in `us-west-2`. Regional model, no cross-region routing. Swap with `BEDROCK_MODEL_ID` env var. |
| Scoring | **Hybrid**: deterministic skill overlap + availability + rating → numeric score. Bedrock generates `reasons[]` text only, never the score. |
| Skill resolution | AI returns skill names; `resolve_skills()` fuzzy-matches to the catalog using `difflib`. Unknown names dropped silently. |
| Failure mode | Every Bedrock call has a deterministic fallback. The module never raises — handlers always get a valid Brief/Recommendation. |
| Prompts | Plain `.txt` files under `prompts/`. Loaded at import time. |
| Concurrency | `reasons[]` generation runs in a thread pool (5 workers) across the top-N candidates. |

## Config

Environment variables (see `backend/.env.example`):

- `AWS_PROFILE` — AWS SSO profile with Bedrock access
- `AWS_REGION` — defaults to `us-west-2`
- `BEDROCK_MODEL_ID` — defaults to `us.deepseek.r1-v1:0`
- `BEDROCK_TEMPERATURE` — defaults to `0.2`

## Running

```sh
cd backend
uv sync
uv run pytest                    # unit tests, no Bedrock access needed
uv run python -m app.ai.demo     # live Bedrock end-to-end demo
```

The demo needs a valid AWS session. If you see `signin:CreateOAuth2Token`
errors, run `aws login --profile AsherC` first.

## Open coordination items with Matthew

1. **Skill resolver**: this module does fuzzy matching in Python. If you'd
   rather use `pg_trgm.similarity()` in Postgres instead, pass the resolved
   skills in and skip my `resolve_skills()` call. Either is fine.
2. **`student_profiles` missing fields**: PLAN.md says to match on interests
   and learning goals. Jeff's schema in PR #6 doesn't have those columns yet.
   This module already accepts them as optional fields and falls back to `bio`.
   Either add `interests TEXT[]` + `learning_goals TEXT` columns, or we
   silently degrade to bio-only matching.
3. **Brief persistence**: this module returns a Pydantic `Brief`. Writing to
   `project_briefs`, `project_brief_skills`, and `milestones` tables is on
   you. `brief.model_dump()` gives you a plain dict to work from.
4. **No DB access from this module**: everything in/out is plain objects.
   This stays true even if the model changes.
