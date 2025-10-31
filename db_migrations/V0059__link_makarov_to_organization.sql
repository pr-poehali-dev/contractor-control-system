-- Добавление связи заказчика Макарова с его организацией
INSERT INTO t_p8942561_contractor_control_s.user_organizations (user_id, organization_id, role)
VALUES (11, 11, 'admin')
ON CONFLICT DO NOTHING;