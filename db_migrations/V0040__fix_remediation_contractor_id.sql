-- Update remediation records to correct contractor_id (user_id 12 instead of contractor_id 5)
UPDATE t_p8942561_contractor_control_s.defect_remediations
SET contractor_id = 12
WHERE contractor_id = 5;