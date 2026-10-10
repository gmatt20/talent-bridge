"""Database queries and row-to-object mapping shared by the routers.

Keeps the AI object construction and the brief persistence logic (the two
things the AI module leaves to the HTTP layer) in one place instead of
scattered across routers.
"""

from typing import Any

from psycopg.types import json as psycopg_json

from app import deps
from app.ai import schemas as ai_schemas


def to_iso(value: object) -> str | None:
    """Returns a timestamp column as an ISO string.

    psycopg returns datetime objects; the Data API returns pre-formatted
    strings. Both are normalized for the JSON response.
    """
    if value is None:
        return None
    if hasattr(value, "isoformat"):
        return value.isoformat()
    return str(value)


def skill_catalog(db: deps.Connection) -> list[ai_schemas.Skill]:
    """Returns every skill, sorted by name."""
    rows = db.execute("SELECT id, name FROM skills ORDER BY name").fetchall()
    return [ai_schemas.Skill(id=r["id"], name=r["name"]) for r in rows]


def organization_summary(db: deps.Connection, user_id: int) -> dict[str, Any]:
    """Returns an organization's id and name, for embedding in responses."""
    row = db.execute(
        "SELECT u.id, o.company_name FROM organizations o "
        "JOIN users u ON u.id = o.user_id WHERE o.user_id = %s",
        (user_id,),
    ).fetchone()
    if not row:
        return {"id": user_id, "companyName": "Unknown organization"}
    return {"id": row["id"], "companyName": row["company_name"]}


def student_summary(db: deps.Connection, user_id: int) -> dict[str, Any]:
    """Returns a student's id, name and headline, for embedding."""
    row = db.execute(
        "SELECT u.id, u.name, s.headline FROM student_profiles s "
        "JOIN users u ON u.id = s.user_id WHERE s.user_id = %s",
        (user_id,),
    ).fetchone()
    if not row:
        return {"id": user_id, "name": "Unknown student", "headline": None}
    return {"id": row["id"], "name": row["name"], "headline": row["headline"]}


def mentor_summary(db: deps.Connection, user_id: int) -> dict[str, Any]:
    """Returns a mentor's id, name and headline, for embedding."""
    row = db.execute(
        "SELECT u.id, u.name, m.headline FROM mentor_profiles m "
        "JOIN users u ON u.id = m.user_id WHERE m.user_id = %s",
        (user_id,),
    ).fetchone()
    if not row:
        return {"id": user_id, "name": "Unknown mentor", "headline": None}
    return {"id": row["id"], "name": row["name"], "headline": row["headline"]}


def student_skills(
    db: deps.Connection, student_id: int
) -> list[ai_schemas.Skill]:
    """Returns a student's skills, sorted by name."""
    rows = db.execute(
        "SELECT sk.id, sk.name FROM student_skills ss "
        "JOIN skills sk ON sk.id = ss.skill_id "
        "WHERE ss.student_id = %s ORDER BY sk.name",
        (student_id,),
    ).fetchall()
    return [ai_schemas.Skill(id=r["id"], name=r["name"]) for r in rows]


def mentor_skills(
    db: deps.Connection, mentor_id: int
) -> list[ai_schemas.Skill]:
    """Returns a mentor's skills, sorted by name."""
    rows = db.execute(
        "SELECT sk.id, sk.name FROM mentor_skills ms "
        "JOIN skills sk ON sk.id = ms.skill_id "
        "WHERE ms.mentor_id = %s ORDER BY sk.name",
        (mentor_id,),
    ).fetchall()
    return [ai_schemas.Skill(id=r["id"], name=r["name"]) for r in rows]


def ai_student_profile(
    db: deps.Connection, user_id: int
) -> ai_schemas.StudentProfile | None:
    """Returns a student as the AI module's profile, or None if missing."""
    row = db.execute(
        "SELECT u.id, u.name, s.headline, s.bio, s.availability, s.rating, "
        "s.interests, s.learning_goals "
        "FROM student_profiles s JOIN users u ON u.id = s.user_id "
        "WHERE s.user_id = %s",
        (user_id,),
    ).fetchone()
    if not row:
        return None
    return ai_schemas.StudentProfile(
        id=row["id"],
        name=row["name"],
        headline=row["headline"],
        bio=row["bio"],
        availability=row["availability"],
        rating=float(row["rating"]) if row["rating"] is not None else None,
        skills=student_skills(db, user_id),
        interests=list(row["interests"] or []),
        learning_goals=row["learning_goals"],
    )


def ai_mentor_profile(
    db: deps.Connection, user_id: int
) -> ai_schemas.MentorProfile | None:
    """Returns a mentor as the AI module's profile, or None if missing."""
    row = db.execute(
        "SELECT u.id, u.name, m.headline, m.bio, m.availability "
        "FROM mentor_profiles m JOIN users u ON u.id = m.user_id "
        "WHERE m.user_id = %s",
        (user_id,),
    ).fetchone()
    if not row:
        return None
    return ai_schemas.MentorProfile(
        id=row["id"],
        name=row["name"],
        headline=row["headline"],
        bio=row["bio"],
        availability=row["availability"],
        skills=mentor_skills(db, user_id),
    )


def all_ai_students(db: deps.Connection) -> list[ai_schemas.StudentProfile]:
    """Returns every student as the AI module's profile."""
    rows = db.execute("SELECT user_id FROM student_profiles").fetchall()
    profiles = [ai_student_profile(db, r["user_id"]) for r in rows]
    return [p for p in profiles if p is not None]


def all_ai_mentors(db: deps.Connection) -> list[ai_schemas.MentorProfile]:
    """Returns every mentor as the AI module's profile."""
    rows = db.execute("SELECT user_id FROM mentor_profiles").fetchall()
    profiles = [ai_mentor_profile(db, r["user_id"]) for r in rows]
    return [p for p in profiles if p is not None]


def brief_from_db(
    db: deps.Connection, project_id: int
) -> ai_schemas.Brief | None:
    """Returns a project's stored brief, or None if it hasn't been analyzed."""
    row = db.execute(
        "SELECT objectives, deliverables, scope FROM project_briefs "
        "WHERE project_id = %s",
        (project_id,),
    ).fetchone()
    if not row:
        return None
    skill_rows = db.execute(
        "SELECT sk.id, sk.name FROM project_brief_skills pbs "
        "JOIN skills sk ON sk.id = pbs.skill_id "
        "WHERE pbs.project_id = %s ORDER BY sk.name",
        (project_id,),
    ).fetchall()
    milestone_rows = db.execute(
        "SELECT title, due_date FROM milestones WHERE project_id = %s "
        "ORDER BY position",
        (project_id,),
    ).fetchall()
    return ai_schemas.Brief(
        objectives=list(row["objectives"] or []),
        deliverables=list(row["deliverables"] or []),
        suggested_skills=[
            ai_schemas.Skill(id=r["id"], name=r["name"]) for r in skill_rows
        ],
        milestones=[
            ai_schemas.Milestone(
                title=m["title"],
                due_date=str(m["due_date"]) if m["due_date"] else None,
            )
            for m in milestone_rows
        ],
        scope=row["scope"] or "",
    )


def brief_out(brief: ai_schemas.Brief) -> dict[str, Any]:
    """Returns a brief in the API's JSON shape."""
    return {
        "objectives": brief.objectives,
        "deliverables": brief.deliverables,
        "suggestedSkills": [s.model_dump() for s in brief.suggested_skills],
        "milestones": [
            {"title": m.title, "dueDate": m.due_date} for m in brief.milestones
        ],
        "scope": brief.scope,
    }


def persist_brief(
    db: deps.Connection, project_id: int, brief: ai_schemas.Brief
) -> None:
    """Saves a brief, replacing any earlier one for the project."""
    with db.transaction():
        db.execute(
            "INSERT INTO project_briefs "
            "(project_id, objectives, deliverables, scope) "
            "VALUES (%s, %s, %s, %s) "
            "ON CONFLICT (project_id) DO UPDATE SET "
            "objectives = EXCLUDED.objectives, "
            "deliverables = EXCLUDED.deliverables, "
            "scope = EXCLUDED.scope, analyzed_at = now()",
            (
                project_id,
                psycopg_json.Json(brief.objectives),
                psycopg_json.Json(brief.deliverables),
                brief.scope,
            ),
        )
        db.execute(
            "DELETE FROM project_brief_skills WHERE project_id = %s",
            (project_id,),
        )
        for skill in brief.suggested_skills:
            db.execute(
                "INSERT INTO project_brief_skills (project_id, skill_id) "
                "VALUES (%s, %s)",
                (project_id, skill.id),
            )
        db.execute(
            "DELETE FROM milestones WHERE project_id = %s", (project_id,)
        )
        for position, milestone in enumerate(brief.milestones):
            db.execute(
                "INSERT INTO milestones "
                "(project_id, title, due_date, position) "
                "VALUES (%s, %s, %s, %s)",
                (project_id, milestone.title, milestone.due_date, position),
            )
