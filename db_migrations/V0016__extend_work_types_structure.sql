ALTER TABLE work_types 
ADD COLUMN IF NOT EXISTS code VARCHAR(50),
ADD COLUMN IF NOT EXISTS normative_base TEXT,
ADD COLUMN IF NOT EXISTS control_points TEXT,
ADD COLUMN IF NOT EXISTS typical_defects TEXT,
ADD COLUMN IF NOT EXISTS acceptance_criteria TEXT;

CREATE INDEX IF NOT EXISTS idx_work_types_code ON work_types(code);
