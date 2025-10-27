-- Добавляем поле phone в таблицу organization_invites
ALTER TABLE t_p8942561_contractor_control_s.organization_invites 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20);