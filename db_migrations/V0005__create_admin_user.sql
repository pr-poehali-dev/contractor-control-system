INSERT INTO users (email, phone, password_hash, name, role, organization, is_active, created_at, updated_at)
SELECT 
  'admin@example.com',
  '+79991111111',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5ND2agjFPcmzq',
  'Администратор',
  'admin',
  'Система',
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@example.com');