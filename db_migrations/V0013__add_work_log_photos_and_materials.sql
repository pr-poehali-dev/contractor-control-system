-- Таблица для фотографий к записям журнала работ
CREATE TABLE IF NOT EXISTS work_log_photos (
    id SERIAL PRIMARY KEY,
    work_log_id INTEGER NOT NULL,
    photo_url TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER
);

-- Таблица для материалов к записям журнала работ
CREATE TABLE IF NOT EXISTS work_log_materials (
    id SERIAL PRIMARY KEY,
    work_log_id INTEGER NOT NULL,
    material_name VARCHAR(255) NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица для фотографий к замечаниям
CREATE TABLE IF NOT EXISTS remark_photos (
    id SERIAL PRIMARY KEY,
    remark_id INTEGER NOT NULL,
    photo_url TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_work_log_photos_work_log_id ON work_log_photos(work_log_id);
CREATE INDEX IF NOT EXISTS idx_work_log_materials_work_log_id ON work_log_materials(work_log_id);
CREATE INDEX IF NOT EXISTS idx_remark_photos_remark_id ON remark_photos(remark_id);

-- Комментарии для документации
COMMENT ON TABLE work_log_photos IS 'Фотографии к записям в журнале работ';
COMMENT ON TABLE work_log_materials IS 'Материалы использованные в работах';
COMMENT ON TABLE remark_photos IS 'Фотографии к замечаниям при проверках';