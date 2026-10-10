"""Projects, their AI briefs and recommendations, applications and teams."""

from typing import Any

import fastapi

from app import deps
from app import repo
from app import schemas
from app.ai import analyze
from app.ai import recommend

router = fastapi.APIRouter()


def project_summary_out(
    db: deps.Connection, row: dict[str, Any]
) -> dict[str, Any]:
    """Returns a project row in the API's list shape."""
    count = db.execute(
        "SELECT count(*) AS n FROM proposals WHERE project_id = %s",
        (row["id"],),
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


def project_detail_out(
    db: deps.Connection, row: dict[str, Any]
) -> dict[str, Any]:
    """Returns a project row with its brief, in the API's detail shape."""
    out = project_summary_out(db, row)
    brief = repo.brief_from_db(db, row["id"])
    out["brief"] = repo.brief_out(brief) if brief else None
    return out


def _find_project(db: deps.Connection, project_id: int) -> dict[str, Any]:
    row = db.execute(
        "SELECT * FROM projects WHERE id = %s", (project_id,)
    ).fetchone()
    if not row:
        raise fastapi.HTTPException(
            status_code=404, detail="Project not found."
        )
    return row


def _require_owner(
    db: deps.Connection, project_id: int, user: deps.User
) -> dict[str, Any]:
    if user["role"] != "organization":
        raise fastapi.HTTPException(
            status_code=403, detail="Only organizations can do this."
        )
    row = _find_project(db, project_id)
    if row["organization_id"] != user["id"]:
        raise fastapi.HTTPException(
            status_code=403,
            detail="This project belongs to another organization.",
        )
    return row


def _proposal_out(db: deps.Connection, row: dict[str, Any]) -> dict[str, Any]:
    student = db.execute(
        "SELECT u.name, s.rating FROM student_profiles s "
        "JOIN users u ON u.id = s.user_id WHERE s.user_id = %s",
        (row["student_id"],),
    ).fetchone()
    rating = None
    if student and student["rating"] is not None:
        rating = float(student["rating"])
    skills = repo.student_skills(db, row["student_id"])
    return {
        "id": row["id"],
        "coverLetter": row["cover_letter"],
        "status": row["status"],
        "createdAt": repo.to_iso(row["created_at"]),
        "student": {
            "id": row["student_id"],
            "name": student["name"] if student else "Unknown student",
            "rating": rating,
            "skills": [skill.model_dump() for skill in skills],
        },
    }


@router.get("/api/projects", response_model=dict)
def list_projects(db: deps.Db) -> dict[str, Any]:
    """Lists open projects, newest first."""
    rows = db.execute(
        "SELECT * FROM projects WHERE status = 'open' "
        "ORDER BY created_at DESC"
    ).fetchall()
    return {"items": [project_summary_out(db, r) for r in rows]}


@router.post(
    "/api/projects", response_model=schemas.ProjectOut, status_code=201
)
def create_project(
    body: schemas.CreateProjectRequest,
    user: deps.Organization,
    db: deps.Db,
) -> dict[str, Any]:
    """Submits a challenge for the signed-in organization."""
    title = body.title.strip()
    description = body.description.strip()
    if not title:
        raise fastapi.HTTPException(
            status_code=400, detail="Title is required."
        )
    if not description:
        raise fastapi.HTTPException(
            status_code=400, detail="Description is required."
        )
    row = db.execute(
        "INSERT INTO projects "
        "(organization_id, title, description, deadline, category) "
        "VALUES (%s, %s, %s, %s, %s) RETURNING *",
        (user["id"], title, description, body.deadline, body.category),
    ).fetchone()
    return project_detail_out(db, row)


@router.get("/api/projects/{project_id}", response_model=schemas.ProjectOut)
def get_project(project_id: int, db: deps.Db) -> dict[str, Any]:
    """Returns a project, with its AI brief once analyzed."""
    return project_detail_out(db, _find_project(db, project_id))


@router.post(
    "/api/projects/{project_id}/analyze", response_model=schemas.ProjectBriefOut
)
def analyze_project(
    project_id: int, user: deps.CurrentUser, db: deps.Db
) -> dict[str, Any]:
    """Asks the AI to structure the project's description into a brief."""
    row = _require_owner(db, project_id, user)
    brief = analyze.analyze_project(
        title=row["title"],
        description=row["description"],
        skills_catalog=repo.skill_catalog(db),
        deadline=str(row["deadline"]) if row["deadline"] else None,
    )
    repo.persist_brief(db, project_id, brief)
    return repo.brief_out(brief)


@router.get(
    "/api/projects/{project_id}/recommendations",
    response_model=schemas.ProjectRecommendationsOut,
)
def project_recommendations(
    project_id: int, user: deps.CurrentUser, db: deps.Db
) -> dict[str, Any]:
    """Lists the students and mentors the AI recommends for a project."""
    _require_owner(db, project_id, user)
    brief = repo.brief_from_db(db, project_id)
    if brief is None:
        raise fastapi.HTTPException(
            status_code=409,
            detail="Analyze this project before requesting recommendations.",
        )

    student_recs = recommend.recommend_students(brief, repo.all_ai_students(db))
    mentor_recs = recommend.recommend_mentors(brief, repo.all_ai_mentors(db))
    return {
        "students": [
            {
                "student": {
                    "id": r.student.id,
                    "name": r.student.name,
                    "headline": r.student.headline,
                },
                "matchScore": r.match_score,
                "reasons": r.reasons,
            }
            for r in student_recs
        ],
        "mentors": [
            {
                "mentor": {
                    "id": r.mentor.id,
                    "name": r.mentor.name,
                    "headline": r.mentor.headline,
                },
                "matchScore": r.match_score,
                "reasons": r.reasons,
            }
            for r in mentor_recs
        ],
    }


@router.post(
    "/api/projects/{project_id}/proposals",
    response_model=schemas.ProposalOut,
    status_code=201,
)
def create_proposal(
    project_id: int,
    body: schemas.CreateProposalRequest,
    user: deps.Student,
    db: deps.Db,
) -> dict[str, Any]:
    """Submits the signed-in student's application to an open project."""
    project = _find_project(db, project_id)
    if project["status"] != "open":
        raise fastapi.HTTPException(
            status_code=409,
            detail="This project is no longer accepting applications.",
        )
    existing = db.execute(
        "SELECT 1 FROM proposals WHERE project_id = %s AND student_id = %s",
        (project_id, user["id"]),
    ).fetchone()
    if existing:
        raise fastapi.HTTPException(
            status_code=409, detail="You've already applied to this project."
        )
    cover_letter = body.cover_letter.strip()
    if not cover_letter:
        raise fastapi.HTTPException(
            status_code=400, detail="Cover letter is required."
        )
    row = db.execute(
        "INSERT INTO proposals (project_id, student_id, cover_letter) "
        "VALUES (%s, %s, %s) RETURNING *",
        (project_id, user["id"], cover_letter),
    ).fetchone()
    return _proposal_out(db, row)


@router.get(
    "/api/projects/{project_id}/proposals",
    response_model=list[schemas.ProposalOut],
)
def list_proposals(
    project_id: int, user: deps.CurrentUser, db: deps.Db
) -> list[dict[str, Any]]:
    """Lists the applications to a project, oldest first, for its owner."""
    _require_owner(db, project_id, user)
    rows = db.execute(
        "SELECT * FROM proposals WHERE project_id = %s ORDER BY created_at",
        (project_id,),
    ).fetchall()
    return [_proposal_out(db, r) for r in rows]


@router.post(
    "/api/proposals/{proposal_id}/accept",
    response_model=schemas.AcceptProposalResponseOut,
)
def accept_proposal(
    proposal_id: int, user: deps.CurrentUser, db: deps.Db
) -> dict[str, Any]:
    """Accepts an application, rejects the others and starts the project."""
    proposal = db.execute(
        "SELECT * FROM proposals WHERE id = %s", (proposal_id,)
    ).fetchone()
    if not proposal:
        raise fastapi.HTTPException(
            status_code=404, detail="Application not found."
        )
    project = _require_owner(db, proposal["project_id"], user)
    if project["status"] != "open":
        raise fastapi.HTTPException(
            status_code=409,
            detail="A student has already been selected for this project.",
        )

    with db.transaction():
        db.execute(
            "UPDATE proposals SET status = 'accepted' WHERE id = %s",
            (proposal_id,),
        )
        db.execute(
            "UPDATE proposals SET status = 'rejected' "
            "WHERE project_id = %s AND id != %s AND status = 'pending'",
            (project["id"], proposal_id),
        )
        db.execute(
            "UPDATE projects SET status = 'in_progress' WHERE id = %s",
            (project["id"],),
        )

    return {
        "id": proposal_id,
        "status": "accepted",
        "projectId": project["id"],
        "student": repo.student_summary(db, proposal["student_id"]),
    }


@router.post(
    "/api/projects/{project_id}/mentors",
    response_model=schemas.JoinMentorResponseOut,
    status_code=201,
)
def join_as_mentor(
    project_id: int,
    body: schemas.JoinMentorRequest,
    user: deps.Mentor,
    db: deps.Db,
) -> dict[str, Any]:
    """Adds the signed-in mentor to a project's team."""
    _find_project(db, project_id)
    db.execute(
        "INSERT INTO project_mentors (project_id, mentor_id, note) "
        "VALUES (%s, %s, %s) "
        "ON CONFLICT (project_id, mentor_id) "
        "DO UPDATE SET note = EXCLUDED.note, status = 'joined'",
        (project_id, user["id"], body.note),
    )
    return {
        "projectId": project_id,
        "mentor": {"id": user["id"], "name": user["name"]},
        "status": "joined",
    }


@router.get("/api/projects/{project_id}/team", response_model=schemas.TeamOut)
def get_team(project_id: int, db: deps.Db) -> dict[str, Any]:
    """Returns the organization, accepted student and mentor of a project."""
    project = _find_project(db, project_id)
    accepted = db.execute(
        "SELECT student_id FROM proposals "
        "WHERE project_id = %s AND status = 'accepted'",
        (project_id,),
    ).fetchone()
    mentor_link = db.execute(
        "SELECT mentor_id FROM project_mentors "
        "WHERE project_id = %s AND status = 'joined' LIMIT 1",
        (project_id,),
    ).fetchone()
    student = None
    if accepted:
        student = repo.student_summary(db, accepted["student_id"])
    mentor = None
    if mentor_link:
        mentor = repo.mentor_summary(db, mentor_link["mentor_id"])
    return {
        "project": {
            "id": project["id"],
            "title": project["title"],
            "status": project["status"],
        },
        "organization": repo.organization_summary(
            db, project["organization_id"]
        ),
        "student": student,
        "mentor": mentor,
    }
