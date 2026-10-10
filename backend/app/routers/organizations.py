from __future__ import annotations

import psycopg
from fastapi import APIRouter, Depends, HTTPException

from .. import schemas as s
from ..deps import get_db, require_role

router = APIRouter()


@router.get("/api/organizations/{org_id}", response_model=s.OrganizationOut)
def get_organization(org_id: int, db: psycopg.Connection = Depends(get_db)):
    row = db.execute(
        "SELECT u.id, o.company_name, o.description, o.website FROM organizations o "
        "JOIN users u ON u.id = o.user_id WHERE o.user_id = %s",
        (org_id,),
    ).fetchone()
    if not row:
        raise HTTPException(404, "Organization not found.")
    total = db.execute(
        "SELECT count(*) AS n FROM projects WHERE organization_id = %s", (org_id,)
    ).fetchone()["n"]
    return {
        "id": row["id"],
        "companyName": row["company_name"],
        "description": row["description"],
        "website": row["website"],
        "totalProjectsPosted": total,
    }


@router.put("/api/organizations/me", response_model=s.OrganizationOut)
def update_me(
    body: s.UpdateOrganizationRequest,
    user: dict = Depends(require_role("organization")),
    db: psycopg.Connection = Depends(get_db),
):
    db.execute(
        "UPDATE organizations SET company_name = %s, description = %s, website = %s WHERE user_id = %s",
        (body.companyName, body.description, body.website, user["id"]),
    )
    return get_organization(user["id"], db)


@router.get("/api/organizations/me/projects", response_model=dict)
def my_projects(
    user: dict = Depends(require_role("organization")),
    db: psycopg.Connection = Depends(get_db),
):
    from .projects import project_summary_out

    rows = db.execute(
        "SELECT * FROM projects WHERE organization_id = %s ORDER BY created_at DESC", (user["id"],)
    ).fetchall()
    return {"items": [project_summary_out(db, r) for r in rows]}
