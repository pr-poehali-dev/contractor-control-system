-- Обновление метаданных в событиях проверок с некорректной датой 1212 года
UPDATE t_p8942561_contractor_control_s.inspection_events 
SET metadata = jsonb_set(
  COALESCE(metadata, '{}'::jsonb), 
  '{scheduled_date}', 
  to_jsonb('2025-10-20'::text)
)
WHERE inspection_id IN (53, 54) AND event_type = 'scheduled';