-- Add inspection event tracking fields to work_logs table
ALTER TABLE work_logs 
ADD COLUMN IF NOT EXISTS is_inspection_start BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_inspection_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS inspection_id INTEGER REFERENCES inspections(id),
ADD COLUMN IF NOT EXISTS defects_count INTEGER;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_work_logs_inspection_events ON work_logs(inspection_id) WHERE inspection_id IS NOT NULL;