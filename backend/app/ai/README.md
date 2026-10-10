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
| Model | DeepSeek R1 via Bedrock inference profile `us.deepseek.r1-v1:0` in `us-west-2`. Swap with `BEDROCK_MODEL_ID` env var. |
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

1. ~~**Skill resolver**~~ — **Resolved**: using your `resolve_skills()` as-is
   from `app/repo.py`/`analyze_project`. No `pg_trgm` duplication.
2. ~~**`student_profiles` missing fields**~~ — **Resolved**: added
   `interests TEXT[]` and `learning_goals TEXT` to `student_profiles` in
   `db/schema.sql`. `app/repo.py#ai_student_profile` populates both on every
   `StudentProfile` built for recommendations.
3. ~~**Brief persistence**~~ — **Resolved**: `app/repo.py#persist_brief` writes
   `project_briefs` + `project_brief_skills` + `milestones` in one transaction,
   called from `POST /api/projects/{id}/analyze` in `app/routers/projects.py`.
   `app/repo.py#brief_from_db` reads it back into an `ai.Brief` for
   recommendations.
4. **No DB access from this module**: still true — confirmed, nothing in
   `app/routers/*` imports from `app.ai` except the pure functions in
   `app/ai/__init__.py`.

One more found while wiring this up: `bedrock.py#_get_client()`'s
`boto3.client(...)` call wasn't inside the try/except, so a credentials or
missing-dependency error (e.g. no `AsherC` profile configured) escaped as a
raw 500 instead of falling back — fixed by wrapping client construction and
raising `BedrockError` on failure, so the "never raises" contract holds for
anyone running this without your AWS profile.
