-- Добавляем foreign key constraint на таблицу organizations
ALTER TABLE t_p8942561_contractor_control_s.client_contractors
ADD CONSTRAINT client_contractors_contractor_id_fkey 
FOREIGN KEY (contractor_id) 
REFERENCES t_p8942561_contractor_control_s.organizations(id);