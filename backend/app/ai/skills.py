"""Fuzzy skill-name resolver: the AI returns names, we snap them to the catalog.

Works in memory (no database access) to keep the AI module testable in
isolation; the HTTP handler passes in the catalog loaded from Postgres.
"""

import difflib

from app.ai import schemas

MATCH_THRESHOLD = 0.72


def _best_match(
    needle: str,
    catalog: list[tuple[schemas.Skill, str]],
    threshold: float,
) -> schemas.Skill | None:
    best_ratio = threshold
    best_skill = None
    for skill, haystack in catalog:
        ratio = difflib.SequenceMatcher(None, needle, haystack).ratio()
        if ratio >= threshold and (best_skill is None or ratio > best_ratio):
            best_ratio = ratio
            best_skill = skill
    return best_skill


def resolve_skills(
    names: list[str],
    catalog: list[schemas.Skill],
    threshold: float = MATCH_THRESHOLD,
) -> list[schemas.Skill]:
    """Maps model-produced skill names to catalog entries by fuzzy similarity.

    Dedupes by skill id. Unknown names are silently dropped; handlers can
    compare `len(resolve_skills(...)) < len(names)` to detect misses.

    Args:
        names: Skill names from the model.
        catalog: The skills to match against.
        threshold: The minimum similarity ratio (0 to 1) for a match.

    Returns:
        The matched catalog skills, in the order of `names`.
    """
    if not names or not catalog:
        return []
    normalized_catalog = [(s, s.name.lower()) for s in catalog]
    out: list[schemas.Skill] = []
    seen: set[int] = set()
    for raw in names:
        if not isinstance(raw, str) or not raw.strip():
            continue
        best = _best_match(raw.strip().lower(), normalized_catalog, threshold)
        if best and best.id not in seen:
            out.append(best)
            seen.add(best.id)
    return out
