-- Обновляем владельца тестовых проектов на текущего пользователя (ID=7)
UPDATE projects SET client_id = 7 WHERE id IN (11, 12);

-- Помечаем старые проекты как архивные
UPDATE projects SET status = 'archived' WHERE id IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
