# Talent Bridge — Master Plan

## Context

Talent Bridge is an AI-powered community collaboration platform built for
OCC Hacks, inspired by the Community Innovations Foundation (CIF) and its
Innovators Lab. CIF already connects businesses, students, and mentors —
our goal is to make that existing process easier, faster, and more
accessible with technology, not to replace it.

This is a **community platform run by volunteers**

## The Problem

Students, businesses, and mentors have different backgrounds, technical
capability, and needs. Discovering projects, communicating requirements,
finding the right collaborators, and coordinating participation all
introduce friction. We reduce that friction through one unified platform.

## The Solution — Three Sides

- **Businesses & Nonprofits** — create an org profile, submit a project
  challenge in plain language, discover and collaborate with students
  and mentors.
- **Students** — showcase skills/interests/learning goals, discover
  real projects, get AI-powered recommendations, collaborate with the org.
- **Mentors** _(optional / stretch — not in core MVP)_ — showcase
  expertise and availability, discover aligned projects, guide student
  teams.

## How AI Helps

AI is a facilitator, not a decision-maker — people always make the final
call.

- **Requirements analysis** — turn a business's plain-language challenge
  into a structured project brief.
- **Student matchmaking** — recommend projects to students based on
  skills, interests, and learning goals.
- **Mentor matchmaking** _(stretch)_ — connect teams with aligned
  professional expertise.
- **Explainable recommendations** — every match includes a rationale, not
  just a score.

## Hackathon Goal (core MVP user journey)

**Business submits a challenge → AI structures the requirements → AI
recommends matching students → student applies/is selected → team is
formed.**

Mentor matching/assignment is an optional layer on top once the core loop
works end-to-end — do not block the MVP on it.

## Guiding Principles

- Complement, don't replace — build on top of CIF's existing programs.
- Accessibility first — usable by non-technical business owners.
- Human-centered AI — AI recommends, people decide.
- Simplicity — remove steps, don't add process.
- Avoid unnecessary architectural complexity — this is a hackathon MVP.

## Tech Stack

- **Backend** — Python + FastAPI, no ORM. Postgres access via either plain
  `psycopg` (direct TCP, needs the bastion SSH tunnel) or the RDS Data API
  (signed HTTPS, needs only AWS credentials) — see ARCHITECTURE.md. AWS
  Bedrock calls via `boto3`.
- **Frontend** — React + TypeScript (Vite), Tailwind CSS v4, shadcn/ui
- **AWS** — Bedrock for AI matchmaking/requirement-structuring; a shared
  Aurora PostgreSQL cluster (`talent-bridge`, us-west-2) for persistence

## API Contract

The full REST contract lives in [ARCHITECTURE.md](./ARCHITECTURE.md)'s API
Reference section — treat it as canonical and don't duplicate the JSON
shapes here; this is just the index so the contract doesn't get lost in the
file. Build order:

1. **Auth & Users** — register/login (`role`: `organization` | `student` |
   `mentor`), bearer token, `GET /api/users/me`.
2. **Profiles & Skills** — student/organization profile read/update, skill
   search for tagging.
3. **Projects** — organizations submit challenges; list/detail; detail
   includes the AI-structured brief once analyzed.
4. **AI** — `POST /api/projects/{id}/analyze` (raw requirements → structured
   brief), `GET /api/students/me/recommendations` (AI-matched projects for a
   student), `GET /api/projects/{id}/recommendations` (matched students +
   mentors for a project) — every match includes a `matchScore` and `reasons`.
5. **Apply & Team** — students submit proposals, organizations accept them
   (team formation begins), mentors join via `POST /api/projects/{id}/mentors`,
   `GET /api/projects/{id}/team` returns the assembled team.

No payments, contracts/milestones, escrow, messaging, or reviews anywhere in
this contract — keep it that way.

## Team & Roles

Four engineers, clear ownership boundaries, shared contracts instead of
duplicated data structures. Every role follows the same discipline:
review existing work → identify integration points → ask concise
questions → propose a plan → wait for confirmation before implementing.

### Frontend Engineer — UI/UX Lead

- Builds the responsive frontend: React, TypeScript, Vite, Tailwind,
  shadcn/ui.
- Onboarding flows and dashboards for businesses and students (mentor
  dashboard is stretch).
- Reusable components: profile cards, project/challenge cards,
  application forms, recommendation displays, team-formation UI.
- Integrates with the backend through a dedicated API service layer and
  shared TypeScript types — never hardcoded API responses in components.
- Visual direction: reference CIF (cifdn.org) branding (colors/typography)
  while building an original, modern interface. Prioritize intuitive nav,
  accessibility, and a demo that looks polished.

### Backend Engineer — Infrastructure Lead

- FastAPI REST API. Postgres schema for users/orgs, challenges, students,
  mentors (optional), matches, teams — plain SQL, no ORM.
- AWS plumbing: Aurora PostgreSQL (shared cluster, Data API enabled), any
  file storage needed, deployment.
- Clear, consistent JSON request/response contracts, documented for the
  frontend and AI engineer to build against.
- Secrets via env vars only, never committed.

### AI/ML Engineer — Intelligence Lead

- Core differentiator of the product: AI-powered matchmaking.
- Python + AWS Bedrock (`boto3`) to: (1) turn a business's raw challenge
  description into a structured brief, (2) rank/recommend students by
  skills/interests/availability, (3) _(stretch)_ recommend mentors,
  (4) generate an explainable rationale per recommendation.
- Keep prompts, model config, and matching logic in separate, independently
  testable modules. Combine structured scoring with Bedrock reasoning —
  don't rely purely on LLM similarity scores.
- Return predictable, validated JSON. Handle bad model output or an
  unavailable service gracefully (never crash the request).
- Never log/expose AWS credentials or sensitive business info in responses.

### Full-Stack Engineer — Product & Integration Lead (this role)

- Owns the complete business → student → (optional mentor) → team workflow
  end to end.
- Implements challenge applications, student selection, team formation; and
  mentor assignment only once the core loop is solid.
- Integrates frontend components with backend APIs and AI matchmaking
  output.
- Coordinates all three other engineers on consistent interfaces and
  integration boundaries — defines and maintains the shared API contract
  so nobody builds against assumptions that conflict.
- Builds end-to-end tests covering the primary user journey and prepares
  realistic demo data.
- Helps prioritize MVP scope and remove blockers across the team.
- Stack: React + TypeScript (frontend side of integration), Python (backend
  side), AWS Bedrock integration through the backend's services — never
  calls Bedrock directly from the frontend.
