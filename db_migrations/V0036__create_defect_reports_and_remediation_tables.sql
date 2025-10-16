-- Таблица для актов об обнаружении дефектов
CREATE TABLE IF NOT EXISTS defect_reports (
    id SERIAL PRIMARY KEY,
    inspection_id INTEGER NOT NULL REFERENCES inspections(id),
    report_number VARCHAR(100) NOT NULL UNIQUE,
    work_id INTEGER NOT NULL REFERENCES works(id),
    object_id INTEGER NOT NULL REFERENCES objects(id),
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active',
    total_defects INTEGER DEFAULT 0,
    critical_defects INTEGER DEFAULT 0,
    report_data JSONB,
    pdf_url TEXT,
    notes TEXT
);

-- Таблица для устранения дефектов подрядчиком
CREATE TABLE IF NOT EXISTS defect_remediations (
    id SERIAL PRIMARY KEY,
    defect_report_id INTEGER NOT NULL REFERENCES defect_reports(id),
    defect_id VARCHAR(100) NOT NULL,
    contractor_id INTEGER NOT NULL REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'pending',
    remediation_description TEXT,
    remediation_photos JSONB,
    completed_at TIMESTAMP,
    verified_at TIMESTAMP,
    verified_by INTEGER REFERENCES users(id),
    verification_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица для актов об устранении замечаний
CREATE TABLE IF NOT EXISTS remediation_reports (
    id SERIAL PRIMARY KEY,
    defect_report_id INTEGER NOT NULL REFERENCES defect_reports(id),
    report_number VARCHAR(100) NOT NULL UNIQUE,
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending',
    approved_by INTEGER REFERENCES users(id),
    approved_at TIMESTAMP,
    report_data JSONB,
    pdf_url TEXT,
    notes TEXT
);

-- Индексы для производительности
CREATE INDEX IF NOT EXISTS idx_defect_reports_inspection ON defect_reports(inspection_id);
CREATE INDEX IF NOT EXISTS idx_defect_reports_work ON defect_reports(work_id);
CREATE INDEX IF NOT EXISTS idx_defect_reports_status ON defect_reports(status);
CREATE INDEX IF NOT EXISTS idx_defect_remediations_report ON defect_remediations(defect_report_id);
CREATE INDEX IF NOT EXISTS idx_defect_remediations_contractor ON defect_remediations(contractor_id);
CREATE INDEX IF NOT EXISTS idx_defect_remediations_status ON defect_remediations(status);
CREATE INDEX IF NOT EXISTS idx_remediation_reports_defect_report ON remediation_reports(defect_report_id);