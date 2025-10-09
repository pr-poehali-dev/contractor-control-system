-- Добавляем связь проверки с записью журнала (опционально)
ALTER TABLE inspections 
ADD COLUMN IF NOT EXISTS work_log_id INTEGER;

-- Индекс для быстрого поиска проверок по записи журнала
CREATE INDEX IF NOT EXISTS idx_inspections_work_log_id ON inspections(work_log_id);

COMMENT ON COLUMN inspections.work_log_id IS 'ID записи журнала работ, на основе которой создана проверка (опционально)';