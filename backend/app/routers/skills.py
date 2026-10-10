"""Skill catalog search, used to tag students and projects."""

from typing import Any

import fastapi

from app import deps
from app import schemas

router = fastapi.APIRouter()


@router.get("/api/skills", response_model=list[schemas.Skill])
def search_skills(db: deps.Db, q: str = "") -> list[dict[str, Any]]:
    """Searches skills by name (case-insensitive), returning up to 10."""
    return db.execute(
        "SELECT id, name FROM skills WHERE name ILIKE %s "
        "ORDER BY name LIMIT 10",
        (f"%{q}%",),
    ).fetchall()
