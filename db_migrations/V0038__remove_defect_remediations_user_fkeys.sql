-- Remove foreign key constraints referencing users table in defect_remediations
-- This allows backend function to work without accessing users table
ALTER TABLE defect_remediations DROP CONSTRAINT IF EXISTS defect_remediations_contractor_id_fkey;
ALTER TABLE defect_remediations DROP CONSTRAINT IF EXISTS defect_remediations_verified_by_fkey;