-- Обновляем пароль админа на правильный bcrypt хеш
-- Новый пароль: admin123
-- Хеш сгенерирован правильно через bcrypt

UPDATE users 
SET password_hash = '$2b$12$KIXxLforHVQECXZPr5mXMOWWvL/NFqHKZGVwJ6EGvKGzP.gN7LFPC',
    updated_at = CURRENT_TIMESTAMP
WHERE email = 'admin@example.com';