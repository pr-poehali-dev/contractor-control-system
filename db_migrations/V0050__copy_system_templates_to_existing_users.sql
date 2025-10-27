-- Копирование системных шаблонов всем существующим клиентам
INSERT INTO t_p8942561_contractor_control_s.document_templates 
  (client_id, name, description, template_type, content, version, is_active, is_system)
SELECT 
  u.id,
  st.name,
  st.description,
  st.template_type,
  st.content,
  1,
  true,
  false
FROM t_p8942561_contractor_control_s.users u
CROSS JOIN t_p8942561_contractor_control_s.document_templates st
WHERE u.role = 'client' 
  AND st.is_system = true
  AND NOT EXISTS (
    SELECT 1 
    FROM t_p8942561_contractor_control_s.document_templates dt
    WHERE dt.client_id = u.id 
      AND dt.template_type = st.template_type
      AND dt.is_system = false
  );