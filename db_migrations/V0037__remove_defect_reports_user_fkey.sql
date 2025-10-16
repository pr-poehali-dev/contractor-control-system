-- Remove foreign key constraint on created_by in defect_reports
-- This allows backend function to create reports without accessing users table
ALTER TABLE defect_reports DROP CONSTRAINT IF EXISTS defect_reports_created_by_fkey;