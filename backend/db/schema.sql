CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    role TEXT NOT NULL CHECK (role IN ('organization', 'student', 'mentor')),
    email CITEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE skills (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE organizations (
    user_id BIGINT PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    description TEXT,
    website TEXT
);

CREATE TABLE student_profiles (
    user_id BIGINT PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
    headline TEXT,
    bio TEXT,
    availability TEXT,
    rating NUMERIC(2, 1) CHECK (rating >= 0 AND rating <= 5),
    interests TEXT[] NOT NULL DEFAULT '{}',
    learning_goals TEXT
);

CREATE TABLE mentor_profiles (
    user_id BIGINT PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
    headline TEXT,
    bio TEXT,
    availability TEXT
);

CREATE TABLE student_skills (
    student_id BIGINT NOT NULL REFERENCES student_profiles (user_id) ON DELETE CASCADE,
    skill_id BIGINT NOT NULL REFERENCES skills (id) ON DELETE RESTRICT,
    PRIMARY KEY (student_id, skill_id)
);

CREATE TABLE mentor_skills (
    mentor_id BIGINT NOT NULL REFERENCES mentor_profiles (user_id) ON DELETE CASCADE,
    skill_id BIGINT NOT NULL REFERENCES skills (id) ON DELETE RESTRICT,
    PRIMARY KEY (mentor_id, skill_id)
);

CREATE TABLE projects (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT NOT NULL REFERENCES organizations (user_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    deadline DATE,
    category TEXT,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE project_briefs (
    project_id BIGINT PRIMARY KEY REFERENCES projects (id) ON DELETE CASCADE,
    objectives JSONB NOT NULL DEFAULT '[]',
    deliverables JSONB NOT NULL DEFAULT '[]',
    scope TEXT,
    analyzed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE project_brief_skills (
    project_id BIGINT NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    skill_id BIGINT NOT NULL REFERENCES skills (id) ON DELETE RESTRICT,
    PRIMARY KEY (project_id, skill_id)
);

CREATE TABLE milestones (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    due_date DATE,
    position INT NOT NULL DEFAULT 0,
    UNIQUE (project_id, position)
);

CREATE TABLE proposals (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    student_id BIGINT NOT NULL REFERENCES student_profiles (user_id) ON DELETE CASCADE,
    cover_letter TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (project_id, student_id)
);

CREATE TABLE project_mentors (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    mentor_id BIGINT NOT NULL REFERENCES mentor_profiles (user_id) ON DELETE CASCADE,
    note TEXT,
    status TEXT NOT NULL DEFAULT 'joined' CHECK (status IN ('joined', 'left')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (project_id, mentor_id)
);

CREATE INDEX idx_projects_status_created ON projects (status, created_at DESC);
CREATE INDEX idx_projects_organization ON projects (organization_id);
CREATE INDEX idx_proposals_project ON proposals (project_id);
CREATE INDEX idx_proposals_student ON proposals (student_id);
CREATE INDEX idx_project_mentors_mentor ON project_mentors (mentor_id);
CREATE INDEX idx_skills_name_trgm ON skills USING gin (name gin_trgm_ops);
CREATE INDEX idx_milestones_project ON milestones (project_id, position);
