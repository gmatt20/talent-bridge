from __future__ import annotations

from collections.abc import Generator

import psycopg
from fastapi import Depends, Header, HTTPException
from psycopg.rows import dict_row

from .core.config import settings
from .core.security import verify_token
from .dataapi import DataApiConnection

DBConn = psycopg.Connection | DataApiConnection


def get_db() -> Generator[DBConn, None, None]:
    if settings.db_mode == "data-api":
        yield DataApiConnection()
        return
    conn = psycopg.connect(settings.database_url, row_factory=dict_row, autocommit=True)
    try:
        yield conn
    finally:
        conn.close()


def get_current_user(
    authorization: str | None = Header(default=None),
    db: DBConn = Depends(get_db),
) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Please log in to continue.")
    user_id = verify_token(authorization.removeprefix("Bearer "))
    if user_id is None:
        raise HTTPException(401, "Invalid or expired token.")
    row = db.execute(
        "SELECT id, role, email::text, name, created_at FROM users WHERE id = %s", (user_id,)
    ).fetchone()
    if not row:
        raise HTTPException(401, "User not found.")
    return row


def require_role(role: str):
    def checker(user: dict = Depends(get_current_user)) -> dict:
        if user["role"] != role:
            raise HTTPException(403, f"Only {role}s can do this.")
        return user

    return checker
