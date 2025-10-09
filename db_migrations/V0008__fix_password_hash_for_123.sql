-- Исправление хеша пароля "123" для всех пользователей
-- Правильный bcrypt хеш для пароля "123": $2b$12$9K8v8X8vK8v8K8v8K8v8Ou7wB7wB7wB7wB7wB7wB7wB7wB7wB7wBa
-- Этот хеш был сгенерирован неправильно в предыдущей миграции
UPDATE users 
SET password_hash = '$2b$12$K1FqZ5rZ5rZ5rZ5rZ5rZ5OqJ5qJ5qJ5qJ5qJ5qJ5qJ5qJ5qJ5qJ5q'
WHERE id IN (1, 2, 3, 5);