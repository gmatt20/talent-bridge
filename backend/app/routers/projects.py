from __future__ import annotations

import psycopg
from fastapi import APIRouter, Depends, HTTPException

from app import ai

from .. import repo
from .. import schemas as s
from ..deps import get_current_user, get_db, require_role

router = APIRouter()


def project_summary_out(db: psycopg.Connection, row: dict) -> dict:
    count = db.execute(
        "SELECT count(*) AS n FROM proposals WHERE project_id = %s", (row["id"],)
    ).fetchone()["n"]
    return {
        "id": row["id"],
        "title": row["title"],
        "description": row["description"],
        "deadline": str(row["deadline"]) if row["deadline"] else None,
        "category": row["category"],
        "status": row["status"],
        "organization": repo.organization_summary(db, row["organization_id"]),
        "proposalCount": count,
    }


def project_detail_out(db: psycopg.Connection, row: dict) -> dict:
    out = project_summary_out(db, row)
    brief = repo.brief_from_db(db, row["id"])
    out["brief"] = repo.brief_out(brief) if brief else None
    return out


def _find_project(db: psycopg.Connection, project_id: int) -> dict:
    row = db.execute("SELECT * FROM projects WHERE id = %s", (project_id,)).fetchone()
    if not row:
        raise HTTPException(404, "Project not found.")
    return row


def _require_owner(db: psycopg.Connection, project_id: int, user: dict) -> dict:
    if user["role"] != "organization":
        raise HTTPException(403, "Only organizations can do this.")
    row = _find_project(db, project_id)
    if row["organization_id"] != user["id"]:
        raise HTTPException(403, "This project belongs to another organization.")
    return row


@router.get("/api/projects", response_model=dict)
def list_projects(db: psycopg.Connection = Depends(get_db)):
    rows = db.execute("SELECT * FROM projects WHERE status = 'open' ORDER BY created_at DESC").fetchall()
    return {"items": [project_summary_out(db, r) for r in rows]}


@router.post("/api/projects", response_model=s.ProjectOut, status_code=201)
def create_project(
    body: s.CreateProjectRequest,
    user: dict = Depends(require_role("organization")),
    db: psycopg.Connection = Depends(get_db),
):
    title = body.title.strip()
    description = body.description.strip()
    if not title:
        raise HTTPException(400, "Title is required.")
    if not description:
        raise HTTPException(400, "Description is required.")
    row = db.execute(
        "INSERT INTO projects (organization_id, title, description, deadline, category) "
        "VALUES (%s, %s, %s, %s, %s) RETURNING *",
        (user["id"], title, description, body.deadline, body.category),
    ).fetchone()
    return project_detail_out(db, row)


@router.get("/api/projects/{project_id}", response_model=s.ProjectOut)
def get_project(project_id: int, db: psycopg.Connection = Depends(get_db)):
    return project_detail_out(db, _find_project(db, project_id))


@router.post("/api/projects/{project_id}/analyze", response_model=s.ProjectBriefOut)
def analyze_project(
    project_id: int,
    user: dict = Depends(get_current_user),
    db: psycopg.Connection = Depends(get_db),
):
    row = _require_owner(db, project_id, user)
    catalog = repo.skill_catalog(db)
    brief = ai.analyze_project(
        title=row["title"],
        description=row["description"],
        skills_catalog=catalog,
        deadline=str(row["deadline"]) if row["deadline"] else None,
    )
    repo.persist_brief(db, project_id, brief)
    return repo.brief_out(brief)


@router.get("/api/projects/{project_id}/recommendations", response_model=s.ProjectRecommendationsOut)
def project_recommendations(
    project_id: int,
    user: dict = Depends(get_current_user),
    db: psycopg.Connection = Depends(get_db),
):
    _require_owner(db, project_id, user)
    brief = repo.brief_from_db(db, project_id)
    if brief is None:
        raise HTTPException(409, "Analyze this project before requesting recommendations.")

    students = repo.all_ai_students(db)
    mentors = repo.all_ai_mentors(db)
    student_recs = ai.recommend_students(brief, students)
    mentor_recs = ai.recommend_mentors(brief, mentors)
    return {
        "students": [
            {
                "student": {"id": r.student.id, "name": r.student.name, "headline": r.student.headline},
                "matchScore": r.match_score,
                "reasons": r.reasons,
            }
            for r in student_recs
        ],
        "mentors": [
            {
                "mentor": {"id": r.mentor.id, "name": r.mentor.name, "headline": r.mentor.headline},
                "matchScore": r.match_score,
                "reasons": r.reasons,
            }
            for r in mentor_recs
        ],
    }


def _proposal_out(db: psycopg.Connection, row: dict) -> dict:
    student = db.execute(
        "SELECT u.name, s.rating FROM student_profiles s JOIN users u ON u.id = s.user_id WHERE s.user_id = %s",
        (row["student_id"],),
    ).fetchone()
    return {
        "id": row["id"],
        "coverLetter": row["cover_letter"],
        "status": row["status"],
        "createdAt": repo.to_iso(row["created_at"]),
        "student": {
            "id": row["student_id"],
            "name": student["name"] if student else "Unknown student",
            "rating": float(student["rating"]) if student and student["rating"] is not None else None,
            "skills": [sk.model_dump() for sk in repo.student_skills(db, row["student_id"])],
        },
    }


@router.post("/api/projects/{project_id}/proposals", response_model=s.ProposalOut, status_code=201)
def create_proposal(
    project_id: int,
    body: s.CreateProposalRequest,
    user: dict = Depends(require_role("student")),
    db: psycopg.Connection = Depends(get_db),
):
    project = _find_project(db, project_id)
    if project["status"] != "open":
        raise HTTPException(409, "This project is no longer accepting applications.")
    existing = db.execute(
        "SELECT 1 FROM proposals WHERE project_id = %s AND student_id = %s", (project_id, user["id"])
    ).fetchone()
    if existing:
        raise HTTPException(409, "You've already applied to this project.")
    cover_letter = body.coverLetter.strip()
    if not cover_letter:
        raise HTTPException(400, "Cover letter is required.")
    row = db.execute(
        "INSERT INTO proposals (project_id, student_id, cover_letter) VALUES (%s, %s, %s) RETURNING *",
        (project_id, user["id"], cover_letter),
    ).fetchone()
    return _proposal_out(db, row)


@router.get("/api/projects/{project_id}/proposals", response_model=list[s.ProposalOut])
def list_proposals(
    project_id: int,
    user: dict = Depends(get_current_user),
    db: psycopg.Connection = Depends(get_db),
):
    _require_owner(db, project_id, user)
    rows = db.execute(
        "SELECT * FROM proposals WHERE project_id = %s ORDER BY created_at", (project_id,)
    ).fetchall()
    return [_proposal_out(db, r) for r in rows]


@router.post("/api/proposals/{proposal_id}/accept", response_model=s.AcceptProposalResponseOut)
def accept_proposal(
    proposal_id: int,
    user: dict = Depends(get_current_user),
    db: psycopg.Connection = Depends(get_db),
):
    proposal = db.execute("SELECT * FROM proposals WHERE id = %s", (proposal_id,)).fetchone()
    if not proposal:
        raise HTTPException(404, "Application not found.")
    project = _require_owner(db, proposal["project_id"], user)
    if project["status"] != "open":
        raise HTTPException(409, "A student has already been selected for this project.")

    with db.transaction():
        db.execute("UPDATE proposals SET status = 'accepted' WHERE id = %s", (proposal_id,))
        db.execute(
            "UPDATE proposals SET status = 'rejected' WHERE project_id = %s AND id != %s AND status = 'pending'",
            (project["id"], proposal_id),
        )
        db.execute("UPDATE projects SET status = 'in_progress' WHERE id = %s", (project["id"],))

    return {
        "id": proposal_id,
        "status": "accepted",
        "projectId": project["id"],
        "student": repo.student_summary(db, proposal["student_id"]),
    }


@router.post("/api/projects/{project_id}/mentors", response_model=s.JoinMentorResponseOut, status_code=201)
def join_as_mentor(
    project_id: int,
    body: s.JoinMentorRequest,
    user: dict = Depends(require_role("mentor")),
    db: psycopg.Connection = Depends(get_db),
):
    _find_project(db, project_id)
    db.execute(
        "INSERT INTO project_mentors (project_id, mentor_id, note) VALUES (%s, %s, %s) "
        "ON CONFLICT (project_id, mentor_id) DO UPDATE SET note = EXCLUDED.note, status = 'joined'",
        (project_id, user["id"], body.note),
    )
    return {"projectId": project_id, "mentor": {"id": user["id"], "name": user["name"]}, "status": "joined"}


@router.get("/api/projects/{project_id}/team", response_model=s.TeamOut)
def get_team(project_id: int, db: psycopg.Connection = Depends(get_db)):
    project = _find_project(db, project_id)
    accepted = db.execute(
        "SELECT student_id FROM proposals WHERE project_id = %s AND status = 'accepted'", (project_id,)
    ).fetchone()
    mentor_link = db.execute(
        "SELECT mentor_id FROM project_mentors WHERE project_id = %s AND status = 'joined' LIMIT 1",
        (project_id,),
    ).fetchone()
    return {
        "project": {"id": project["id"], "title": project["title"], "status": project["status"]},
        "organization": repo.organization_summary(db, project["organization_id"]),
        "student": repo.student_summary(db, accepted["student_id"]) if accepted else None,
        "mentor": repo.mentor_summary(db, mentor_link["mentor_id"]) if mentor_link else None,
    }
