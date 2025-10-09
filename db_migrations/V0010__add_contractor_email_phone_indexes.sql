ALTER TABLE t_p8942561_contractor_control_s.contractors 
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS phone VARCHAR(50);

CREATE INDEX IF NOT EXISTS idx_contractors_inn 
ON t_p8942561_contractor_control_s.contractors(inn);

CREATE INDEX IF NOT EXISTS idx_client_contractors_client 
ON t_p8942561_contractor_control_s.client_contractors(client_id);

CREATE INDEX IF NOT EXISTS idx_client_contractors_contractor 
ON t_p8942561_contractor_control_s.client_contractors(contractor_id);