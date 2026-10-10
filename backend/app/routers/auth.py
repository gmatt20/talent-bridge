from __future__ import annotations

import psycopg
from fastapi import APIRouter, Depends, HTTPException

from .. import repo
from .. import schemas as s
from ..core.security import create_token, hash_password, verify_password
from ..deps import get_current_user, get_db

router = APIRouter()

VALID_ROLES = {"organization", "student", "mentor"}


def _user_out(row: dict) -> dict:
    return {
        "id": row["id"],
        "role": row["role"],
        "email": row["email"],
        "name": row["name"],
        "createdAt": repo.to_iso(row.get("created_at")),
    }


@router.post("/api/auth/register", response_model=s.AuthResponse, status_code=201)
def register(body: s.RegisterRequest, db: psycopg.Connection = Depends(get_db)):
    if body.role not in VALID_ROLES:
        raise HTTPException(400, "Choose a role.")
    name = body.name.strip()
    email = body.email.strip().lower()
    if not name:
        raise HTTPException(400, "Name is required.")
    if not email:
        raise HTTPException(400, "Email is required.")
    if len(body.password) < 8:
        raise HTTPException(400, "Password must be at least 8 characters.")

    existing = db.execute("SELECT 1 FROM users WHERE email = %s", (email,)).fetchone()
    if existing:
        raise HTTPException(409, "An account with this email already exists.")

    row = db.execute(
        "INSERT INTO users (role, email, password_hash, name) VALUES (%s, %s, %s, %s) "
        "RETURNING id, role, email::text, name, created_at",
        (body.role, email, hash_password(body.password), name),
    ).fetchone()

    if body.role == "organization":
        db.execute("INSERT INTO organizations (user_id, company_name) VALUES (%s, %s)", (row["id"], name))
    elif body.role == "student":
        db.execute("INSERT INTO student_profiles (user_id) VALUES (%s)", (row["id"],))
    elif body.role == "mentor":
        db.execute("INSERT INTO mentor_profiles (user_id) VALUES (%s)", (row["id"],))

    return {"token": create_token(row["id"]), "user": _user_out(row)}


@router.post("/api/auth/login", response_model=s.AuthResponse)
def login(body: s.LoginRequest, db: psycopg.Connection = Depends(get_db)):
    email = body.email.strip().lower()
    row = db.execute(
        "SELECT id, role, email::text, name, password_hash, created_at FROM users WHERE email = %s",
        (email,),
    ).fetchone()
    if not row or not verify_password(body.password, row["password_hash"]):
        raise HTTPException(401, "Invalid email or password.")
    return {"token": create_token(row["id"]), "user": _user_out(row)}


@router.get("/api/users/me", response_model=s.UserOut)
def me(user: dict = Depends(get_current_user)):
    return _user_out(user)
