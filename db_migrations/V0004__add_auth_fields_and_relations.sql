-- Добавляем поля для аутентификации в users
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;

-- Создаем уникальные индексы для поиска
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- Добавляем связь подрядчика с пользователем (один подрядчик = один user)
ALTER TABLE contractors ADD COLUMN IF NOT EXISTS user_id INTEGER;
ALTER TABLE contractors ADD CONSTRAINT fk_contractor_user FOREIGN KEY (user_id) REFERENCES users(id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_contractors_user_id ON contractors(user_id) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_contractors_inn ON contractors(inn);

-- Улучшаем таблицу contractor_invites
ALTER TABLE contractor_invites ADD COLUMN IF NOT EXISTS client_id INTEGER;
ALTER TABLE contractor_invites ADD COLUMN IF NOT EXISTS contractor_id INTEGER;
ALTER TABLE contractor_invites ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE contractor_invites ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE contractor_invites ADD CONSTRAINT fk_invite_client FOREIGN KEY (client_id) REFERENCES users(id);
ALTER TABLE contractor_invites ADD CONSTRAINT fk_invite_contractor FOREIGN KEY (contractor_id) REFERENCES contractors(id);

-- Создаем таблицу связей заказчик-подрядчик (many-to-many)
CREATE TABLE IF NOT EXISTS client_contractors (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES users(id),
    contractor_id INTEGER NOT NULL REFERENCES contractors(id),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(client_id, contractor_id)
);
CREATE INDEX IF NOT EXISTS idx_client_contractors_client ON client_contractors(client_id);
CREATE INDEX IF NOT EXISTS idx_client_contractors_contractor ON client_contractors(contractor_id);

-- Улучшаем связи projects
ALTER TABLE projects ADD CONSTRAINT fk_project_client FOREIGN KEY (client_id) REFERENCES users(id);
CREATE INDEX IF NOT EXISTS idx_projects_client ON projects(client_id);

-- Улучшаем связи objects
ALTER TABLE objects ADD CONSTRAINT fk_object_project FOREIGN KEY (project_id) REFERENCES projects(id);
CREATE INDEX IF NOT EXISTS idx_objects_project ON objects(project_id);

-- Улучшаем связи works
ALTER TABLE works ADD CONSTRAINT fk_work_object FOREIGN KEY (object_id) REFERENCES objects(id);
ALTER TABLE works ADD COLUMN IF NOT EXISTS contractor_id INTEGER;
ALTER TABLE works ADD CONSTRAINT fk_work_contractor FOREIGN KEY (contractor_id) REFERENCES contractors(id);
CREATE INDEX IF NOT EXISTS idx_works_object ON works(object_id);
CREATE INDEX IF NOT EXISTS idx_works_contractor ON works(contractor_id);

-- Создаем таблицу для сессий
CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_agent TEXT,
    ip_address VARCHAR(45)
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON user_sessions(expires_at);

-- Комментарии для документации
COMMENT ON TABLE users IS 'Пользователи системы (заказчики, подрядчики, админы)';
COMMENT ON TABLE contractors IS 'Данные подрядных организаций (ИНН, название, контакты)';
COMMENT ON TABLE client_contractors IS 'Связь заказчиков с их подрядчиками';
COMMENT ON TABLE contractor_invites IS 'Приглашения подрядчиков от заказчиков';
COMMENT ON COLUMN users.password_hash IS 'Хеш пароля (bcrypt)';
COMMENT ON COLUMN contractors.user_id IS 'Связь с пользователем-подрядчиком';
