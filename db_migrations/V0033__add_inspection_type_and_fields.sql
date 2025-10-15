ALTER TABLE t_p8942561_contractor_control_s.inspections 
ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'scheduled',
ADD COLUMN IF NOT EXISTS title VARCHAR(255);

UPDATE t_p8942561_contractor_control_s.inspections 
SET type = 'scheduled' 
WHERE type IS NULL;

COMMENT ON COLUMN t_p8942561_contractor_control_s.inspections.type IS 'scheduled или unscheduled';
COMMENT ON COLUMN t_p8942561_contractor_control_s.inspections.title IS 'Название проверки';