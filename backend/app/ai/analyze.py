"""Turns a raw business challenge into a structured project brief."""

import datetime
import logging
import pathlib

from app.ai import bedrock
from app.ai import schemas
from app.ai import skills

log = logging.getLogger(__name__)

_PROMPT_PATH = pathlib.Path(__file__).parent / "prompts" / "analyze.txt"
_SYSTEM_PROMPT = _PROMPT_PATH.read_text()

# Cap the catalog hint so we never blow prompt budget on huge skill tables.
_MAX_CATALOG_HINT = 200
_DEFAULT_SCOPE = "Scope to be refined with the organization."


def analyze_project(
    title: str,
    description: str,
    skills_catalog: list[schemas.Skill],
    *,
    deadline: str | None = None,
) -> schemas.Brief:
    """Produces a brief from raw project text.

    Falls back to a conservative deterministic brief if Bedrock is unreachable
    or returns unusable output. Never raises.

    Args:
        title: The project's title.
        description: The organization's plain-language description.
        skills_catalog: Skills the brief may suggest.
        deadline: ISO date the project is due, if any.

    Returns:
        The structured brief.
    """
    catalog_hint = ", ".join(s.name for s in skills_catalog[:_MAX_CATALOG_HINT])
    user = (
        f"Project title: {title}\n\n"
        f"Project description:\n{description.strip()}\n\n"
        f"Deadline: {deadline or 'not specified'}\n\n"
        f"Available catalog skill names (prefer these): {catalog_hint}"
    )

    try:
        raw = bedrock.invoke_json(_SYSTEM_PROMPT, user, max_tokens=1500)
    except bedrock.BedrockError as e:
        log.warning("analyze_project falling back: %s", e)
        return _fallback_brief(title, deadline)

    return _brief_from_raw(raw, skills_catalog, deadline)


def _skill_name(item: object) -> str:
    if isinstance(item, str):
        return item
    return (item or {}).get("name", "")


def _brief_from_raw(
    raw: dict, catalog: list[schemas.Skill], deadline: str | None
) -> schemas.Brief:
    skill_names_raw = (
        raw.get("suggested_skills") or raw.get("suggestedSkills") or []
    )
    skill_names = [_skill_name(n) for n in skill_names_raw]
    resolved = skills.resolve_skills(skill_names, catalog)

    milestones: list[schemas.Milestone] = []
    for m in raw.get("milestones", [])[:4]:
        if not isinstance(m, dict):
            continue
        title = str(m.get("title", "")).strip()
        if not title:
            continue
        milestones.append(
            schemas.Milestone(
                title=title[:120],
                due_date=m.get("due_date") or m.get("dueDate"),
            )
        )

    objectives = [str(o)[:120] for o in raw.get("objectives", [])[:4] if o]
    deliverables = [str(d)[:120] for d in raw.get("deliverables", [])[:4] if d]
    return schemas.Brief(
        objectives=objectives,
        deliverables=deliverables,
        suggested_skills=resolved,
        milestones=milestones or _default_milestones(deadline),
        scope=str(raw.get("scope", ""))[:280] or _DEFAULT_SCOPE,
    )


def _fallback_brief(title: str, deadline: str | None) -> schemas.Brief:
    return schemas.Brief(
        objectives=[f"Deliver a working solution for: {title}"[:120]],
        deliverables=["Minimum viable prototype", "Short handoff document"],
        suggested_skills=[],
        milestones=_default_milestones(deadline),
        scope=_DEFAULT_SCOPE,
    )


def _default_milestones(deadline: str | None) -> list[schemas.Milestone]:
    today = datetime.date.today()
    eight_weeks = today + datetime.timedelta(weeks=8)
    try:
        end = datetime.date.fromisoformat(deadline) if deadline else eight_weeks
    except ValueError:
        end = eight_weeks
    halfway = end - (end - today) / 2
    kickoff = today + datetime.timedelta(days=7)
    return [
        schemas.Milestone(
            title="Kickoff and requirements alignment", due_date=str(kickoff)
        ),
        schemas.Milestone(title="MVP review", due_date=str(halfway)),
        schemas.Milestone(title="Final delivery", due_date=str(end)),
    ]
