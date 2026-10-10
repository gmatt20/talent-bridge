# Talent Bridge — Architecture

See [PLAN.md](./PLAN.md) for the vision, team roles, and MVP scope. This
file covers project structure, local setup, and the API contract.

## Structure

- `frontend/` — React + TypeScript (Vite)
- `backend/` — Python + FastAPI (uv-managed), Postgres via either `psycopg`
  (direct TCP) or the RDS Data API (`app/dataapi.py`) — see below.

## Running locally

### Backend

Connects to the shared Aurora PostgreSQL cluster (`talent-bridge`) over the
RDS Data API — signed HTTPS calls authenticated with your own AWS
credentials, so no VPC access or database port is needed.

```sh
aws login --profile <your-profile>
cd backend
cp .env.example .env   # fill in the RDS_* values
uv sync
uv run python -m app.scripts.load_schema   # first time, or after a schema change
uv run python -m app.scripts.seed_skills   # first time — loads the skills catalog
uv run uvicorn app.main:app --env-file .env --reload
```

To work offline instead, set `DB_MODE=psycopg` and point `DATABASE_URL` at a
local Postgres:

```sh
brew install postgresql@17
brew services start postgresql@17
createdb talent_bridge
cd backend
psql -d talent_bridge -f db/schema.sql
uv run python -m app.scripts.seed_skills
uv run uvicorn app.main:app --env-file .env --reload
```

### Frontend

```sh
cd frontend
npm install
npm run dev
```

Set `VITE_USE_MOCKS=false` in `frontend/.env` to point the frontend at the
real backend (default is `true`, using the in-browser mock API).

## API Reference

All endpoints require `Authorization: Bearer <token>` except `register` and `login`.

### Auth & Users

**`POST /api/auth/register`** — Create an account.

```json
// request
{ "role": "organization", "email": "info@habitatoc.org", "password": "pass1234", "name": "Habitat for Humanity OC" }
// role: "organization" | "student" | "mentor"

// response 201
{ "token": "eyJhbGciOi...", "user": { "id": 1, "role": "organization", "email": "info@habitatoc.org", "name": "Habitat for Humanity OC" } }
```

**Errors**

```json
// 400 — invalid role
{ "error": "Choose a role." }

// 400 — missing fields
{ "error": "Name is required." }
{ "error": "Email is required." }

// 400 — invalid email
{ "error": "Please enter a valid email address." }

// 400 — password too short
{ "error": "Password must be at least 8 characters." }

// 409 — duplicate account
{ "error": "An account with this email already exists." }
{ "error": "An account with this name already exists." }

// 422 — malformed body
{ "error": "email: Field required" }
```

**`POST /api/auth/login`** — Authenticate.

```json
// request
{ "email": "info@habitatoc.org", "password_hash": "pass1234" }

// response 200
{ "token": "eyJhbGciOi...", "user": { "id": 1, "role": "organization", "email": "info@habitatoc.org", "name": "Habitat for Humanity OC" } }
```

**`GET /api/users/me`** — Current user.

```json
// response 200
{ "id": 1, "role": "organization", "email": "info@habitatoc.org", "name": "Habitat for Humanity OC", "createdAt": "2026-10-10T12:00:00Z" }
```

### Profiles

**`PUT /api/students/me`** — Update own student profile (student only).

```json
// request
{ "headline": "CS student at UCI", "bio": "Passionate about web dev and community impact.", "availability": "10 hrs/week", "skillIds": [1, 4, 7] }

// response 200
{ "id": 2, "name": "Ana Reyes", "headline": "CS student at UCI", "bio": "Passionate about web dev and community impact.", "availability": "10 hrs/week", "skills": [{ "id": 1, "name": "React" }, { "id": 4, "name": "Python" }, { "id": 7, "name": "UI Design" }] }
```

**`GET /api/students/{id}`** — Public student profile.

```json
// response 200
{ "id": 2, "name": "Ana Reyes", "headline": "CS student at UCI", "bio": "Passionate about web dev and community impact.", "availability": "10 hrs/week", "rating": 4.8, "skills": [{ "id": 1, "name": "React" }, { "id": 4, "name": "Python" }] }
```

**`GET /api/organizations/{id}`** — Public organization profile.

```json
// response 200
{ "id": 1, "companyName": "Habitat for Humanity OC", "description": "We build affordable housing across Orange County.", "website": "https://habitatoc.org", "totalProjectsPosted": 3 }
```

**`PUT /api/organizations/me`** — Update own organization profile (organization only).

```json
// request
{ "companyName": "Habitat for Humanity OC", "description": "We build affordable housing across Orange County.", "website": "https://habitatoc.org" }

// response 200
{ "id": 1, "companyName": "Habitat for Humanity OC", "description": "We build affordable housing across Orange County.", "website": "https://habitatoc.org", "totalProjectsPosted": 3 }
```

**`GET /api/organizations/me/projects`** — Own projects, any status (organization only).

```json
// response 200
{ "items": [{ "id": 10, "title": "Volunteer Scheduling App", "status": "open", "organization": { "id": 1, "companyName": "Habitat for Humanity OC" }, "proposalCount": 2 }] }
```

### Skills

**`GET /api/skills?q=`** — Search skills for tagging.

```json
// GET /api/skills?q=web
// response 200
[{ "id": 1, "name": "React" }, { "id": 2, "name": "Web Development" }, { "id": 3, "name": "Figma" }]
```

### Projects

**`POST /api/projects`** — Submit a challenge (organization only).

```json
// request
{ "title": "Volunteer Scheduling App", "description": "We need a simple app so volunteers can see open build days and sign up. Currently we coordinate by phone, which takes hours each week.", "deadline": "2026-12-01", "category": "Web App" }

// response 201
{ "id": 10, "title": "Volunteer Scheduling App", "description": "We need a simple app so volunteers can see open build days and sign up...", "deadline": "2026-12-01", "category": "Web App", "status": "open", "organization": { "id": 1, "companyName": "Habitat for Humanity OC" } }
```

**`GET /api/projects`** — List open projects.

```json
// response 200
{ "items": [{ "id": 10, "title": "Volunteer Scheduling App", "description": "We need a simple app so volunteers can see open build days and sign up...", "deadline": "2026-12-01", "status": "open", "organization": { "id": 1, "companyName": "Habitat for Humanity OC" }, "proposalCount": 2 }] }
```

**`GET /api/projects/{id}`** — Project detail, includes AI-structured brief once analyzed.

```json
// response 200
{ "id": 10, "title": "Volunteer Scheduling App", "description": "We need a simple app so volunteers can see open build days and sign up...", "deadline": "2026-12-01", "category": "Web App", "status": "open", "organization": { "id": 1, "companyName": "Habitat for Humanity OC" }, "brief": { "objectives": ["Let volunteers view and sign up for build days"], "deliverables": ["Sign-up form", "Admin view of volunteer roster"], "suggestedSkills": [{ "id": 1, "name": "React" }, { "id": 4, "name": "Python" }], "milestones": [{ "title": "Design sign-up flow", "dueDate": "2026-10-24" }], "scope": "3-month project, ~10 hrs/week" } }
```

### AI

**`POST /api/projects/{id}/analyze`** — Turn raw requirements into a structured brief (organization only).

```json
// response 200
{ "objectives": ["Let volunteers view and sign up for build days", "Reduce phone coordination time"], "deliverables": ["Sign-up form", "Admin view of volunteer roster"], "suggestedSkills": [{ "id": 1, "name": "React" }, { "id": 4, "name": "Python" }], "milestones": [{ "title": "Design sign-up flow", "dueDate": "2026-10-24" }, { "title": "Build MVP", "dueDate": "2026-11-14" }], "scope": "3-month project, ~10 hrs/week" }
```

**`GET /api/students/me/recommendations`** — AI-matched projects for the current student.

```json
// response 200
{ "items": [{ "project": { "id": 10, "title": "Volunteer Scheduling App", "organization": { "id": 1, "companyName": "Habitat for Humanity OC" } }, "matchScore": 0.86, "reasons": ["Matches your React and Python skills", "Aligns with your interest in community impact"] }] }
```

**`GET /api/students/me/proposals`** — Own applications, across all projects (student only).

```json
// response 200
{ "items": [{ "id": 21, "coverLetter": "I've built similar booking flows...", "status": "pending", "createdAt": "2026-10-10T12:00:00Z", "project": { "id": 10, "title": "Volunteer Scheduling App" } }] }
```

**`GET /api/projects/{id}/recommendations`** — Recommended students and mentors for a project (organization only).

```json
// response 200
{ "students": [{ "student": { "id": 2, "name": "Ana Reyes", "headline": "CS student at UCI" }, "matchScore": 0.86, "reasons": ["Has React and Python skills", "Available 10 hrs/week"] }], "mentors": [{ "mentor": { "id": 5, "name": "David Kim", "headline": "Senior Engineer, 10 yrs web" }, "matchScore": 0.74, "reasons": ["Experience with scheduling systems"] }] }
```

### Apply & Team

**`POST /api/projects/{id}/proposals`** — Student applies to a project.

```json
// request
{ "coverLetter": "I've built similar booking flows in class projects and would love to help Habitat OC save time." }

// response 201
{ "id": 21, "coverLetter": "I've built similar booking flows in class projects...", "status": "pending", "student": { "id": 2, "name": "Ana Reyes" }, "createdAt": "2026-10-10T12:00:00Z" }
```

**`GET /api/projects/{id}/proposals`** — Pending applications (organization only).

```json
// response 200
[{ "id": 21, "coverLetter": "I've built similar booking flows in class projects...", "status": "pending", "student": { "id": 2, "name": "Ana Reyes", "rating": 4.8, "skills": [{ "id": 1, "name": "React" }] }, "createdAt": "2026-10-10T12:00:00Z" }]
```

**`POST /api/proposals/{id}/accept`** — Organization accepts a student; team formation begins.

```json
// response 200
{ "id": 21, "status": "accepted", "projectId": 10, "student": { "id": 2, "name": "Ana Reyes" } }
```

**`POST /api/projects/{id}/mentors`** — Mentor joins a project team (mentor only).

```json
// request
{ "note": "Happy to guide the student through the initial architecture." }

// response 201
{ "projectId": 10, "mentor": { "id": 5, "name": "David Kim" }, "status": "joined" }
```

**`GET /api/projects/{id}/team`** — Current project team.

```json
// response 200
{ "project": { "id": 10, "title": "Volunteer Scheduling App", "status": "in_progress" }, "organization": { "id": 1, "companyName": "Habitat for Humanity OC" }, "student": { "id": 2, "name": "Ana Reyes" }, "mentor": { "id": 5, "name": "David Kim" } }
```
