-- Создаём организацию для пользователя id=30 с уникальным временным ИНН
INSERT INTO t_p8942561_contractor_control_s.organizations (name, inn, type, created_at)
VALUES ('Новая организация', '0000000030', 'client', NOW());

-- Получаем id последней созданной организации и привязываем пользователя
INSERT INTO t_p8942561_contractor_control_s.user_organizations (user_id, organization_id, role)
SELECT 30, id, 'admin' FROM t_p8942561_contractor_control_s.organizations ORDER BY id DESC LIMIT 1;

-- Обновляем organization_id у пользователя
UPDATE t_p8942561_contractor_control_s.users 
SET organization_id = (SELECT id FROM t_p8942561_contractor_control_s.organizations ORDER BY id DESC LIMIT 1)
WHERE id = 30;
