-- ============================================================
-- ПОЛНАЯ МИГРАЦИЯ СХЕМЫ БД
-- Система контроля строительных работ
-- Версия: Финальная консолидированная
-- Дата: 2025-11-12
-- ============================================================

-- 1. ТАБЛИЦА ПОЛЬЗОВАТЕЛЕЙ
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255),
    role VARCHAR(20) NOT NULL CHECK (role IN ('contractor', 'client', 'admin')),
    full_name VARCHAR(255),
    position VARCHAR(255),
    organization VARCHAR(255),
    password_hash VARCHAR(255),
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. ТАБЛИЦА ОРГАНИЗАЦИЙ
CREATE TABLE IF NOT EXISTS organizations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(500) NOT NULL,
    inn VARCHAR(12) NOT NULL UNIQUE,
    kpp VARCHAR(9),
    ogrn VARCHAR(15),
    legal_address TEXT,
    actual_address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    bik VARCHAR(9),
    bank_name VARCHAR(500),
    payment_account VARCHAR(20),
    correspondent_account VARCHAR(20),
    director_name VARCHAR(255),
    director_position VARCHAR(255),
    type VARCHAR(50) DEFAULT 'client' CHECK (type IN ('client', 'contractor')),
    status VARCHAR(50) DEFAULT 'active',
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_organizations_inn ON organizations(inn);
CREATE INDEX IF NOT EXISTS idx_organizations_status ON organizations(status);
CREATE INDEX IF NOT EXISTS idx_organizations_type ON organizations(type);
CREATE INDEX IF NOT EXISTS idx_organizations_created_by ON organizations(created_by);

-- 3. СВЯЗЬ ПОЛЬЗОВАТЕЛЕЙ И ОРГАНИЗАЦИЙ (многие-ко-многим)
CREATE TABLE IF NOT EXISTS user_organizations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'employee' CHECK (role IN ('admin', 'employee')),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, organization_id)
);

CREATE INDEX IF NOT EXISTS idx_user_organizations_user ON user_organizations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_organizations_org ON user_organizations(organization_id);

-- 4. ПРИГЛАШЕНИЯ В ОРГАНИЗАЦИЮ
CREATE TABLE IF NOT EXISTS organization_invites (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255),
    phone VARCHAR(20),
    invited_by INTEGER NOT NULL REFERENCES users(id),
    token VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(50) DEFAULT 'pending',
    expires_at TIMESTAMP NOT NULL,
    accepted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_org_invites_email ON organization_invites(email);
CREATE INDEX IF NOT EXISTS idx_org_invites_phone ON organization_invites(phone);
CREATE INDEX IF NOT EXISTS idx_org_invites_token ON organization_invites(token);
CREATE INDEX IF NOT EXISTS idx_org_invites_status ON organization_invites(status);

-- 5. КОДЫ ВЕРИФИКАЦИИ (SMS)
CREATE TABLE IF NOT EXISTS verification_codes (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(20) NOT NULL,
    code VARCHAR(6) NOT NULL,
    signature_id VARCHAR(255),
    expires_at TIMESTAMP NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_verification_codes_phone ON verification_codes(phone);
CREATE INDEX IF NOT EXISTS idx_verification_codes_signature ON verification_codes(signature_id);

-- 6. СТАРЫЕ ПОДРЯДЧИКИ (legacy, сохранено для совместимости)
CREATE TABLE IF NOT EXISTS contractors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    inn VARCHAR(20) UNIQUE NOT NULL,
    contact_info TEXT,
    user_id INTEGER REFERENCES users(id),
    email VARCHAR(255),
    phone VARCHAR(20),
    organization_id INTEGER REFERENCES organizations(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_contractors_inn ON contractors(inn);
CREATE INDEX IF NOT EXISTS idx_contractors_user ON contractors(user_id);
CREATE INDEX IF NOT EXISTS idx_contractors_org ON contractors(organization_id);
CREATE INDEX IF NOT EXISTS idx_contractors_email ON contractors(email);
CREATE INDEX IF NOT EXISTS idx_contractors_phone ON contractors(phone);

-- 7. СВЯЗИ КЛИЕНТ-ПОДРЯДЧИК
CREATE TABLE IF NOT EXISTS client_contractors (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    contractor_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(client_id, contractor_id)
);

CREATE INDEX IF NOT EXISTS idx_client_contractors_client ON client_contractors(client_id);
CREATE INDEX IF NOT EXISTS idx_client_contractors_contractor ON client_contractors(contractor_id);

-- 8. СТАРЫЕ ПРИГЛАШЕНИЯ ПОДРЯДЧИКОВ (legacy)
CREATE TABLE IF NOT EXISTS contractor_invites (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    organization VARCHAR(255) NOT NULL,
    inn VARCHAR(20),
    invited_by INTEGER REFERENCES users(id),
    token VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT now(),
    accepted_at TIMESTAMP,
    client_id INTEGER REFERENCES users(id),
    contractor_id INTEGER REFERENCES contractors(id)
);

-- 9. СТАРЫЕ ПРОЕКТЫ (legacy, сохранено для совместимости)
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    client_id INTEGER NOT NULL REFERENCES users(id),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'pending', 'archived')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

-- 10. ОБЪЕКТЫ СТРОИТЕЛЬСТВА
CREATE TABLE IF NOT EXISTS objects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    address TEXT,
    project_id INTEGER REFERENCES projects(id),
    organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'pending', 'archived')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_objects_project_id ON objects(project_id);
CREATE INDEX IF NOT EXISTS idx_objects_organization ON objects(organization_id);
CREATE INDEX IF NOT EXISTS idx_objects_status ON objects(status);

-- 11. СПРАВОЧНИК РАБОТ (шаблоны)
CREATE TABLE IF NOT EXISTS work_templates (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(500) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    normative_docs TEXT,
    materials TEXT,
    control_points JSONB,
    unit VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_work_templates_code ON work_templates(code);
CREATE INDEX IF NOT EXISTS idx_work_templates_category ON work_templates(category);

-- 12. РАБОТЫ НА ОБЪЕКТАХ
CREATE TABLE IF NOT EXISTS works (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    object_id INTEGER NOT NULL REFERENCES objects(id) ON DELETE CASCADE,
    contractor_id INTEGER REFERENCES contractors(id),
    contractor_organization_id INTEGER REFERENCES organizations(id),
    template_id INTEGER REFERENCES work_templates(id),
    status VARCHAR(50) NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'awaiting_start', 'active', 'awaiting_acceptance', 'delayed', 'completed', 'pending', 'on_hold')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    planned_start_date DATE,
    planned_end_date DATE,
    actual_start_date DATE,
    actual_end_date DATE,
    start_date DATE,
    end_date DATE,
    progress INTEGER DEFAULT 0,
    unit VARCHAR(50),
    planned_volume NUMERIC(10,2),
    actual_volume NUMERIC(10,2) DEFAULT 0,
    materials TEXT,
    photo_urls TEXT[],
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_works_object_id ON works(object_id);
CREATE INDEX IF NOT EXISTS idx_works_contractor_id ON works(contractor_id);
CREATE INDEX IF NOT EXISTS idx_works_contractor_org ON works(contractor_organization_id);
CREATE INDEX IF NOT EXISTS idx_works_template_id ON works(template_id);
CREATE INDEX IF NOT EXISTS idx_works_status ON works(status);
CREATE INDEX IF NOT EXISTS idx_works_priority ON works(priority);

-- 13. ЖУРНАЛ ВЫПОЛНЕНИЯ РАБОТ
CREATE TABLE IF NOT EXISTS work_logs (
    id SERIAL PRIMARY KEY,
    work_id INTEGER NOT NULL REFERENCES works(id) ON DELETE CASCADE,
    volume TEXT,
    materials TEXT,
    photo_urls TEXT[],
    description TEXT NOT NULL,
    completion_percentage INTEGER DEFAULT 0,
    is_work_start BOOLEAN DEFAULT FALSE,
    inspection_event_id INTEGER,
    inspection_event_type VARCHAR(50),
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_work_logs_work_id ON work_logs(work_id);
CREATE INDEX IF NOT EXISTS idx_work_logs_created_by ON work_logs(created_by);
CREATE INDEX IF NOT EXISTS idx_work_logs_created_at ON work_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_work_logs_inspection_event ON work_logs(inspection_event_id);

-- 14. СТАРЫЕ ТАБЛИЦЫ ДЛЯ ФОТО И МАТЕРИАЛОВ (legacy)
CREATE TABLE IF NOT EXISTS work_log_photos (
    id SERIAL PRIMARY KEY,
    work_log_id INTEGER NOT NULL REFERENCES work_logs(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS work_log_materials (
    id SERIAL PRIMARY KEY,
    work_log_id INTEGER NOT NULL REFERENCES work_logs(id) ON DELETE CASCADE,
    material_name VARCHAR(255) NOT NULL,
    quantity NUMERIC(10,2),
    unit VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 15. ОТСЛЕЖИВАНИЕ ПРОСМОТРОВ РАБОТ
CREATE TABLE IF NOT EXISTS work_views (
    id SERIAL PRIMARY KEY,
    work_id INTEGER NOT NULL REFERENCES works(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    last_seen_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(work_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_work_views_work ON work_views(work_id);
CREATE INDEX IF NOT EXISTS idx_work_views_user ON work_views(user_id);

-- 16. ПРОВЕРКИ
CREATE TABLE IF NOT EXISTS inspections (
    id SERIAL PRIMARY KEY,
    work_id INTEGER NOT NULL REFERENCES works(id) ON DELETE CASCADE,
    work_log_id INTEGER REFERENCES work_logs(id),
    inspection_number VARCHAR(50) NOT NULL,
    inspection_type VARCHAR(50) DEFAULT 'scheduled' CHECK (inspection_type IN ('scheduled', 'unscheduled')),
    created_by INTEGER NOT NULL REFERENCES users(id),
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'on_rework', 'scheduled', 'in_progress', 'accepted', 'rejected')),
    notes TEXT,
    conclusion TEXT,
    defects_count INTEGER DEFAULT 0,
    scheduled_date TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_inspections_work_id ON inspections(work_id);
CREATE INDEX IF NOT EXISTS idx_inspections_work_log_id ON inspections(work_log_id);
CREATE INDEX IF NOT EXISTS idx_inspections_created_by ON inspections(created_by);
CREATE INDEX IF NOT EXISTS idx_inspections_status ON inspections(status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_inspections_number ON inspections(inspection_number);

-- 17. КОНТРОЛЬНЫЕ ТОЧКИ ПРОВЕРОК
CREATE TABLE IF NOT EXISTS inspection_checkpoints (
    id SERIAL PRIMARY KEY,
    inspection_id INTEGER NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    standard VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('ok', 'violation', 'pending')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_inspection_checkpoints_inspection_id ON inspection_checkpoints(inspection_id);

-- 18. СОБЫТИЯ ПРОВЕРОК (для ленты)
CREATE TABLE IF NOT EXISTS inspection_events (
    id SERIAL PRIMARY KEY,
    inspection_id INTEGER NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('scheduled', 'started', 'completed')),
    metadata JSONB,
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_inspection_events_inspection ON inspection_events(inspection_id);
CREATE INDEX IF NOT EXISTS idx_inspection_events_type ON inspection_events(event_type);
CREATE INDEX IF NOT EXISTS idx_inspection_events_created_at ON inspection_events(created_at);

-- 19. АКТЫ ЗАМЕЧАНИЙ
CREATE TABLE IF NOT EXISTS defect_reports (
    id SERIAL PRIMARY KEY,
    inspection_id INTEGER NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
    report_number VARCHAR(100) UNIQUE NOT NULL,
    defects JSONB NOT NULL,
    created_by INTEGER NOT NULL REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_defect_reports_inspection ON defect_reports(inspection_id);
CREATE INDEX IF NOT EXISTS idx_defect_reports_status ON defect_reports(status);
CREATE INDEX IF NOT EXISTS idx_defect_reports_number ON defect_reports(report_number);

-- 20. УСТРАНЕНИЕ ЗАМЕЧАНИЙ
CREATE TABLE IF NOT EXISTS defect_remediations (
    id SERIAL PRIMARY KEY,
    defect_report_id INTEGER NOT NULL REFERENCES defect_reports(id) ON DELETE CASCADE,
    defect_id VARCHAR(50) NOT NULL,
    contractor_id INTEGER NOT NULL REFERENCES organizations(id),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'verified')),
    remediation_description TEXT,
    remediation_photos JSONB,
    completed_at TIMESTAMP,
    verified_at TIMESTAMP,
    verified_by INTEGER REFERENCES users(id),
    verification_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_defect_remediations_report ON defect_remediations(defect_report_id);
CREATE INDEX IF NOT EXISTS idx_defect_remediations_contractor ON defect_remediations(contractor_id);
CREATE INDEX IF NOT EXISTS idx_defect_remediations_status ON defect_remediations(status);

-- 21. СТАРАЯ ТАБЛИЦА ЗАМЕЧАНИЙ (legacy)
CREATE TABLE IF NOT EXISTS remarks (
    id SERIAL PRIMARY KEY,
    inspection_id INTEGER NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
    checkpoint_id INTEGER REFERENCES inspection_checkpoints(id),
    description TEXT NOT NULL,
    normative_ref VARCHAR(255),
    photo_urls TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'rejected')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_remarks_inspection_id ON remarks(inspection_id);
CREATE INDEX IF NOT EXISTS idx_remarks_checkpoint_id ON remarks(checkpoint_id);
CREATE INDEX IF NOT EXISTS idx_remarks_status ON remarks(status);

-- 22. ФОТО ЗАМЕЧАНИЙ (legacy)
CREATE TABLE IF NOT EXISTS remark_photos (
    id SERIAL PRIMARY KEY,
    remark_id INTEGER NOT NULL REFERENCES remarks(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 23. ОТЧЁТЫ ОБ УСТРАНЕНИИ (legacy)
CREATE TABLE IF NOT EXISTS remediation_reports (
    id SERIAL PRIMARY KEY,
    remark_id INTEGER NOT NULL REFERENCES remarks(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    photo_urls TEXT,
    submitted_by INTEGER NOT NULL REFERENCES users(id),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 24. ЧАТ ПО РАБОТАМ
CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    work_id INTEGER NOT NULL REFERENCES works(id) ON DELETE CASCADE,
    created_by INTEGER NOT NULL REFERENCES users(id),
    message_type VARCHAR(50) NOT NULL DEFAULT 'text',
    message TEXT,
    photo_urls TEXT[],
    materials JSONB,
    work_volume VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_work ON chat_messages(work_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_by ON chat_messages(created_by);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

-- 25. ИНФОРМАЦИОННЫЕ ПОСТЫ
CREATE TABLE IF NOT EXISTS info_posts (
    id SERIAL PRIMARY KEY,
    work_id INTEGER NOT NULL REFERENCES works(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[],
    photo_urls TEXT[],
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_info_posts_work ON info_posts(work_id);
CREATE INDEX IF NOT EXISTS idx_info_posts_created_by ON info_posts(created_by);
CREATE INDEX IF NOT EXISTS idx_info_posts_created_at ON info_posts(created_at);

-- 26. ШАБЛОНЫ ДОКУМЕНТОВ
CREATE TABLE IF NOT EXISTS document_templates (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES users(id),
    name VARCHAR(500) NOT NULL,
    description TEXT,
    template_type VARCHAR(100) NOT NULL,
    content JSONB NOT NULL,
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    is_system BOOLEAN DEFAULT false,
    system_key VARCHAR(100),
    source_template_id INTEGER REFERENCES document_templates(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(client_id, system_key)
);

CREATE INDEX IF NOT EXISTS idx_document_templates_client ON document_templates(client_id);
CREATE INDEX IF NOT EXISTS idx_document_templates_type ON document_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_document_templates_system_key ON document_templates(system_key);

-- 27. ДОКУМЕНТЫ
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    work_id INTEGER NOT NULL REFERENCES works(id) ON DELETE CASCADE,
    template_id INTEGER REFERENCES document_templates(id),
    document_number VARCHAR(100),
    document_type VARCHAR(100) NOT NULL,
    title VARCHAR(500) NOT NULL,
    content JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_documents_work ON documents(work_id);
CREATE INDEX IF NOT EXISTS idx_documents_template ON documents(template_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);

-- 28. ПОДПИСИ ДОКУМЕНТОВ
CREATE TABLE IF NOT EXISTS document_signatures (
    id SERIAL PRIMARY KEY,
    document_id INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    signer_id INTEGER NOT NULL REFERENCES users(id),
    organization_id INTEGER REFERENCES organizations(id),
    signature_type VARCHAR(50) NOT NULL,
    signature_data TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    signed_at TIMESTAMP,
    rejected_at TIMESTAMP,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_doc_signatures_document ON document_signatures(document_id);
CREATE INDEX IF NOT EXISTS idx_doc_signatures_signer ON document_signatures(signer_id);

-- 29. ВЕРСИИ ДОКУМЕНТОВ
CREATE TABLE IF NOT EXISTS document_versions (
    id SERIAL PRIMARY KEY,
    document_id INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    content JSONB NOT NULL,
    changed_by INTEGER NOT NULL REFERENCES users(id),
    change_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_doc_versions_document ON document_versions(document_id);

-- 30. СМЕТЫ
CREATE TABLE IF NOT EXISTS estimates (
    id SERIAL PRIMARY KEY,
    work_id INTEGER NOT NULL REFERENCES works(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    is_current BOOLEAN NOT NULL DEFAULT false,
    uploaded_by INTEGER NOT NULL REFERENCES users(id),
    notes TEXT,
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_estimates_work_id ON estimates(work_id);
CREATE INDEX IF NOT EXISTS idx_estimates_is_current ON estimates(is_current);
CREATE INDEX IF NOT EXISTS idx_estimates_uploaded_by ON estimates(uploaded_by);

-- 31. ЛОГ ДЕЙСТВИЙ
CREATE TABLE IF NOT EXISTS activity_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    entity_type VARCHAR(50) NOT NULL,
    entity_id INTEGER NOT NULL,
    action VARCHAR(50) NOT NULL,
    details TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_entity ON activity_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at);

-- 32. СЕССИИ ПОЛЬЗОВАТЕЛЕЙ
CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(token);

-- 33. СТАРЫЕ ТИПЫ РАБОТ (legacy)
CREATE TABLE IF NOT EXISTS work_types (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    unit VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- КОММЕНТАРИИ К ТАБЛИЦАМ
-- ============================================================

COMMENT ON TABLE users IS 'Пользователи системы (заказчики, подрядчики, администраторы)';
COMMENT ON TABLE organizations IS 'Организации (заказчики и подрядчики) - юридические лица';
COMMENT ON TABLE user_organizations IS 'Связь пользователей с организациями (многие-ко-многим)';
COMMENT ON TABLE organization_invites IS 'Приглашения сотрудников в организацию';
COMMENT ON TABLE objects IS 'Объекты строительства';
COMMENT ON TABLE work_templates IS 'Справочник работ (шаблоны работ из нормативов)';
COMMENT ON TABLE works IS 'Работы на объектах';
COMMENT ON TABLE work_logs IS 'Журнал выполнения работ (ежедневные отчёты подрядчика)';
COMMENT ON TABLE work_views IS 'Отслеживание просмотров работ для счётчика непрочитанных';
COMMENT ON TABLE inspections IS 'Проверки работ заказчиком';
COMMENT ON TABLE inspection_events IS 'События проверок для ленты активности';
COMMENT ON TABLE defect_reports IS 'Акты замечаний по результатам проверок';
COMMENT ON TABLE defect_remediations IS 'Устранение замечаний подрядчиком';
COMMENT ON TABLE chat_messages IS 'Чат по работам между заказчиком и подрядчиком';
COMMENT ON TABLE info_posts IS 'Информационные посты в ленте';
COMMENT ON TABLE document_templates IS 'Шаблоны документов с динамическими полями';
COMMENT ON TABLE documents IS 'Документы в системе документооборота';
COMMENT ON TABLE document_signatures IS 'Подписи документов (ЭЦП/СМС)';
COMMENT ON TABLE estimates IS 'Сметы работ (файлы и версии)';
COMMENT ON TABLE activity_log IS 'Лог всех действий пользователей';

-- ============================================================
-- КОНЕЦ МИГРАЦИИ
-- ============================================================
