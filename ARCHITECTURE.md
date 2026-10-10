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

### Google sign-in (optional)

The login and register pages show a "Sign in with Google" button when an
OAuth client ID is configured, next to email and password.

1. In the Google Cloud Console, open **APIs & Services → Credentials** and
   create an **OAuth client ID** of type **Web application**.
2. Add the app's URL (`http://localhost:5173` for local development) under
   **Authorized JavaScript origins**. No redirect URI or client secret is
   needed.
3. Put the client ID in both `.env` files, then restart both servers:
   `GOOGLE_CLIENT_ID=...` in `backend/.env` and `VITE_GOOGLE_CLIENT_ID=...` in
   `frontend/.env`.

The client ID is public. Leaving it empty hides the button and turns the
endpoint off.

## API Reference

All endpoints require `Authorization: Bearer <token>` except `register`, `login` and `google`.

### Auth & Users

**`POST /api/auth/register`** — Create an account.

```json
// request
{ "role": "organization", "email": "info@habitatoc.org", "password_hash": "pass1234", "name": "Habitat for Humanity OC" }
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

**Errors**

```json
// 401 — no such user, or password doesn't match
{ "error": "Invalid email or password." }

// 422 — malformed body
{ "error": "email: Field required" }
```

**`POST /api/auth/google`** — Sign in with Google, creating the account on first use.

`credential` is the ID token from Google's sign-in button. The backend
verifies it and matches the account by its Google email, so someone who
registered with that email and a password signs in to the same account.
`role` and `name` are only used when the email has no account yet; `name`
defaults to the Google profile name. Accounts created this way have no
password.

```json
// request
{ "credential": "eyJhbGciOi...", "role": "student", "name": "Ana Reyes" }
// role and name are optional

// response 200
{ "token": "eyJhbGciOi...", "user": { "id": 2, "role": "student", "email": "ana@uci.edu", "name": "Ana Reyes" }, "isNewUser": true }
```

**Errors**

```json
// 400 — new account with an invalid role, or no name
{ "error": "Choose a role." }
{ "error": "Name is required." }

// 401 — the token is forged, expired or for another app, or the email is unverified
{ "error": "Google sign-in failed. Please try again." }

// 404 — no account for this email, and no role was sent to create one
{ "error": "No account uses this Google email yet. Create an account to continue." }

// 409 — new account whose name is taken
{ "error": "An account with this name already exists." }

// 503 — GOOGLE_CLIENT_ID is not set on the server
{ "error": "Google sign-in is not set up yet." }
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

**Errors**

```json
// 404 — a skillId doesn't exist in the skills catalog
{ "error": "Skill 999 not found." }
```

**`GET /api/students/{id}`** — Public student profile.

```json
// response 200
{ "id": 2, "name": "Ana Reyes", "headline": "CS student at UCI", "bio": "Passionate about web dev and community impact.", "availability": "10 hrs/week", "rating": 4.8, "skills": [{ "id": 1, "name": "React" }, { "id": 4, "name": "Python" }] }
```

**Errors**

```json
// 404 — no student with this id
{ "error": "Student not found." }
```

**`GET /api/organizations/{id}`** — Public organization profile.

```json
// response 200
{ "id": 1, "companyName": "Habitat for Humanity OC", "description": "We build affordable housing across Orange County.", "website": "https://habitatoc.org", "totalProjectsPosted": 3 }
```

**Errors**

```json
// 404 — no organization with this id
{ "error": "Organization not found." }
```

**`PUT /api/organizations/me`** — Update own organization profile (organization only).

```json
// request
{ "companyName": "Habitat for Humanity OC", "description": "We build affordable housing across Orange County.", "website": "https://habitatoc.org" }

// response 200
{ "id": 1, "companyName": "Habitat for Humanity OC", "description": "We build affordable housing across Orange County.", "website": "https://habitatoc.org", "totalProjectsPosted": 3 }
```

**Errors**

```json
// 400 — website doesn't look like a URL
{ "error": "Please enter a valid website URL." }
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

**Errors**

```json
// 400 — deadline isn't a YYYY-MM-DD date
{ "error": "Please use a valid date in YYYY-MM-DD format." }
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

**Errors**

```json
// 404 — no project with this id
{ "error": "Project not found." }
```

### AI

**`POST /api/projects/{id}/analyze`** — Turn raw requirements into a structured brief (organization only).

```json
// response 200
{ "objectives": ["Let volunteers view and sign up for build days", "Reduce phone coordination time"], "deliverables": ["Sign-up form", "Admin view of volunteer roster"], "suggestedSkills": [{ "id": 1, "name": "React" }, { "id": 4, "name": "Python" }], "milestones": [{ "title": "Design sign-up flow", "dueDate": "2026-10-24" }, { "title": "Build MVP", "dueDate": "2026-11-14" }], "scope": "3-month project, ~10 hrs/week" }
```

**Errors**

```json
// 404 — no project with this id
{ "error": "Project not found." }
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

**Errors**

```json
// 404 — no project with this id
{ "error": "Project not found." }
```

### Apply & Team

**`POST /api/projects/{id}/proposals`** — Student applies to a project.

```json
// request
{ "coverLetter": "I've built similar booking flows in class projects and would love to help Habitat OC save time." }

// response 201
{ "id": 21, "coverLetter": "I've built similar booking flows in class projects...", "status": "pending", "student": { "id": 2, "name": "Ana Reyes" }, "createdAt": "2026-10-10T12:00:00Z" }
```

**Errors**

```json
// 404 — no project with this id
{ "error": "Project not found." }
```

**`GET /api/projects/{id}/proposals`** — Pending applications (organization only).

```json
// response 200
[{ "id": 21, "coverLetter": "I've built similar booking flows in class projects...", "status": "pending", "student": { "id": 2, "name": "Ana Reyes", "rating": 4.8, "skills": [{ "id": 1, "name": "React" }] }, "createdAt": "2026-10-10T12:00:00Z" }]
```

**Errors**

```json
// 404 — no project with this id
{ "error": "Project not found." }
```

**`POST /api/proposals/{id}/accept`** — Organization accepts a student; team formation begins.

```json
// response 200
{ "id": 21, "status": "accepted", "projectId": 10, "student": { "id": 2, "name": "Ana Reyes" } }
```

**Errors**

```json
// 404 — no application with this id
{ "error": "Application not found." }
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

**Errors**

```json
// 404 — no project with this id
{ "error": "Project not found." }
```
