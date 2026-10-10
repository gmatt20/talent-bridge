"""Shared DB-row <-> domain-object helpers used by the routers.

Keeps the ai.* object construction and the brief persistence logic (the two
things Asher's AI module explicitly leaves to the HTTP layer) in one place
instead of scattered across routers.
"""

from __future__ import annotations

import psycopg
from psycopg.types.json import Json

from app import ai


def to_iso(value: object) -> str | None:
    """psycopg returns datetime objects; the Data API returns pre-formatted
    strings. Normalize either into an ISO string for the JSON response."""
    if value is None:
        return None
    if hasattr(value, "isoformat"):
        return value.isoformat()
    return str(value)


def skill_catalog(db: psycopg.Connection) -> list[ai.Skill]:
    rows = db.execute("SELECT id, name FROM skills ORDER BY name").fetchall()
    return [ai.Skill(id=r["id"], name=r["name"]) for r in rows]


def organization_summary(db: psycopg.Connection, user_id: int) -> dict:
    row = db.execute(
        "SELECT u.id, o.company_name FROM organizations o JOIN users u ON u.id = o.user_id WHERE o.user_id = %s",
        (user_id,),
    ).fetchone()
    if not row:
        return {"id": user_id, "companyName": "Unknown organization"}
    return {"id": row["id"], "companyName": row["company_name"]}


def student_summary(db: psycopg.Connection, user_id: int) -> dict:
    row = db.execute(
        "SELECT u.id, u.name, s.headline FROM student_profiles s JOIN users u ON u.id = s.user_id WHERE s.user_id = %s",
        (user_id,),
    ).fetchone()
    if not row:
        return {"id": user_id, "name": "Unknown student", "headline": None}
    return {"id": row["id"], "name": row["name"], "headline": row["headline"]}


def mentor_summary(db: psycopg.Connection, user_id: int) -> dict:
    row = db.execute(
        "SELECT u.id, u.name, m.headline FROM mentor_profiles m JOIN users u ON u.id = m.user_id WHERE m.user_id = %s",
        (user_id,),
    ).fetchone()
    if not row:
        return {"id": user_id, "name": "Unknown mentor", "headline": None}
    return {"id": row["id"], "name": row["name"], "headline": row["headline"]}


def student_skills(db: psycopg.Connection, student_id: int) -> list[ai.Skill]:
    rows = db.execute(
        "SELECT sk.id, sk.name FROM student_skills ss JOIN skills sk ON sk.id = ss.skill_id "
        "WHERE ss.student_id = %s ORDER BY sk.name",
        (student_id,),
    ).fetchall()
    return [ai.Skill(id=r["id"], name=r["name"]) for r in rows]


def mentor_skills(db: psycopg.Connection, mentor_id: int) -> list[ai.Skill]:
    rows = db.execute(
        "SELECT sk.id, sk.name FROM mentor_skills ms JOIN skills sk ON sk.id = ms.skill_id "
        "WHERE ms.mentor_id = %s ORDER BY sk.name",
        (mentor_id,),
    ).fetchall()
    return [ai.Skill(id=r["id"], name=r["name"]) for r in rows]


def ai_student_profile(db: psycopg.Connection, user_id: int) -> ai.StudentProfile | None:
    row = db.execute(
        "SELECT u.id, u.name, s.headline, s.bio, s.availability, s.rating, s.interests, s.learning_goals "
        "FROM student_profiles s JOIN users u ON u.id = s.user_id WHERE s.user_id = %s",
        (user_id,),
    ).fetchone()
    if not row:
        return None
    return ai.StudentProfile(
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


def ai_mentor_profile(db: psycopg.Connection, user_id: int) -> ai.MentorProfile | None:
    row = db.execute(
        "SELECT u.id, u.name, m.headline, m.bio, m.availability "
        "FROM mentor_profiles m JOIN users u ON u.id = m.user_id WHERE m.user_id = %s",
        (user_id,),
    ).fetchone()
    if not row:
        return None
    return ai.MentorProfile(
        id=row["id"],
        name=row["name"],
        headline=row["headline"],
        bio=row["bio"],
        availability=row["availability"],
        skills=mentor_skills(db, user_id),
    )


def all_ai_students(db: psycopg.Connection) -> list[ai.StudentProfile]:
    ids = [r["user_id"] for r in db.execute("SELECT user_id FROM student_profiles").fetchall()]
    return [p for uid in ids if (p := ai_student_profile(db, uid)) is not None]


def all_ai_mentors(db: psycopg.Connection) -> list[ai.MentorProfile]:
    ids = [r["user_id"] for r in db.execute("SELECT user_id FROM mentor_profiles").fetchall()]
    return [p for uid in ids if (p := ai_mentor_profile(db, uid)) is not None]


def brief_from_db(db: psycopg.Connection, project_id: int) -> ai.Brief | None:
    row = db.execute(
        "SELECT objectives, deliverables, scope FROM project_briefs WHERE project_id = %s",
        (project_id,),
    ).fetchone()
    if not row:
        return None
    skill_rows = db.execute(
        "SELECT sk.id, sk.name FROM project_brief_skills pbs JOIN skills sk ON sk.id = pbs.skill_id "
        "WHERE pbs.project_id = %s ORDER BY sk.name",
        (project_id,),
    ).fetchall()
    milestone_rows = db.execute(
        "SELECT title, due_date FROM milestones WHERE project_id = %s ORDER BY position",
        (project_id,),
    ).fetchall()
    return ai.Brief(
        objectives=list(row["objectives"] or []),
        deliverables=list(row["deliverables"] or []),
        suggested_skills=[ai.Skill(id=r["id"], name=r["name"]) for r in skill_rows],
        milestones=[
            ai.Milestone(title=m["title"], due_date=str(m["due_date"]) if m["due_date"] else None)
            for m in milestone_rows
        ],
        scope=row["scope"] or "",
    )


def brief_out(brief: ai.Brief) -> dict:
    return {
        "objectives": brief.objectives,
        "deliverables": brief.deliverables,
        "suggestedSkills": [s.model_dump() for s in brief.suggested_skills],
        "milestones": [{"title": m.title, "dueDate": m.due_date} for m in brief.milestones],
        "scope": brief.scope,
    }


def persist_brief(db: psycopg.Connection, project_id: int, brief: ai.Brief) -> None:
    with db.transaction():
        db.execute(
            "INSERT INTO project_briefs (project_id, objectives, deliverables, scope) "
            "VALUES (%s, %s, %s, %s) "
            "ON CONFLICT (project_id) DO UPDATE SET "
            "objectives = EXCLUDED.objectives, deliverables = EXCLUDED.deliverables, "
            "scope = EXCLUDED.scope, analyzed_at = now()",
            (project_id, Json(brief.objectives), Json(brief.deliverables), brief.scope),
        )
        db.execute("DELETE FROM project_brief_skills WHERE project_id = %s", (project_id,))
        for skill in brief.suggested_skills:
            db.execute(
                "INSERT INTO project_brief_skills (project_id, skill_id) VALUES (%s, %s)",
                (project_id, skill.id),
            )
        db.execute("DELETE FROM milestones WHERE project_id = %s", (project_id,))
        for position, m in enumerate(brief.milestones):
            db.execute(
                "INSERT INTO milestones (project_id, title, due_date, position) VALUES (%s, %s, %s, %s)",
                (project_id, m.title, m.due_date, position),
            )
