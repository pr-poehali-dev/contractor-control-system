-- Добавляем поле для отметки записи о начале работ
ALTER TABLE work_logs ADD COLUMN IF NOT EXISTS is_work_start BOOLEAN DEFAULT FALSE;

-- Создаём индекс для быстрого поиска записей о начале работ
CREATE INDEX IF NOT EXISTS idx_work_logs_is_work_start ON work_logs(is_work_start) WHERE is_work_start = TRUE;

COMMENT ON COLUMN work_logs.is_work_start IS 'Флаг, указывающий что это запись о начале работ';