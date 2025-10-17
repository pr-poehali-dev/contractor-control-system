-- Populate missing remediation records for existing defect report
INSERT INTO t_p8942561_contractor_control_s.defect_remediations 
(defect_report_id, defect_id, contractor_id, status, created_at, updated_at)
VALUES 
  (2, '1760623344037', 5, 'pending', NOW(), NOW()),
  (2, '1760623379273', 5, 'pending', NOW(), NOW());