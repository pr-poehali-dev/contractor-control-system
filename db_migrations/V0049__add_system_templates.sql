-- Создание 3 системных шаблонов документов для админа (user_id = 6)

-- 1. Акт об обнаружении дефектов
INSERT INTO document_templates (client_id, name, description, template_type, content, version, is_active, is_system, created_at, updated_at)
VALUES (
  6,
  'Акт об обнаружении дефектов',
  'Системный шаблон для оформления актов о выявленных недостатках и дефектах',
  'defect_detection',
  '{
    "html": "<h1>АКТ ОБ ОБНАРУЖЕНИИ ДЕФЕКТОВ</h1><p><strong>Дата составления:</strong> {{date}}</p><p><strong>Объект:</strong> {{object_name}}</p><p><strong>Адрес объекта:</strong> {{object_address}}</p><h2>1. Общие сведения</h2><p>Настоящий акт составлен комиссией в составе:</p><p><strong>Представитель заказчика:</strong> {{client_representative}}</p><p><strong>Представитель подрядчика:</strong> {{contractor_representative}}</p><h2>2. Выявленные дефекты</h2><p>{{defects_description}}</p><h2>3. Заключение</h2><p>Выявленные дефекты должны быть устранены подрядчиком в срок до {{deadline_date}}.</p><p><strong>Подписи сторон:</strong></p><p>Заказчик: ___________________ {{client_representative}}</p><p>Подрядчик: ___________________ {{contractor_representative}}</p>",
    "variables": ["date", "object_name", "object_address", "client_representative", "contractor_representative", "defects_description", "deadline_date"]
  }'::jsonb,
  1,
  true,
  true,
  NOW(),
  NOW()
);

-- 2. Акт об устранении дефектов
INSERT INTO document_templates (client_id, name, description, template_type, content, version, is_active, is_system, created_at, updated_at)
VALUES (
  6,
  'Акт об устранении дефектов',
  'Системный шаблон для подтверждения устранения выявленных недостатков',
  'defect_resolution',
  '{
    "html": "<h1>АКТ ОБ УСТРАНЕНИИ ДЕФЕКТОВ</h1><p><strong>Дата составления:</strong> {{date}}</p><p><strong>Объект:</strong> {{object_name}}</p><p><strong>Адрес объекта:</strong> {{object_address}}</p><h2>1. Общие сведения</h2><p>Настоящий акт составлен во исполнение Акта об обнаружении дефектов от {{detection_date}}.</p><p><strong>Представитель заказчика:</strong> {{client_representative}}</p><p><strong>Представитель подрядчика:</strong> {{contractor_representative}}</p><h2>2. Устраненные дефекты</h2><p>{{resolved_defects}}</p><h2>3. Заключение</h2><p>Комиссия подтверждает, что все выявленные дефекты устранены в полном объеме и качественно.</p><p><strong>Подписи сторон:</strong></p><p>Заказчик: ___________________ {{client_representative}}</p><p>Подрядчик: ___________________ {{contractor_representative}}</p>",
    "variables": ["date", "object_name", "object_address", "detection_date", "client_representative", "contractor_representative", "resolved_defects"]
  }'::jsonb,
  1,
  true,
  true,
  NOW(),
  NOW()
);

-- 3. Акт приемки выполненных работ
INSERT INTO document_templates (client_id, name, description, template_type, content, version, is_active, is_system, created_at, updated_at)
VALUES (
  6,
  'Акт приемки выполненных работ',
  'Системный шаблон для приемки завершенных строительных работ',
  'work_acceptance',
  '{
    "html": "<h1>АКТ ПРИЕМКИ ВЫПОЛНЕННЫХ РАБОТ</h1><p><strong>Дата составления:</strong> {{date}}</p><p><strong>Объект:</strong> {{object_name}}</p><p><strong>Адрес объекта:</strong> {{object_address}}</p><h2>1. Общие сведения</h2><p>Настоящий акт составлен комиссией в составе:</p><p><strong>Представитель заказчика:</strong> {{client_representative}}</p><p><strong>Представитель подрядчика:</strong> {{contractor_representative}}</p><h2>2. Выполненные работы</h2><p><strong>Наименование работ:</strong> {{work_name}}</p><p><strong>Объем работ:</strong> {{work_volume}}</p><p><strong>Стоимость работ:</strong> {{work_cost}} руб.</p><p><strong>Период выполнения:</strong> с {{start_date}} по {{end_date}}</p><h2>3. Качество выполненных работ</h2><p>{{quality_assessment}}</p><h2>4. Заключение</h2><p>Работы выполнены в полном объеме, качественно, с соблюдением технических условий и требований.</p><p><strong>Подписи сторон:</strong></p><p>Заказчик: ___________________ {{client_representative}}</p><p>Подрядчик: ___________________ {{contractor_representative}}</p>",
    "variables": ["date", "object_name", "object_address", "client_representative", "contractor_representative", "work_name", "work_volume", "work_cost", "start_date", "end_date", "quality_assessment"]
  }'::jsonb,
  1,
  true,
  true,
  NOW(),
  NOW()
);
