-- Добавляем подрядчика "ИИ Модель" (id=27) в список заказчика (id=11)
INSERT INTO t_p8942561_contractor_control_s.client_contractors (client_id, contractor_id, added_at)
VALUES (11, 27, NOW())
ON CONFLICT (client_id, contractor_id) DO NOTHING;