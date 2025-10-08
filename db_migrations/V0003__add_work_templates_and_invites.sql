-- Справочник типовых работ (ГОСТ/СНиП)
CREATE TABLE IF NOT EXISTS work_templates (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    title TEXT NOT NULL,
    normative_ref VARCHAR(255),
    material_types TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Приглашения подрядчиков
CREATE TABLE IF NOT EXISTS contractor_invites (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    organization VARCHAR(255) NOT NULL,
    inn VARCHAR(20),
    invited_by INTEGER REFERENCES users(id),
    token VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    accepted_at TIMESTAMP
);

-- Добавляем несколько типовых работ из ГОСТ
INSERT INTO work_templates (code, title, normative_ref, material_types) VALUES
('08-01-001', 'Устройство кровли из металлочерепицы', 'ГОСТ 24045-2016, СП 17.13330.2017', 'Металлочерепица, саморезы, гидроизоляция'),
('08-01-002', 'Устройство кровли из профнастила', 'ГОСТ 24045-2016', 'Профнастил, крепёж'),
('09-01-001', 'Облицовка фасада керамогранитом', 'СП 293.1325800.2017', 'Керамогранит, клей, затирка'),
('09-01-002', 'Штукатурные работы по фасаду', 'СНиП 3.04.01-87', 'Цементная штукатурка'),
('10-01-001', 'Устройство стяжки пола', 'СП 29.13330.2011', 'Бетон, армирование'),
('11-01-001', 'Монтаж оконных блоков ПВХ', 'ГОСТ 30971-2012', 'Окна ПВХ, монтажная пена'),
('12-01-001', 'Замена системы отопления', 'СП 60.13330.2020', 'Трубы, радиаторы, котел'),
('13-01-001', 'Монтаж вентиляционной системы', 'СП 60.13330.2016', 'Воздуховоды, вентиляторы')
ON CONFLICT (code) DO NOTHING;

-- Добавляем поле для связи работы со справочником
ALTER TABLE works ADD COLUMN IF NOT EXISTS template_id INTEGER REFERENCES work_templates(id);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_work_templates_title ON work_templates(title);
CREATE INDEX IF NOT EXISTS idx_contractor_invites_email ON contractor_invites(email);
CREATE INDEX IF NOT EXISTS idx_contractor_invites_token ON contractor_invites(token);
