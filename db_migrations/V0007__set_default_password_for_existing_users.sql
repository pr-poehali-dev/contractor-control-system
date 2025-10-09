-- Установка пароля "123" для всех пользователей без пароля
-- Хеш для пароля "123" сгенерирован через bcrypt
UPDATE users 
SET password_hash = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYfLo.9eCW6'
WHERE password_hash IS NULL;