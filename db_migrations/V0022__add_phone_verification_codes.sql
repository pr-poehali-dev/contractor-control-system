-- Создаём таблицу для хранения кодов подтверждения
CREATE TABLE IF NOT EXISTS t_p8942561_contractor_control_s.verification_codes (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(20) NOT NULL,
    code VARCHAR(6) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    attempts INTEGER NOT NULL DEFAULT 0
);

-- Индекс для быстрого поиска по телефону
CREATE INDEX idx_verification_codes_phone ON t_p8942561_contractor_control_s.verification_codes(phone);

-- Индекс для очистки истёкших кодов
CREATE INDEX idx_verification_codes_expires_at ON t_p8942561_contractor_control_s.verification_codes(expires_at);