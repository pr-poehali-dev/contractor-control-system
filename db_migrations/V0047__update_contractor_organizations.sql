-- Обновляем поле organization у подрядчиков, беря название из таблицы contractors
UPDATE t_p8942561_contractor_control_s.users u 
SET organization = c.name 
FROM t_p8942561_contractor_control_s.contractors c 
WHERE u.id = c.user_id 
  AND u.role = 'contractor' 
  AND (u.organization IS NULL OR u.organization = '');