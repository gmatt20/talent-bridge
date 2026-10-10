# Talent Bridge

AI-powered community innovation platform connecting businesses/nonprofits, students, and mentors — built for OCC Hacks.

## Structure

- `frontend/` — React + TypeScript (Vite)
- `backend/` — Pure Python (stdlib `http.server`, uv-managed)

## Running locally

### Backend

```sh
cd backend
uv sync
uv run python -m app.main
```

### Frontend

```sh
cd frontend
npm install
npm run dev
```
## API Reference

### Auth & Users

- `POST /api/auth/register` — `{role, email, password, name}`
- `POST /api/auth/login` — `{email, password}` → returns `{accessToken, refreshToken, user: {...}}`
- `POST /api/auth/refresh` — `{refreshToken}` → returns `{accessToken, refreshToken}`
- `POST /api/auth/logout` — `{refreshToken}`
- `GET /api/users/me` → returns `{id, role, email, name, avatarUrl, createdAt}`
- `PUT /api/users/me` — `{name, email, avatarUrl}`

### Student profiles & skills

- `GET /api/students/{id}` → returns `{id, name, headline, bio, avatarUrl, hourlyRate, availability, rating, completedProjects, skills: [{id, name}], portfolio: [], education: []}`
- `PUT /api/students/{id}` — `{bio, headline, portfolioUrl, resumeUrl, hourlyRate, availability}`
- `GET /api/skills?q=` → returns `[{id, name, category}]`
- `PUT /api/students/{id}/skills` — `{skillIds: []}`

### Businesses

- `GET /api/businesses/{id}` → returns `{id, companyName, description, website, logoUrl, rating, verified, totalProjectsPosted, reviews: []}`
- `PUT /api/businesses/{id}` — `{companyName, description, website, logoUrl}`
- `POST /api/businesses/{id}/verify` — `{taxId, paymentMethod}`

### Projects

- `POST /api/projects` — `{title, description, budget, budgetType, requiredSkills: [], deadline, category}`
- `GET /api/projects` → returns `{items: [{id, title, description, budget, budgetType, requiredSkills, deadline, status, business: {id, companyName, rating}, proposalCount}], total, page, limit}`
- `GET /api/projects/{id}` → returns `{id, title, description, budget, budgetType, requiredSkills, deadline, status, createdAt, business: {id, companyName, rating, verified}}`
- `PUT /api/projects/{id}` — `{title, description, budget, requiredSkills, deadline}`
- `DELETE /api/projects/{id}` — path: `id`
- `POST /api/projects/{id}/close` / `reopen` — path: `id`, body: `{reason?}`

### Proposals

- `POST /api/projects/{id}/proposals` — `{amount, coverLetter, durationDays, milestones?: []}`
- `GET /api/projects/{id}/proposals` → returns `[{id, amount, coverLetter, durationDays, status, student: {id, name, rating, skills}, createdAt}]`
- `PUT /api/proposals/{id}` — `{amount, coverLetter}`
- `POST /api/proposals/{id}/accept` — `{contractTerms?}`

### Contracts & milestones

- `GET /api/contracts` → returns `{items: [{id, projectId, projectTitle, client, freelancer, totalAmount, status, startDate}], total, page}`
- `GET /api/contracts/{id}` → returns `{id, projectId, client, freelancer, totalAmount, status, milestones: [{id, title, amount, dueDate, status}], createdAt}`
- `POST /api/contracts/{id}/milestones` — `{title, amount, dueDate}`
- `PUT /api/milestones/{id}/status` — `{status: submitted|approved|paid, note?}`
- `POST /api/contracts/{id}/complete` — `{feedback?}`

### Payments

- `POST /api/payments/fund` — `{contractId, amount, paymentMethodId}`
- `GET /api/payments/transactions` → returns `{items: [{id, contractId, amount, type: escrow|release|refund, status, createdAt}], total, page}`

### Messaging

- `POST /api/messages` — `{conversationId?, recipientId, body}`
- `GET /api/conversations` → returns `[{id, otherUser: {id, name, avatarUrl}, lastMessage: {body, sentAt}, unreadCount}]`
- `GET /api/conversations/{id}/messages` → returns `{items: [{id, senderId, body, sentAt, readAt?}], nextCursor?}`

### Reviews

- `POST /api/contracts/{id}/review` — `{rating (1-5), comment}`
