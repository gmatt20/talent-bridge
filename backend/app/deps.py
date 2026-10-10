"""FastAPI dependencies: the database connection, the current user, roles.

Routers inject them through the `Annotated` aliases defined here, for example
`db: deps.Db` or `user: deps.Organization`.
"""

from collections.abc import Callable, Iterator
from typing import Annotated, Any, TypeAlias

import fastapi
import psycopg
from psycopg import rows

from app import dataapi
from app.core import config
from app.core import security

Connection: TypeAlias = psycopg.Connection | dataapi.DataApiConnection
User: TypeAlias = dict[str, Any]


def get_db() -> Iterator[Connection]:
    """Yields a database connection for one request, then closes it."""
    if config.settings.db_mode == "data-api":
        yield dataapi.DataApiConnection()
        return
    conn = psycopg.connect(
        config.settings.database_url, row_factory=rows.dict_row, autocommit=True
    )
    try:
        yield conn
    finally:
        conn.close()


Db: TypeAlias = Annotated[Connection, fastapi.Depends(get_db)]


def get_current_user(
    *,
    authorization: Annotated[str | None, fastapi.Header()] = None,
    db: Db,
) -> User:
    """Returns the user row for the request's bearer token.

    Raises:
        fastapi.HTTPException: 401 if the token is missing or invalid, or its
            user no longer exists.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise fastapi.HTTPException(
            status_code=401, detail="Please log in to continue."
        )
    user_id = security.verify_token(authorization.removeprefix("Bearer "))
    if user_id is None:
        raise fastapi.HTTPException(
            status_code=401, detail="Invalid or expired token."
        )
    row = db.execute(
        "SELECT id, role, email::text, name, created_at FROM users "
        "WHERE id = %s",
        (user_id,),
    ).fetchone()
    if not row:
        raise fastapi.HTTPException(status_code=401, detail="User not found.")
    return row


CurrentUser: TypeAlias = Annotated[User, fastapi.Depends(get_current_user)]


def require_role(role: str) -> Callable[[User], User]:
    """Returns a dependency that allows only signed-in users with `role`."""

    def checker(user: CurrentUser) -> User:
        if user["role"] != role:
            raise fastapi.HTTPException(
                status_code=403, detail=f"Only {role}s can do this."
            )
        return user

    return checker


Organization: TypeAlias = Annotated[
    User, fastapi.Depends(require_role("organization"))
]
Student: TypeAlias = Annotated[User, fastapi.Depends(require_role("student"))]
Mentor: TypeAlias = Annotated[User, fastapi.Depends(require_role("mentor"))]
