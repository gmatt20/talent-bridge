"""Student profiles, recommendations and applications."""

from typing import Any

import fastapi

from app import deps
from app import repo
from app import schemas
from app.ai import recommend
from app.ai import schemas as ai_schemas

router = fastapi.APIRouter()


def _student_profile_out(db: deps.Connection, user_id: int) -> dict[str, Any]:
    row = db.execute(
        "SELECT u.id, u.name, s.headline, s.bio, s.availability, s.rating "
        "FROM student_profiles s JOIN users u ON u.id = s.user_id "
        "WHERE s.user_id = %s",
        (user_id,),
    ).fetchone()
    if not row:
        raise fastapi.HTTPException(
            status_code=404, detail="Student not found."
        )
    return {
        "id": row["id"],
        "name": row["name"],
        "headline": row["headline"],
        "bio": row["bio"],
        "availability": row["availability"],
        "rating": float(row["rating"]) if row["rating"] is not None else None,
        "skills": [
            skill.model_dump() for skill in repo.student_skills(db, user_id)
        ],
    }


@router.get(
    "/api/students/{student_id}", response_model=schemas.StudentProfileOut
)
def get_student(student_id: int, db: deps.Db) -> dict[str, Any]:
    """Returns a student's public profile."""
    return _student_profile_out(db, student_id)


@router.put("/api/students/me", response_model=schemas.StudentProfileOut)
def update_me(
    body: schemas.UpdateStudentProfileRequest,
    user: deps.Student,
    db: deps.Db,
) -> dict[str, Any]:
    """Updates the signed-in student's profile and replaces their skills.

    Responds 404 if any skill id isn't in the catalog.
    """
    if body.skill_ids:
        known = {skill.id for skill in repo.skill_catalog(db)}
        missing = [i for i in body.skill_ids if i not in known]
        if missing:
            raise fastapi.HTTPException(
                status_code=404, detail=f"Skill {missing[0]} not found."
            )
    db.execute(
        "UPDATE student_profiles SET headline = %s, bio = %s, "
        "availability = %s WHERE user_id = %s",
        (body.headline, body.bio, body.availability, user["id"]),
    )
    db.execute(
        "DELETE FROM student_skills WHERE student_id = %s", (user["id"],)
    )
    for skill_id in body.skill_ids:
        db.execute(
            "INSERT INTO student_skills (student_id, skill_id) "
            "VALUES (%s, %s) ON CONFLICT DO NOTHING",
            (user["id"], skill_id),
        )
    return _student_profile_out(db, user["id"])


@router.get("/api/students/me/recommendations", response_model=dict)
def my_recommendations(user: deps.Student, db: deps.Db) -> dict[str, Any]:
    """Lists analyzed open projects the AI recommends, best match first.

    Projects the student already applied to are left out.
    """
    profile = repo.ai_student_profile(db, user["id"])
    if profile is None:
        raise fastapi.HTTPException(
            status_code=404, detail="Student profile not found."
        )

    applied_rows = db.execute(
        "SELECT project_id FROM proposals WHERE student_id = %s",
        (user["id"],),
    ).fetchall()
    applied_ids = {r["project_id"] for r in applied_rows}
    rows = db.execute(
        "SELECT p.id, p.title, p.organization_id FROM projects p "
        "JOIN project_briefs b ON b.project_id = p.id "
        "WHERE p.status = 'open'"
    ).fetchall()

    org_by_project = {r["id"]: r["organization_id"] for r in rows}
    pairs: list[tuple[ai_schemas.ProjectRef, ai_schemas.Brief]] = []
    for r in rows:
        if r["id"] in applied_ids:
            continue
        brief = repo.brief_from_db(db, r["id"])
        if brief is None:
            continue
        pairs.append(
            (ai_schemas.ProjectRef(id=r["id"], title=r["title"]), brief)
        )

    recs = recommend.recommend_projects_for_student(profile, pairs)
    items = [
        {
            "project": {
                "id": rec.project.id,
                "title": rec.project.title,
                "organization": repo.organization_summary(
                    db, org_by_project[rec.project.id]
                ),
            },
            "matchScore": rec.match_score,
            "reasons": rec.reasons,
        }
        for rec in recs
    ]
    return {"items": items}


@router.get("/api/students/me/proposals", response_model=dict)
def my_proposals(user: deps.Student, db: deps.Db) -> dict[str, Any]:
    """Lists the signed-in student's applications, newest first."""
    rows = db.execute(
        "SELECT pr.id, pr.cover_letter, pr.status, pr.created_at, "
        "pr.project_id, p.title AS project_title "
        "FROM proposals pr JOIN projects p ON p.id = pr.project_id "
        "WHERE pr.student_id = %s ORDER BY pr.created_at DESC",
        (user["id"],),
    ).fetchall()
    profile = _student_profile_out(db, user["id"])
    items = [
        {
            "id": r["id"],
            "coverLetter": r["cover_letter"],
            "status": r["status"],
            "createdAt": repo.to_iso(r["created_at"]),
            "student": {
                "id": profile["id"],
                "name": profile["name"],
                "headline": profile["headline"],
                "rating": profile["rating"],
                "skills": profile["skills"],
            },
            "project": {"id": r["project_id"], "title": r["project_title"]},
        }
        for r in rows
    ]
    return {"items": items}
