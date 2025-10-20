-- Исправление некорректных дат в проверках (1212 год -> текущая дата)
UPDATE t_p8942561_contractor_control_s.inspections 
SET scheduled_date = CURRENT_DATE
WHERE id IN (53, 54);