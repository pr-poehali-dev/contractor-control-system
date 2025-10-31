-- Создаём организацию для пользователя id=31
INSERT INTO t_p8942561_contractor_control_s.organizations (name, inn, type, created_at)
VALUES ('Новая организация', '0000000031', 'client', NOW())
RETURNING id;

-- Обновляем пользователя, устанавливаем ссылку на организацию
UPDATE t_p8942561_contractor_control_s.users
SET organization_id = (
    SELECT id FROM t_p8942561_contractor_control_s.organizations 
    WHERE inn = '0000000031'
)
WHERE id = 31;

-- Добавляем связь в user_organizations
INSERT INTO t_p8942561_contractor_control_s.user_organizations (user_id, organization_id, role, created_at)
VALUES (
    31,
    (SELECT id FROM t_p8942561_contractor_control_s.organizations WHERE inn = '0000000031'),
    'admin',
    NOW()
);