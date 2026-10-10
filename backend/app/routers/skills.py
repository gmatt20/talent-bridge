from __future__ import annotations

import psycopg
from fastapi import APIRouter, Depends

from .. import schemas as s
from ..deps import get_db

router = APIRouter()


@router.get("/api/skills", response_model=list[s.Skill])
def search_skills(q: str = "", db: psycopg.Connection = Depends(get_db)):
    rows = db.execute(
        "SELECT id, name FROM skills WHERE name ILIKE %s ORDER BY name LIMIT 10",
        (f"%{q}%",),
    ).fetchall()
    return rows
