-- Переносим старых подрядчиков из таблицы contractors в organizations
INSERT INTO t_p8942561_contractor_control_s.organizations 
(id, name, inn, phone, email, type, status, created_at, updated_at)
SELECT 
    c.id,
    c.name,
    c.inn,
    c.phone,
    c.email,
    'contractor' as type,
    'active' as status,
    c.created_at,
    c.updated_at
FROM t_p8942561_contractor_control_s.contractors c
WHERE NOT EXISTS (
    SELECT 1 FROM t_p8942561_contractor_control_s.organizations o 
    WHERE o.id = c.id
)
ON CONFLICT (id) DO NOTHING;

-- Обновляем последовательность, чтобы новые ID не конфликтовали
SELECT setval(
    't_p8942561_contractor_control_s.organizations_id_seq',
    (SELECT GREATEST(
        MAX(id),
        (SELECT last_value FROM t_p8942561_contractor_control_s.organizations_id_seq)
    ) FROM t_p8942561_contractor_control_s.organizations)
);