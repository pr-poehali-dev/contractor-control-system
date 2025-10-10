ALTER TABLE t_p8942561_contractor_control_s.work_templates 
ADD COLUMN IF NOT EXISTS category VARCHAR(255);

UPDATE t_p8942561_contractor_control_s.work_templates 
SET category = CASE 
  WHEN title LIKE '%кровл%' THEN 'Кровельные работы'
  WHEN title LIKE '%окон%' THEN 'Оконные и дверные работы'
  WHEN title LIKE '%отопл%' THEN 'Системы отопления'
  WHEN title LIKE '%вентиляц%' THEN 'Вентиляция и кондиционирование'
  WHEN title LIKE '%фасад%' THEN 'Фасадные работы'
  WHEN title LIKE '%электр%' THEN 'Электромонтажные работы'
  WHEN title LIKE '%подвал%' OR title LIKE '%гидроизол%' THEN 'Гидроизоляция и подвалы'
  WHEN title LIKE '%водоотвед%' OR title LIKE '%ливнёв%' THEN 'Водоотведение'
  WHEN title LIKE '%отмостк%' OR title LIKE '%входн%' OR title LIKE '%крыльц%' THEN 'Благоустройство территории'
  WHEN title LIKE '%прибор%' OR title LIKE '%учёт%' THEN 'Приборы учета'
  ELSE 'Общестроительные работы'
END
WHERE category IS NULL;