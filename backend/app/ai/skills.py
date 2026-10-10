"""Fuzzy skill-name resolver. AI returns names; we snap them to catalog IDs.

Lives in-memory (no DB access) to keep the AI module testable in isolation.
Matthew's HTTP handler passes in the catalog loaded from Postgres.
"""

from __future__ import annotations

from difflib import SequenceMatcher

from .schemas import Skill

MATCH_THRESHOLD = 0.72


def resolve_skills(
    names: list[str],
    catalog: list[Skill],
    threshold: float = MATCH_THRESHOLD,
) -> list[Skill]:
    """Map model-produced skill names to catalog entries by fuzzy similarity.

    Dedupes by skill id. Unknown names are silently dropped — handlers can
    inspect `len(resolve_skills(...)) < len(names)` to detect misses.
    """
    if not names or not catalog:
        return []
    normalized_catalog = [(s, s.name.lower()) for s in catalog]
    out: list[Skill] = []
    seen: set[int] = set()
    for raw in names:
        if not isinstance(raw, str) or not raw.strip():
            continue
        needle = raw.strip().lower()
        best: tuple[float, Skill] | None = None
        for skill, hay in normalized_catalog:
            ratio = SequenceMatcher(None, needle, hay).ratio()
            if ratio >= threshold and (best is None or ratio > best[0]):
                best = (ratio, skill)
        if best and best[1].id not in seen:
            out.append(best[1])
            seen.add(best[1].id)
    return out
