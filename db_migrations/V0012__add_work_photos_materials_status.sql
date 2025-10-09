-- Добавляем поля для фотографий, материалов и статусов работ

-- Добавляем поле для хранения URL фотографий (массив JSON)
ALTER TABLE works 
ADD COLUMN IF NOT EXISTS photos JSONB DEFAULT '[]'::jsonb;

-- Добавляем поле для хранения материалов (массив объектов)
ALTER TABLE works 
ADD COLUMN IF NOT EXISTS materials JSONB DEFAULT '[]'::jsonb;

-- Добавляем поле статуса работы (текстовое поле с ограничением)
ALTER TABLE works 
ADD COLUMN IF NOT EXISTS work_status VARCHAR(20) DEFAULT 'planned' 
CHECK (work_status IN ('planned', 'in_progress', 'completed', 'on_hold'));

-- Обновляем существующие записи на основе старого поля status
UPDATE works 
SET work_status = CASE 
    WHEN status = 'active' THEN 'in_progress'
    WHEN status = 'completed' THEN 'completed'
    WHEN status = 'pending' THEN 'planned'
    WHEN status = 'on_hold' THEN 'on_hold'
    ELSE 'planned'
END
WHERE work_status IS NULL OR work_status = 'planned';