CREATE TABLE IF NOT EXISTS work_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    unit VARCHAR(50) NOT NULL,
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_work_types_category ON work_types(category);
CREATE INDEX idx_work_types_name ON work_types(name);

INSERT INTO work_types (name, description, unit, category) VALUES
('Кладка кирпича', 'Кладка стен из кирпича', 'м²', 'Кладочные работы'),
('Штукатурка стен', 'Оштукатуривание внутренних и наружных стен', 'м²', 'Отделочные работы'),
('Заливка бетона', 'Заливка бетонных конструкций', 'м³', 'Бетонные работы'),
('Монтаж арматуры', 'Монтаж арматурного каркаса', 'т', 'Арматурные работы'),
('Укладка плитки', 'Облицовка поверхностей керамической плиткой', 'м²', 'Плиточные работы'),
('Покраска стен', 'Окраска внутренних поверхностей', 'м²', 'Малярные работы');
