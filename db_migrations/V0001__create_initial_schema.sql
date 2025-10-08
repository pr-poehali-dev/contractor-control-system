-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255),
    role VARCHAR(20) NOT NULL CHECK (role IN ('contractor', 'client', 'admin')),
    name VARCHAR(255) NOT NULL,
    organization VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index on phone for fast lookups
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);

-- Create contractors table
CREATE TABLE contractors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    inn VARCHAR(20) UNIQUE NOT NULL,
    contact_info TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_contractors_inn ON contractors(inn);

-- Create projects table
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    client_id INTEGER NOT NULL REFERENCES users(id),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'pending', 'archived')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_status ON projects(status);

-- Create objects table
CREATE TABLE objects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    address TEXT,
    project_id INTEGER NOT NULL REFERENCES projects(id),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'pending', 'archived')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_objects_project_id ON objects(project_id);
CREATE INDEX idx_objects_status ON objects(status);

-- Create works table
CREATE TABLE works (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    object_id INTEGER NOT NULL REFERENCES objects(id),
    contractor_id INTEGER REFERENCES contractors(id),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'completed', 'pending', 'on_hold')),
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_works_object_id ON works(object_id);
CREATE INDEX idx_works_contractor_id ON works(contractor_id);
CREATE INDEX idx_works_status ON works(status);

-- Create work_logs table
CREATE TABLE work_logs (
    id SERIAL PRIMARY KEY,
    work_id INTEGER NOT NULL REFERENCES works(id),
    volume TEXT,
    materials TEXT,
    photo_urls TEXT,
    description TEXT NOT NULL,
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_work_logs_work_id ON work_logs(work_id);
CREATE INDEX idx_work_logs_created_by ON work_logs(created_by);
CREATE INDEX idx_work_logs_created_at ON work_logs(created_at);

-- Create inspections table
CREATE TABLE inspections (
    id SERIAL PRIMARY KEY,
    work_id INTEGER NOT NULL REFERENCES works(id),
    inspection_number VARCHAR(50) NOT NULL,
    created_by INTEGER NOT NULL REFERENCES users(id),
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'on_rework')),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_inspections_work_id ON inspections(work_id);
CREATE INDEX idx_inspections_created_by ON inspections(created_by);
CREATE INDEX idx_inspections_status ON inspections(status);
CREATE UNIQUE INDEX idx_inspections_number ON inspections(inspection_number);

-- Create inspection_checkpoints table
CREATE TABLE inspection_checkpoints (
    id SERIAL PRIMARY KEY,
    inspection_id INTEGER NOT NULL REFERENCES inspections(id),
    title VARCHAR(255) NOT NULL,
    standard VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('ok', 'violation', 'pending')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_inspection_checkpoints_inspection_id ON inspection_checkpoints(inspection_id);

-- Create remarks table
CREATE TABLE remarks (
    id SERIAL PRIMARY KEY,
    inspection_id INTEGER NOT NULL REFERENCES inspections(id),
    checkpoint_id INTEGER REFERENCES inspection_checkpoints(id),
    description TEXT NOT NULL,
    normative_ref VARCHAR(255),
    photo_urls TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'rejected')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_remarks_inspection_id ON remarks(inspection_id);
CREATE INDEX idx_remarks_checkpoint_id ON remarks(checkpoint_id);
CREATE INDEX idx_remarks_status ON remarks(status);

-- Create estimates table
CREATE TABLE estimates (
    id SERIAL PRIMARY KEY,
    work_id INTEGER NOT NULL REFERENCES works(id),
    file_url TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    is_current BOOLEAN NOT NULL DEFAULT false,
    uploaded_by INTEGER NOT NULL REFERENCES users(id),
    notes TEXT,
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_estimates_work_id ON estimates(work_id);
CREATE INDEX idx_estimates_is_current ON estimates(is_current);
CREATE INDEX idx_estimates_uploaded_by ON estimates(uploaded_by);

-- Create activity_log table for audit trail
CREATE TABLE activity_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    entity_type VARCHAR(50) NOT NULL,
    entity_id INTEGER NOT NULL,
    action VARCHAR(50) NOT NULL,
    details TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX idx_activity_log_entity ON activity_log(entity_type, entity_id);
CREATE INDEX idx_activity_log_created_at ON activity_log(created_at);