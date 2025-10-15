-- Migrate existing dates from start_date/end_date to planned_start_date/planned_end_date
UPDATE works 
SET 
  planned_start_date = start_date,
  planned_end_date = end_date
WHERE 
  start_date IS NOT NULL 
  AND planned_start_date IS NULL;