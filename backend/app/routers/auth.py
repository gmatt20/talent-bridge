"""Registration, login and the current user."""

import re
from typing import Any

import fastapi

from app import deps
from app import repo
from app import schemas
from app.core import security

router = fastapi.APIRouter()

VALID_ROLES = frozenset({"organization", "student", "mentor"})

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _user_out(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": row["id"],
        "role": row["role"],
        "email": row["email"],
        "name": row["name"],
        "createdAt": repo.to_iso(row.get("created_at")),
    }


def _validate_registration(
    body: schemas.RegisterRequest, name: str, email: str
) -> None:
    """Rejects a registration with a 400 if any field is invalid."""
    if body.role not in VALID_ROLES:
        raise fastapi.HTTPException(status_code=400, detail="Choose a role.")
    if not name:
        raise fastapi.HTTPException(status_code=400, detail="Name is required.")
    if not email:
        raise fastapi.HTTPException(
            status_code=400, detail="Email is required."
        )
    if not EMAIL_RE.match(email):
        raise fastapi.HTTPException(
            status_code=400, detail="Please enter a valid email address."
        )
    if len(body.password_hash) < 8:
        raise fastapi.HTTPException(
            status_code=400, detail="Password must be at least 8 characters."
        )


@router.post(
    "/api/auth/register", response_model=schemas.AuthResponse, status_code=201
)
def register(body: schemas.RegisterRequest, db: deps.Db) -> dict[str, Any]:
    """Creates an account and its empty profile, and signs it in."""
    name = body.name.strip()
    email = body.email.strip().lower()
    _validate_registration(body, name, email)

    existing = db.execute(
        "SELECT 1 FROM users WHERE email = %s", (email,)
    ).fetchone()
    if existing:
        raise fastapi.HTTPException(
            status_code=409,
            detail="An account with this email already exists.",
        )
    existing = db.execute(
        "SELECT 1 FROM users WHERE LOWER(name) = LOWER(%s)", (name,)
    ).fetchone()
    if existing:
        raise fastapi.HTTPException(
            status_code=409, detail="An account with this name already exists."
        )

    row = db.execute(
        "INSERT INTO users (role, email, password_hash, name) "
        "VALUES (%s, %s, %s, %s) "
        "RETURNING id, role, email::text, name, created_at",
        (body.role, email, security.hash_password(body.password_hash), name),
    ).fetchone()

    if body.role == "organization":
        db.execute(
            "INSERT INTO organizations (user_id, company_name) "
            "VALUES (%s, %s)",
            (row["id"], name),
        )
    elif body.role == "student":
        db.execute(
            "INSERT INTO student_profiles (user_id) VALUES (%s)", (row["id"],)
        )
    elif body.role == "mentor":
        db.execute(
            "INSERT INTO mentor_profiles (user_id) VALUES (%s)", (row["id"],)
        )

    return {"token": security.create_token(row["id"]), "user": _user_out(row)}


@router.post("/api/auth/login", response_model=schemas.AuthResponse)
def login(body: schemas.LoginRequest, db: deps.Db) -> dict[str, Any]:
    """Signs in with an email and password."""
    email = body.email.strip().lower()
    row = db.execute(
        "SELECT id, role, email::text, name, password_hash, created_at "
        "FROM users WHERE email = %s",
        (email,),
    ).fetchone()
    if not row:
        raise fastapi.HTTPException(
            status_code=401, detail="Invalid email or password."
        )
    if not security.verify_password(body.password_hash, row["password_hash"]):
        raise fastapi.HTTPException(
            status_code=401, detail="Invalid email or password."
        )
    return {"token": security.create_token(row["id"]), "user": _user_out(row)}


@router.get("/api/users/me", response_model=schemas.UserOut)
def me(user: deps.CurrentUser) -> dict[str, Any]:
    """Returns the signed-in user."""
    return _user_out(user)
