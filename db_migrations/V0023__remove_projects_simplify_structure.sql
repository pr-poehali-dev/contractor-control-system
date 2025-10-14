-- Упрощаем структуру: убираем уровень projects, переносим client_id в objects
-- 1. Добавляем client_id в таблицу objects
ALTER TABLE t_p8942561_contractor_control_s.objects 
ADD COLUMN IF NOT EXISTS client_id INTEGER;

-- 2. Переносим данные client_id из projects в objects
UPDATE t_p8942561_contractor_control_s.objects o
SET client_id = p.client_id
FROM t_p8942561_contractor_control_s.projects p
WHERE o.project_id = p.id;

-- 3. Создаем индекс для быстрого поиска объектов по клиенту
CREATE INDEX IF NOT EXISTS idx_objects_client_id 
ON t_p8942561_contractor_control_s.objects(client_id);

-- 4. Создаем индекс для быстрого поиска работ по объекту
CREATE INDEX IF NOT EXISTS idx_works_object_id 
ON t_p8942561_contractor_control_s.works(object_id);

-- 5. Добавляем поле description в objects для более подробной информации
ALTER TABLE t_p8942561_contractor_control_s.objects 
ADD COLUMN IF NOT EXISTS description TEXT;