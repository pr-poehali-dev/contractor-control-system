-- Добавляем поле organization_id в таблицу contractors
ALTER TABLE t_p8942561_contractor_control_s.contractors
ADD COLUMN IF NOT EXISTS organization_id INTEGER REFERENCES t_p8942561_contractor_control_s.organizations(id);

-- Привязываем существующего подрядчика к организации
UPDATE t_p8942561_contractor_control_s.contractors
SET organization_id = 2
WHERE id = 5 AND user_id = 12;