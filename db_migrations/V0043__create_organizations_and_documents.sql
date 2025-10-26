-- Таблица подрядных организаций
CREATE TABLE IF NOT EXISTS t_p8942561_contractor_control_s.organizations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(500) NOT NULL,
    inn VARCHAR(12) NOT NULL UNIQUE,
    kpp VARCHAR(9),
    legal_address TEXT,
    actual_address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    created_by INTEGER REFERENCES t_p8942561_contractor_control_s.users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Обновляем таблицу пользователей - добавляем привязку к организации
ALTER TABLE t_p8942561_contractor_control_s.users 
ADD COLUMN IF NOT EXISTS organization_id INTEGER REFERENCES t_p8942561_contractor_control_s.organizations(id),
ADD COLUMN IF NOT EXISTS organization_role VARCHAR(50) DEFAULT 'employee';

-- Таблица приглашений в организацию
CREATE TABLE IF NOT EXISTS t_p8942561_contractor_control_s.organization_invites (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES t_p8942561_contractor_control_s.organizations(id),
    email VARCHAR(255) NOT NULL,
    invited_by INTEGER NOT NULL REFERENCES t_p8942561_contractor_control_s.users(id),
    token VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(50) DEFAULT 'pending',
    expires_at TIMESTAMP NOT NULL,
    accepted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Обновляем таблицу работ - привязываем к организации вместо пользователя
ALTER TABLE t_p8942561_contractor_control_s.works 
ADD COLUMN IF NOT EXISTS contractor_organization_id INTEGER REFERENCES t_p8942561_contractor_control_s.organizations(id);

-- Таблица шаблонов документов
CREATE TABLE IF NOT EXISTS t_p8942561_contractor_control_s.document_templates (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES t_p8942561_contractor_control_s.users(id),
    name VARCHAR(500) NOT NULL,
    description TEXT,
    template_type VARCHAR(100) NOT NULL,
    content JSONB NOT NULL,
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица документов
CREATE TABLE IF NOT EXISTS t_p8942561_contractor_control_s.documents (
    id SERIAL PRIMARY KEY,
    work_id INTEGER NOT NULL REFERENCES t_p8942561_contractor_control_s.works(id),
    template_id INTEGER REFERENCES t_p8942561_contractor_control_s.document_templates(id),
    document_number VARCHAR(100),
    document_type VARCHAR(100) NOT NULL,
    title VARCHAR(500) NOT NULL,
    content JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    created_by INTEGER NOT NULL REFERENCES t_p8942561_contractor_control_s.users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица подписей документов
CREATE TABLE IF NOT EXISTS t_p8942561_contractor_control_s.document_signatures (
    id SERIAL PRIMARY KEY,
    document_id INTEGER NOT NULL REFERENCES t_p8942561_contractor_control_s.documents(id),
    signer_id INTEGER NOT NULL REFERENCES t_p8942561_contractor_control_s.users(id),
    organization_id INTEGER REFERENCES t_p8942561_contractor_control_s.organizations(id),
    signature_type VARCHAR(50) NOT NULL,
    signature_data TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    signed_at TIMESTAMP,
    rejected_at TIMESTAMP,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица версий документов (для истории изменений)
CREATE TABLE IF NOT EXISTS t_p8942561_contractor_control_s.document_versions (
    id SERIAL PRIMARY KEY,
    document_id INTEGER NOT NULL REFERENCES t_p8942561_contractor_control_s.documents(id),
    version INTEGER NOT NULL,
    content JSONB NOT NULL,
    changed_by INTEGER NOT NULL REFERENCES t_p8942561_contractor_control_s.users(id),
    change_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для производительности
CREATE INDEX IF NOT EXISTS idx_organizations_inn ON t_p8942561_contractor_control_s.organizations(inn);
CREATE INDEX IF NOT EXISTS idx_organizations_status ON t_p8942561_contractor_control_s.organizations(status);
CREATE INDEX IF NOT EXISTS idx_users_organization ON t_p8942561_contractor_control_s.users(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_invites_email ON t_p8942561_contractor_control_s.organization_invites(email);
CREATE INDEX IF NOT EXISTS idx_org_invites_token ON t_p8942561_contractor_control_s.organization_invites(token);
CREATE INDEX IF NOT EXISTS idx_org_invites_status ON t_p8942561_contractor_control_s.organization_invites(status);
CREATE INDEX IF NOT EXISTS idx_works_contractor_org ON t_p8942561_contractor_control_s.works(contractor_organization_id);
CREATE INDEX IF NOT EXISTS idx_documents_work ON t_p8942561_contractor_control_s.documents(work_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON t_p8942561_contractor_control_s.documents(status);
CREATE INDEX IF NOT EXISTS idx_doc_signatures_document ON t_p8942561_contractor_control_s.document_signatures(document_id);
CREATE INDEX IF NOT EXISTS idx_doc_signatures_signer ON t_p8942561_contractor_control_s.document_signatures(signer_id);
CREATE INDEX IF NOT EXISTS idx_doc_versions_document ON t_p8942561_contractor_control_s.document_versions(document_id);

-- Комментарии к таблицам
COMMENT ON TABLE t_p8942561_contractor_control_s.organizations IS 'Подрядные организации - юридические лица';
COMMENT ON TABLE t_p8942561_contractor_control_s.organization_invites IS 'Приглашения сотрудников в организацию';
COMMENT ON TABLE t_p8942561_contractor_control_s.document_templates IS 'Шаблоны документов с динамическими полями';
COMMENT ON TABLE t_p8942561_contractor_control_s.documents IS 'Документы в системе документооборота';
COMMENT ON TABLE t_p8942561_contractor_control_s.document_signatures IS 'Подписи документов (ЭЦП/СМС)';
COMMENT ON TABLE t_p8942561_contractor_control_s.document_versions IS 'История версий документов';
