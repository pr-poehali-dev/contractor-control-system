-- Добавляем поле для связи копии с эталоном
ALTER TABLE t_p8942561_contractor_control_s.document_templates 
ADD COLUMN source_template_id INTEGER REFERENCES t_p8942561_contractor_control_s.document_templates(id);

-- Обновляем существующие копии: связываем с эталонами по типу
UPDATE t_p8942561_contractor_control_s.document_templates AS copy
SET source_template_id = original.id
FROM t_p8942561_contractor_control_s.document_templates AS original
WHERE copy.is_system = false
  AND original.is_system = true
  AND copy.template_type = original.template_type
  AND copy.name = original.name;