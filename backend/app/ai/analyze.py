"""Turn a raw business challenge into a structured project brief."""

from __future__ import annotations

import logging
from datetime import date, timedelta
from pathlib import Path

from .bedrock import BedrockError, invoke_json
from .schemas import Brief, Milestone, Skill
from .skills import resolve_skills

log = logging.getLogger(__name__)

_PROMPT_PATH = Path(__file__).parent / "prompts" / "analyze.txt"
_SYSTEM_PROMPT = _PROMPT_PATH.read_text()

# Cap the catalog hint so we never blow prompt budget on huge skill tables.
_MAX_CATALOG_HINT = 200


def analyze_project(
    title: str,
    description: str,
    skills_catalog: list[Skill],
    *,
    deadline: str | None = None,
) -> Brief:
    """Produce a Brief from raw project text.

    Falls back to a conservative deterministic brief if Bedrock is unreachable
    or returns unusable output. Never raises.
    """
    catalog_hint = ", ".join(s.name for s in skills_catalog[:_MAX_CATALOG_HINT])
    user = (
        f"Project title: {title}\n\n"
        f"Project description:\n{description.strip()}\n\n"
        f"Deadline: {deadline or 'not specified'}\n\n"
        f"Available catalog skill names (prefer these): {catalog_hint}"
    )

    try:
        raw = invoke_json(_SYSTEM_PROMPT, user, max_tokens=1500)
    except BedrockError as e:
        log.warning("analyze_project falling back: %s", e)
        return _fallback_brief(title, deadline)

    return _brief_from_raw(raw, skills_catalog, deadline)


def _brief_from_raw(raw: dict, catalog: list[Skill], deadline: str | None) -> Brief:
    skill_names_raw = raw.get("suggested_skills") or raw.get("suggestedSkills") or []
    skill_names = [n if isinstance(n, str) else (n or {}).get("name", "") for n in skill_names_raw]
    resolved = resolve_skills(skill_names, catalog)

    milestones_raw = raw.get("milestones", [])
    milestones: list[Milestone] = []
    for m in milestones_raw[:4]:
        if not isinstance(m, dict):
            continue
        title = str(m.get("title", "")).strip()
        if not title:
            continue
        milestones.append(
            Milestone(title=title[:120], due_date=m.get("due_date") or m.get("dueDate"))
        )

    return Brief(
        objectives=[str(o)[:120] for o in raw.get("objectives", [])[:4] if o],
        deliverables=[str(d)[:120] for d in raw.get("deliverables", [])[:4] if d],
        suggested_skills=resolved,
        milestones=milestones or _default_milestones(deadline),
        scope=str(raw.get("scope", ""))[:280]
        or "Scope to be refined with the organization.",
    )


def _fallback_brief(title: str, deadline: str | None) -> Brief:
    return Brief(
        objectives=[f"Deliver a working solution for: {title}"[:120]],
        deliverables=["Minimum viable prototype", "Short handoff document"],
        suggested_skills=[],
        milestones=_default_milestones(deadline),
        scope="Scope to be refined with the organization.",
    )


def _default_milestones(deadline: str | None) -> list[Milestone]:
    try:
        end = date.fromisoformat(deadline) if deadline else date.today() + timedelta(weeks=8)
    except ValueError:
        end = date.today() + timedelta(weeks=8)
    halfway = end - (end - date.today()) / 2
    return [
        Milestone(title="Kickoff and requirements alignment", due_date=str(date.today() + timedelta(days=7))),
        Milestone(title="MVP review", due_date=str(halfway)),
        Milestone(title="Final delivery", due_date=str(end)),
    ]
