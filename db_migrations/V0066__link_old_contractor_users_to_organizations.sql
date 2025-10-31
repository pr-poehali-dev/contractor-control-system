-- Обновляем organization_id для пользователей, которые были созданы через старую таблицу contractors
UPDATE t_p8942561_contractor_control_s.users u
SET organization_id = c.id
FROM t_p8942561_contractor_control_s.contractors c
WHERE u.id = c.user_id 
  AND u.organization_id IS NULL
  AND c.user_id IS NOT NULL;

-- Создаём связи в user_organizations для этих пользователей
INSERT INTO t_p8942561_contractor_control_s.user_organizations (user_id, organization_id, role, created_at)
SELECT c.user_id, c.id, 'admin', NOW()
FROM t_p8942561_contractor_control_s.contractors c
WHERE c.user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM t_p8942561_contractor_control_s.user_organizations uo 
    WHERE uo.user_id = c.user_id AND uo.organization_id = c.id
  );