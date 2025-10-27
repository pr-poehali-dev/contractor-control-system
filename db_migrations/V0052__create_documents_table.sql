CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    template_id INTEGER NOT NULL,
    template_name VARCHAR(500) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    content_data JSONB NOT NULL DEFAULT '{}',
    html_content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_template_id ON documents(template_id);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);