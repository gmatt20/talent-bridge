---
name: fastapi-style-guide
description: Apply FastAPI Style Guide when writing, reviewing, or editing the Python backend (FastAPI routers, dependencies, Pydantic models, database access, tests).
license: MIT
compatibility: opencode
---

Apply this FastAPI style to all backend code written, reviewed, or refactored. It builds on the Python Style Guide (`python-style`): everything there applies here too. Flag violations. Fix on sight when editing.

## Tooling

- Format with **pyink** (Google's Black fork) using the `[tool.pyink]` settings in `backend/pyproject.toml`: 80 columns, 4-space indent. Run `uv run pyink app tests`.
- Lint with **pylint** using `[tool.pylint]` in `pyproject.toml`. Run `uv run pylint app tests`; new code adds no warnings.
- Test with **pytest**: `uv run pytest`.

## Layout

| Path | Holds |
|---|---|
| `app/main.py` | The `FastAPI` app, middleware, router registration, exception handlers. Nothing else. |
| `app/routers/<resource>.py` | One `APIRouter` per resource (`projects`, `students`, ...). |
| `app/schemas.py` | Pydantic request and response models for the HTTP API. |
| `app/deps.py` | Dependencies (`get_db`, `get_current_user`, role guards) and their `Annotated` aliases. |
| `app/repo.py` | SQL and row-to-object mapping shared by more than one router. |
| `app/core/` | Settings and security (hashing, tokens). |
| `app/ai/` | The AI library. No HTTP, no database. |
| `app/scripts/` | One-off CLI scripts with a `main()` and an `if __name__ == '__main__':` guard. |

- Module-level `app`, `router` and `settings` objects are the one allowed exception to "no object creation at import": the framework imports them by name.

## Imports

- Follow `python-style`: absolute imports of **modules and packages only** (`import fastapi`, `from app import schemas`, `from app.ai import analyze`). No relative imports.
- Refer to FastAPI and Pydantic names through their module: `fastapi.APIRouter`, `fastapi.HTTPException`, `pydantic.BaseModel`.
- `typing` names (`Annotated`, `Any`) may be imported directly.

## Routes

- Each route is a plain `def` (the database driver is synchronous) with a return annotation and a docstring. FastAPI shows the docstring as the endpoint's description in the OpenAPI docs, so write it for API readers ("Lists open projects.").
- Declare `response_model` and, for creates, `status_code=201` in the decorator.
- Path strings are full paths (`/api/projects/{project_id}`); path parameters are `snake_case` and typed (`project_id: int`).
- Keep handlers thin: validate, call `repo` or `ai`, shape the response. Move shared SQL into `repo.py`.
- Raise `fastapi.HTTPException(status_code=..., detail=...)` with keyword arguments and a message the frontend can show as-is ("Title is required."). The app's handler wraps it as `{"error": detail}`.

## Dependencies

- Inject with **`Annotated` aliases** from `app/deps.py`, never with `= Depends(...)` defaults:
  ```python
  def get_project(project_id: int, db: deps.Db) -> dict:
  def create_project(body: schemas.CreateProjectRequest, user: deps.Organization, db: deps.Db) -> dict:
  ```
- Role checks are dependencies (`deps.Organization`, `deps.Student`, `deps.Mentor`, `deps.CurrentUser`), not `if` statements in the handler. Ownership checks that need the row (`this project is yours`) stay in the handler or a helper.
- A dependency that opens a resource yields it and closes it in `finally`.

## Models

- Request and response models subclass `schemas.CamelModel`: fields are `snake_case` in Python and `camelCase` on the wire (the JSON contract in `ARCHITECTURE.md`) through Pydantic's `to_camel` alias generator.
- Name models for their role: `<Thing>Out` for responses, `<Action><Thing>Request` for bodies, `<Thing>Summary` for the short form.
- Optional fields are `X | None = None`; list fields use `pydantic.Field(default_factory=list)`, never `= []`.
- Every model has a class docstring. It shows up in the OpenAPI schema.
- Handlers may return plain dicts with `camelCase` keys; `response_model` validates and serializes them.

## Database

- Use `%s` placeholders and a params tuple for every value. Never build SQL with f-strings or `+`.
- Write SQL as implicitly joined string literals inside parentheses, one clause per line, so each line stays under 80 columns.
- Wrap multi-statement writes in `with db.transaction():`.
- Code must work with both connection types behind `deps.Db`: psycopg and the RDS Data API shim (`execute(...).fetchone()/.fetchall()`, `transaction()`). Don't use psycopg-only features in routers or `repo.py`.

## Settings and Secrets

- Read configuration only through `app.core.config.settings`. No `os.environ` lookups elsewhere, except the AI module's own Bedrock settings.
- Secrets come from the environment (`.env`, never committed). Never log tokens, passwords or hashes.

## Errors and Logging

- Validate input at the edge and fail with a 4xx `HTTPException`. Don't catch `Exception` in handlers.
- Log with `logging.getLogger(__name__)` and `%`-style arguments: `log.warning('Bedrock call failed: %s', e)`.

## Tests

- Test files are `tests/test_<module>.py`; fixtures go in `tests/conftest.py`.
- Patch a dependency where it is looked up: `mock.patch('app.ai.bedrock.invoke_json')`.
- No network or AWS in unit tests: stub Bedrock and use fixtures for data.
- Pytest fixtures shadow outer names by design; disable `redefined-outer-name` at the top of test modules.

## Enforcement

When writing backend code: follow all rules above and in the Python Style Guide. No exceptions unless the rule itself specifies one.

When reviewing backend code: flag violations with line reference and rule section. Suggest fix.

When refactoring: preserve style compliance. Don't introduce violations.

Be consistent with surrounding code style.
