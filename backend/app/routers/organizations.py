"""Organization profiles and an organization's own projects."""

import re
from typing import Any

import fastapi

from app import deps
from app import schemas
from app.routers import projects

router = fastapi.APIRouter()

URL_RE = re.compile(r"^https?://[^\s]+$")


def _organization_out(db: deps.Connection, org_id: int) -> dict[str, Any]:
    row = db.execute(
        "SELECT u.id, o.company_name, o.description, o.website "
        "FROM organizations o JOIN users u ON u.id = o.user_id "
        "WHERE o.user_id = %s",
        (org_id,),
    ).fetchone()
    if not row:
        raise fastapi.HTTPException(
            status_code=404, detail="Organization not found."
        )
    total = db.execute(
        "SELECT count(*) AS n FROM projects WHERE organization_id = %s",
        (org_id,),
    ).fetchone()["n"]
    return {
        "id": row["id"],
        "companyName": row["company_name"],
        "description": row["description"],
        "website": row["website"],
        "totalProjectsPosted": total,
    }


@router.get(
    "/api/organizations/{org_id}", response_model=schemas.OrganizationOut
)
def get_organization(org_id: int, db: deps.Db) -> dict[str, Any]:
    """Returns an organization's public profile."""
    return _organization_out(db, org_id)


@router.put("/api/organizations/me", response_model=schemas.OrganizationOut)
def update_me(
    body: schemas.UpdateOrganizationRequest,
    user: deps.Organization,
    db: deps.Db,
) -> dict[str, Any]:
    """Updates the signed-in organization's profile."""
    website = body.website.strip() if body.website else None
    if website and not URL_RE.match(website):
        raise fastapi.HTTPException(
            status_code=400, detail="Please enter a valid website URL."
        )
    db.execute(
        "UPDATE organizations SET company_name = %s, description = %s, "
        "website = %s WHERE user_id = %s",
        (body.company_name, body.description, website, user["id"]),
    )
    return _organization_out(db, user["id"])


@router.get("/api/organizations/me/projects", response_model=dict)
def my_projects(user: deps.Organization, db: deps.Db) -> dict[str, Any]:
    """Lists the signed-in organization's projects, newest first."""
    rows = db.execute(
        "SELECT * FROM projects WHERE organization_id = %s "
        "ORDER BY created_at DESC",
        (user["id"],),
    ).fetchall()
    return {"items": [projects.project_summary_out(db, r) for r in rows]}
