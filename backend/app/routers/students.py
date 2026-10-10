from __future__ import annotations

import psycopg
from fastapi import APIRouter, Depends, HTTPException

from app import ai

from .. import repo
from .. import schemas as s
from ..deps import get_db, require_role

router = APIRouter()


def _student_profile_out(db: psycopg.Connection, user_id: int) -> dict:
    row = db.execute(
        "SELECT u.id, u.name, s.headline, s.bio, s.availability, s.rating "
        "FROM student_profiles s JOIN users u ON u.id = s.user_id WHERE s.user_id = %s",
        (user_id,),
    ).fetchone()
    if not row:
        raise HTTPException(404, "Student not found.")
    return {
        "id": row["id"],
        "name": row["name"],
        "headline": row["headline"],
        "bio": row["bio"],
        "availability": row["availability"],
        "rating": float(row["rating"]) if row["rating"] is not None else None,
        "skills": [sk.model_dump() for sk in repo.student_skills(db, user_id)],
    }


@router.get("/api/students/{student_id}", response_model=s.StudentProfileOut)
def get_student(student_id: int, db: psycopg.Connection = Depends(get_db)):
    return _student_profile_out(db, student_id)


@router.put("/api/students/me", response_model=s.StudentProfileOut)
def update_me(
    body: s.UpdateStudentProfileRequest,
    user: dict = Depends(require_role("student")),
    db: psycopg.Connection = Depends(get_db),
):
    db.execute(
        "UPDATE student_profiles SET headline = %s, bio = %s, availability = %s WHERE user_id = %s",
        (body.headline, body.bio, body.availability, user["id"]),
    )
    db.execute("DELETE FROM student_skills WHERE student_id = %s", (user["id"],))
    for skill_id in body.skillIds:
        db.execute(
            "INSERT INTO student_skills (student_id, skill_id) VALUES (%s, %s) ON CONFLICT DO NOTHING",
            (user["id"], skill_id),
        )
    return _student_profile_out(db, user["id"])


@router.get("/api/students/me/recommendations", response_model=dict)
def my_recommendations(
    user: dict = Depends(require_role("student")),
    db: psycopg.Connection = Depends(get_db),
):
    profile = repo.ai_student_profile(db, user["id"])
    if profile is None:
        raise HTTPException(404, "Student profile not found.")

    applied_ids = {
        r["project_id"]
        for r in db.execute("SELECT project_id FROM proposals WHERE student_id = %s", (user["id"],)).fetchall()
    }
    rows = db.execute(
        "SELECT p.id, p.title, p.organization_id FROM projects p "
        "JOIN project_briefs b ON b.project_id = p.id WHERE p.status = 'open'"
    ).fetchall()

    org_by_project = {r["id"]: r["organization_id"] for r in rows}
    pairs: list[tuple[ai.ProjectRef, ai.Brief]] = []
    for r in rows:
        if r["id"] in applied_ids:
            continue
        brief = repo.brief_from_db(db, r["id"])
        if brief is None:
            continue
        pairs.append((ai.ProjectRef(id=r["id"], title=r["title"]), brief))

    recs = ai.recommend_projects_for_student(profile, pairs)
    items = [
        {
            "project": {
                "id": rec.project.id,
                "title": rec.project.title,
                "organization": repo.organization_summary(db, org_by_project[rec.project.id]),
            },
            "matchScore": rec.match_score,
            "reasons": rec.reasons,
        }
        for rec in recs
    ]
    return {"items": items}


@router.get("/api/students/me/proposals", response_model=dict)
def my_proposals(
    user: dict = Depends(require_role("student")),
    db: psycopg.Connection = Depends(get_db),
):
    rows = db.execute(
        "SELECT pr.id, pr.cover_letter, pr.status, pr.created_at, pr.project_id, p.title AS project_title "
        "FROM proposals pr JOIN projects p ON p.id = pr.project_id "
        "WHERE pr.student_id = %s ORDER BY pr.created_at DESC",
        (user["id"],),
    ).fetchall()
    items = [
        {
            "id": r["id"],
            "coverLetter": r["cover_letter"],
            "status": r["status"],
            "createdAt": repo.to_iso(r["created_at"]),
            "student": {
                "id": user["id"],
                "name": user["name"],
                "headline": None,
                "rating": None,
                "skills": [],
            },
            "project": {"id": r["project_id"], "title": r["project_title"]},
        }
        for r in rows
    ]
    return {"items": items}
