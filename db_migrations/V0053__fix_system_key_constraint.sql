-- Удаляем UNIQUE constraint с system_key (каждый клиент имеет свои копии системных шаблонов)
ALTER TABLE "t_p8942561_contractor_control_s".document_templates 
DROP CONSTRAINT IF EXISTS document_templates_system_key_key;

-- Создаем индекс для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_document_templates_system_key 
ON "t_p8942561_contractor_control_s".document_templates(system_key);

-- Заполняем system_key для всех системных шаблонов
UPDATE "t_p8942561_contractor_control_s".document_templates
SET system_key = 'defect_detection_act'
WHERE name ILIKE '%обнаружении дефектов%';

UPDATE "t_p8942561_contractor_control_s".document_templates
SET system_key = 'defect_remediation_act'
WHERE name ILIKE '%устранении дефектов%';

UPDATE "t_p8942561_contractor_control_s".document_templates
SET system_key = 'hidden_work_act'
WHERE name ILIKE '%скрыт%работ%';

UPDATE "t_p8942561_contractor_control_s".document_templates
SET system_key = 'work_acceptance_act'
WHERE name ILIKE '%приёмк%работ%';