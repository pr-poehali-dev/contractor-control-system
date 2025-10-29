-- Обновляем шаблон акта дефектов - заменяем defects_description на defects
UPDATE t_p8942561_contractor_control_s.document_templates
SET content = jsonb_build_object(
  'html', replace(content->>'html', '{{defects_description}}', '{{defects}}'),
  'variables', jsonb_build_array('date', 'object_name', 'object_address', 'client_representative', 'contractor_representative', 'defects', 'deadline_date')
)
WHERE system_key = 'defect_detection_act';