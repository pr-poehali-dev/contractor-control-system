ALTER TABLE t_p8942561_contractor_control_s.document_templates 
ADD COLUMN is_system BOOLEAN DEFAULT FALSE;

CREATE INDEX idx_document_templates_is_system 
ON t_p8942561_contractor_control_s.document_templates(is_system);

COMMENT ON COLUMN t_p8942561_contractor_control_s.document_templates.is_system 
IS 'True for system templates that are created by default for each user';
