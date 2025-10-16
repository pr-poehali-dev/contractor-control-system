-- Таблица для событий проверок (планирование, старт, завершение)
CREATE TABLE IF NOT EXISTS inspection_events (
    id SERIAL PRIMARY KEY,
    inspection_id INTEGER NOT NULL REFERENCES inspections(id),
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('scheduled', 'started', 'completed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_inspection_events_inspection_id ON inspection_events(inspection_id);
CREATE INDEX idx_inspection_events_created_at ON inspection_events(created_at);

COMMENT ON TABLE inspection_events IS 'События проверок: планирование, старт, завершение';
COMMENT ON COLUMN inspection_events.event_type IS 'Тип события: scheduled (запланирована), started (начата), completed (завершена)';
COMMENT ON COLUMN inspection_events.metadata IS 'Доп. данные: кол-во замечаний и т.д.';