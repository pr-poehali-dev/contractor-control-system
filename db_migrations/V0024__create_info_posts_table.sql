-- Create info_posts table for system-wide announcements
CREATE TABLE t_p8942561_contractor_control_s.info_posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    link VARCHAR(1000),
    created_by INTEGER NOT NULL REFERENCES t_p8942561_contractor_control_s.users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_info_posts_created_at ON t_p8942561_contractor_control_s.info_posts(created_at DESC);