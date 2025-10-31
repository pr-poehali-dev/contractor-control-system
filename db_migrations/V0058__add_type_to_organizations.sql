-- Добавляем поле type к таблице organizations
ALTER TABLE t_p8942561_contractor_control_s.organizations
ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'contractor' CHECK (type IN ('client', 'contractor'));

-- Обновляем существующие записи: если организация связана с пользователем role='client', то это клиентская организация
UPDATE t_p8942561_contractor_control_s.organizations o
SET type = 'client'
FROM t_p8942561_contractor_control_s.users u
WHERE o.created_by = u.id AND u.role = 'client';

-- Создаем индекс для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_organizations_type ON t_p8942561_contractor_control_s.organizations(type);