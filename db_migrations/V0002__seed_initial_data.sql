-- Insert test users
INSERT INTO users (phone, email, role, name, organization) VALUES
('+79991234501', 'test1@podryad.pro', 'client', 'Заказчик Петров', 'ООО "СтройКонтроль"'),
('+79991234502', 'test2@podryad.pro', 'contractor', 'Подрядчик А', 'ООО "СтройМонтаж А"'),
('+79991234503', 'test3@podryad.pro', 'client', 'Заказчик Сидоров', 'ООО "Новострой"');

-- Insert contractors
INSERT INTO contractors (name, inn, contact_info) VALUES
('ООО "СтройМонтаж А"', '7701234567', '+79991234502, test2@podryad.pro'),
('ООО "Благоустройство"', '7701234568', '+79991234504, contractor-b@podryad.pro'),
('ООО "РемонтПро"', '7701234569', '+79991234505, contractor-c@podryad.pro');

-- Insert projects for Test1
INSERT INTO projects (title, description, client_id, status) VALUES
('Капремонт Казани 2025', 'Капитальный ремонт жилых домов', 1, 'active'),
('Благоустройство домов', 'Благоустройство придомовых территорий', 1, 'active'),
('Реконструкция школы №12', 'Реконструкция образовательного учреждения', 1, 'pending');

-- Insert objects for projects
INSERT INTO objects (title, address, project_id, status) VALUES
('ул. Ленина, д.10', 'г. Казань, ул. Ленина, д.10', 1, 'active'),
('ул. Гагарина, д.5', 'г. Казань, ул. Гагарина, д.5', 1, 'active'),
('Парк Победы', 'г. Казань, Парк Победы', 2, 'active'),
('Детская площадка на ул. Строителей', 'г. Казань, ул. Строителей, д.15', 2, 'active'),
('Школа №12', 'г. Казань, ул. Школьная, д.12', 3, 'pending');

-- Insert works
INSERT INTO works (title, description, object_id, contractor_id, status, start_date) VALUES
('Кровля', 'Замена кровельного покрытия', 1, 1, 'active', CURRENT_DATE - INTERVAL '10 days'),
('Фасад', 'Облицовка фасада', 1, 1, 'active', CURRENT_DATE - INTERVAL '5 days'),
('Внутренняя отделка', 'Штукатурные работы', 2, 1, 'active', CURRENT_DATE - INTERVAL '15 days'),
('Асфальтирование', 'Укладка асфальтового покрытия', 3, 2, 'active', CURRENT_DATE - INTERVAL '3 days'),
('Установка оборудования', 'Монтаж детских игровых комплексов', 4, 2, 'active', CURRENT_DATE - INTERVAL '2 days'),
('Фундамент', 'Укрепление фундамента', 5, 3, 'pending', NULL);

-- Insert work logs
INSERT INTO work_logs (work_id, volume, materials, description, created_by, created_at) VALUES
(1, '150 м²', 'Металлочерепица Монтеррей - 160 м², Саморезы кровельные - 2500 шт', 
 'Завершён монтаж кровельного покрытия на площади 150 м². Использованы материалы согласно спецификации.', 
 2, CURRENT_TIMESTAMP - INTERVAL '3 days'),
(3, '80 м²', 'Штукатурка цементная - 250 кг', 
 'Завершена штукатурка стен в квартирах 10-15. Готовность к следующему этапу через 3 дня.', 
 2, CURRENT_TIMESTAMP - INTERVAL '5 days'),
(4, '200 м²', 'Асфальт - 15 тонн', 
 'Уложено 200 м² асфальтового покрытия. Температура укладки +150°C.', 
 2, CURRENT_TIMESTAMP - INTERVAL '2 days');

-- Insert inspections
INSERT INTO inspections (work_id, inspection_number, created_by, status, created_at, completed_at) VALUES
(1, '45', 1, 'completed', CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(4, '48', 1, 'active', CURRENT_TIMESTAMP - INTERVAL '1 day', NULL);

-- Insert inspection checkpoints
INSERT INTO inspection_checkpoints (inspection_id, title, standard, status) VALUES
(1, 'Качество материала', 'ГОСТ 24045-2016', 'ok'),
(1, 'Герметичность соединений', 'СНиП 3.04.01-87', 'violation'),
(1, 'Уклон кровли', 'СП 17.13330.2017', 'ok'),
(2, 'Толщина слоя асфальта', 'ГОСТ 9128-2013', 'pending'),
(2, 'Уплотнение покрытия', 'СП 78.13330.2012', 'pending');

-- Insert remarks
INSERT INTO remarks (inspection_id, checkpoint_id, description, normative_ref, status, created_at, resolved_at) VALUES
(1, 2, 'Обнаружены негерметичные стыки между листами кровельного материала. Требуется дополнительная герметизация согласно СНиП 3.04.01-87, п. 4.5.', 
 'СНиП 3.04.01-87, п. 4.5', 'resolved', CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP - INTERVAL '1 day');

-- Insert activity log entries
INSERT INTO activity_log (user_id, entity_type, entity_id, action, details) VALUES
(1, 'project', 1, 'created', 'Создан проект "Капремонт Казани 2025"'),
(1, 'inspection', 1, 'created', 'Создана проверка №45 для работы "Кровля"'),
(1, 'remark', 1, 'created', 'Добавлено замечание по проверке №45'),
(1, 'inspection', 1, 'completed', 'Проверка №45 завершена'),
(2, 'work_log', 1, 'created', 'Добавлена запись в журнал работ по кровле');