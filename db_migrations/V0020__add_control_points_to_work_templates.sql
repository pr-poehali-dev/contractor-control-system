ALTER TABLE t_p8942561_contractor_control_s.work_templates 
ADD COLUMN IF NOT EXISTS control_points JSONB;

UPDATE t_p8942561_contractor_control_s.work_templates 
SET control_points = CASE 
  WHEN title LIKE '%кровл%' OR code LIKE '%ФЕР12%' THEN 
    '[
      {"id": 1, "description": "Уклон кровли ≥ 14°", "standard": "СП 17.13330.2017", "standard_clause": "п. 5.2", "is_critical": true},
      {"id": 2, "description": "Нахлёст листов: вертикальный ≥ 150 мм, горизонтальный ≥ 1 волна", "standard": "СП 17.13330.2017", "standard_clause": "п. 5.8", "is_critical": true},
      {"id": 3, "description": "Герметичность стыков и мест крепления", "standard": "СП 17.13330.2017", "standard_clause": "п. 5.10", "is_critical": true},
      {"id": 4, "description": "Отсутствие механических повреждений покрытия", "standard": "СП 17.13330.2017", "standard_clause": "п. 6.1", "is_critical": false}
    ]'::jsonb
  WHEN title LIKE '%окон%' OR code LIKE '%ФЕР15-04%' THEN 
    '[
      {"id": 1, "description": "Отсутствие продувания монтажного шва", "standard": "ГОСТ 30674-99", "standard_clause": "п. 5.3", "is_critical": true},
      {"id": 2, "description": "Температура внутренней поверхности откоса ≥ +10°C", "standard": "СП 23-101-2004", "standard_clause": "п. 8.4", "is_critical": true},
      {"id": 3, "description": "Герметичность монтажного шва", "standard": "ГОСТ 30971-2012", "standard_clause": "п. 6.2", "is_critical": true},
      {"id": 4, "description": "Отклонение от вертикали/горизонтали не более 1,5 мм/м", "standard": "ГОСТ 30971-2012", "standard_clause": "Приложение Б", "is_critical": false}
    ]'::jsonb
  WHEN title LIKE '%отопл%' OR code LIKE '%ФЕР16%' THEN 
    '[
      {"id": 1, "description": "Опрессовка давлением 1,0 МПа в течение 15 мин", "standard": "СП 60.13330.2020", "standard_clause": "п. 7.3", "is_critical": true},
      {"id": 2, "description": "Отсутствие течи в соединениях", "standard": "СП 60.13330.2020", "standard_clause": "п. 7.4", "is_critical": true},
      {"id": 3, "description": "Соответствие проектной схеме разводки", "standard": "СП 60.13330.2020", "standard_clause": "п. 4.2", "is_critical": true},
      {"id": 4, "description": "Уклон труб по проекту (обычно 0,002-0,005)", "standard": "СП 60.13330.2020", "standard_clause": "п. 6.3", "is_critical": false}
    ]'::jsonb
  WHEN title LIKE '%фасад%' OR code LIKE '%ФЕР15-02%' THEN 
    '[
      {"id": 1, "description": "Толщина утеплителя соответствует проекту", "standard": "СП 290.1325800.2017", "standard_clause": "п. 5.2", "is_critical": true},
      {"id": 2, "description": "Прочность сцепления штукатурки ≥ 0,1 МПа", "standard": "СП 296.1325800.2017", "standard_clause": "п. 8.3", "is_critical": true},
      {"id": 3, "description": "Отсутствие мостиков холода", "standard": "СП 290.1325800.2017", "standard_clause": "п. 6.4", "is_critical": true},
      {"id": 4, "description": "Ровность поверхности (не более 3 мм на 2 м)", "standard": "СП 296.1325800.2017", "standard_clause": "п. 9.1", "is_critical": false}
    ]'::jsonb
  WHEN title LIKE '%электр%' OR code LIKE '%ФЕР08%' THEN 
    '[
      {"id": 1, "description": "Сопротивление изоляции ≥ 0,5 МОм", "standard": "ПУЭ (7-е изд.)", "standard_clause": "п. 1.8.37", "is_critical": true},
      {"id": 2, "description": "Заземление всех розеток", "standard": "СП 256.1325800.2016", "standard_clause": "п. 6.1.48", "is_critical": true},
      {"id": 3, "description": "Соответствие сечения кабеля нагрузке", "standard": "ПУЭ (7-е изд.)", "standard_clause": "Таб. 1.3.4", "is_critical": true},
      {"id": 4, "description": "Маркировка проводов по цветам (N-синий, PE-желто-зеленый)", "standard": "ГОСТ Р 50462-2009", "standard_clause": "п. 5.2", "is_critical": false}
    ]'::jsonb
  WHEN title LIKE '%гидроизол%' OR title LIKE '%подвал%' THEN 
    '[
      {"id": 1, "description": "Отсутствие протечек при испытании", "standard": "СП 28.13330.2017", "standard_clause": "п. 5.3", "is_critical": true},
      {"id": 2, "description": "Кратность воздухообмена ≥ 1", "standard": "СП 60.13330.2020", "standard_clause": "п. 7.2", "is_critical": true},
      {"id": 3, "description": "Влажность воздуха ≤ 60%", "standard": "СП 60.13330.2020", "standard_clause": "п. 5.1", "is_critical": false},
      {"id": 4, "description": "Толщина гидроизоляционного слоя по проекту", "standard": "СП 28.13330.2017", "standard_clause": "п. 4.5", "is_critical": true}
    ]'::jsonb
  WHEN title LIKE '%водоотвед%' OR title LIKE '%ливнёв%' THEN 
    '[
      {"id": 1, "description": "Уклон труб ≥ 0,01", "standard": "СП 32.13330.2018", "standard_clause": "п. 8.2", "is_critical": true},
      {"id": 2, "description": "Герметичность соединений", "standard": "СП 32.13330.2018", "standard_clause": "п. 9.3", "is_critical": true},
      {"id": 3, "description": "Прочистка через каждые 30 м", "standard": "СП 32.13330.2018", "standard_clause": "п. 7.4", "is_critical": true},
      {"id": 4, "description": "Наличие дождеприёмников в низких точках", "standard": "СП 32.13330.2018", "standard_clause": "п. 6.5", "is_critical": false}
    ]'::jsonb
  WHEN title LIKE '%отмостк%' OR title LIKE '%крыльц%' OR title LIKE '%входн%' THEN 
    '[
      {"id": 1, "description": "Уклон отмостки 1-10% (1-10 см на 1 м)", "standard": "СП 82.13330.2016", "standard_clause": "п. 4.30", "is_critical": true},
      {"id": 2, "description": "Ширина отмостки ≥ 1 м", "standard": "СП 82.13330.2016", "standard_clause": "п. 4.30", "is_critical": true},
      {"id": 3, "description": "Отсутствие трещин", "standard": "СП 82.13330.2016", "standard_clause": "п. 5.2", "is_critical": false},
      {"id": 4, "description": "Высота ступеней ≤ 15 см, ширина марша ≥ 90 см", "standard": "СП 59.13330.2020", "standard_clause": "п. 5.1.11", "is_critical": true}
    ]'::jsonb
  WHEN title LIKE '%прибор%' OR title LIKE '%учёт%' THEN 
    '[
      {"id": 1, "description": "Поверка приборов учета", "standard": "ГОСТ Р 54558-2011", "standard_clause": "п. 5.3", "is_critical": true},
      {"id": 2, "description": "Подключение к АСКУЭ", "standard": "ФЗ №261", "standard_clause": "ст. 13", "is_critical": true},
      {"id": 3, "description": "Точность измерений ±2%", "standard": "ГОСТ Р 54558-2011", "standard_clause": "п. 6.2", "is_critical": true},
      {"id": 4, "description": "Наличие пломб на счетчиках", "standard": "ГОСТ Р 54558-2011", "standard_clause": "п. 7.1", "is_critical": false}
    ]'::jsonb
  ELSE 
    '[
      {"id": 1, "description": "Соответствие проектной документации", "standard": "СП 48.13330.2019", "standard_clause": "п. 4.1", "is_critical": true},
      {"id": 2, "description": "Качество выполнения работ", "standard": "СП 48.13330.2019", "standard_clause": "п. 5.2", "is_critical": true},
      {"id": 3, "description": "Использование сертифицированных материалов", "standard": "ФЗ №384", "standard_clause": "ст. 16", "is_critical": true},
      {"id": 4, "description": "Соблюдение технологии производства работ", "standard": "СП 48.13330.2019", "standard_clause": "п. 6.3", "is_critical": false}
    ]'::jsonb
END
WHERE control_points IS NULL;