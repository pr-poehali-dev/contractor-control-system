-- Add last_seen_at tracking for users viewing works
CREATE TABLE IF NOT EXISTS work_views (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    work_id INTEGER NOT NULL REFERENCES works(id),
    last_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, work_id)
);

CREATE INDEX IF NOT EXISTS idx_work_views_user_work ON work_views(user_id, work_id);
CREATE INDEX IF NOT EXISTS idx_work_views_last_seen ON work_views(last_seen_at);