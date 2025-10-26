-- Создаем организацию для ООО Строй Подряд (подрядчик с id=5)
INSERT INTO t_p8942561_contractor_control_s.organizations 
  (name, inn, kpp, legal_address, phone, email, status, created_by, created_at, updated_at)
VALUES 
  (
    'ООО Строй Подряд',
    '7743123456',
    '774301001',
    'г. Москва, ул. Строительная, д. 10, оф. 5',
    '+7 (999) 999-99-99',
    'info@stroypodriad.ru',
    'active',
    12,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  );

-- Создаем таблицу связи пользователей с организациями, если её нет
CREATE TABLE IF NOT EXISTS t_p8942561_contractor_control_s.user_organizations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES t_p8942561_contractor_control_s.users(id),
  organization_id INTEGER NOT NULL REFERENCES t_p8942561_contractor_control_s.organizations(id),
  role VARCHAR(50) DEFAULT 'member',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, organization_id)
);

-- Привязываем пользователя-подрядчика к организации
INSERT INTO t_p8942561_contractor_control_s.user_organizations (user_id, organization_id, role)
SELECT 12, id, 'admin' 
FROM t_p8942561_contractor_control_s.organizations 
WHERE name = 'ООО Строй Подряд' AND inn = '7743123456'
ON CONFLICT (user_id, organization_id) DO NOTHING;