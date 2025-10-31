-- Добавление полей ОГРН и БИК в таблицу organizations
-- ОГРН (Основной государственный регистрационный номер) - 13 или 15 цифр
-- БИК (Банковский идентификационный код) - 9 цифр

ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS ogrn VARCHAR(15),
ADD COLUMN IF NOT EXISTS bik VARCHAR(9),
ADD COLUMN IF NOT EXISTS bank_name VARCHAR(500),
ADD COLUMN IF NOT EXISTS payment_account VARCHAR(20),
ADD COLUMN IF NOT EXISTS correspondent_account VARCHAR(20),
ADD COLUMN IF NOT EXISTS director_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS director_position VARCHAR(255);

-- Добавление флага для отслеживания заполнения реквизитов
ALTER TABLE users
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Комментарии к полям
COMMENT ON COLUMN organizations.ogrn IS 'Основной государственный регистрационный номер (13 или 15 цифр)';
COMMENT ON COLUMN organizations.bik IS 'Банковский идентификационный код (9 цифр)';
COMMENT ON COLUMN organizations.bank_name IS 'Название банка';
COMMENT ON COLUMN organizations.payment_account IS 'Расчетный счет (20 цифр)';
COMMENT ON COLUMN organizations.correspondent_account IS 'Корреспондентский счет (20 цифр)';
COMMENT ON COLUMN organizations.director_name IS 'ФИО руководителя';
COMMENT ON COLUMN organizations.director_position IS 'Должность руководителя';
COMMENT ON COLUMN users.onboarding_completed IS 'Флаг завершения онбординга (заполнения реквизитов организации)';