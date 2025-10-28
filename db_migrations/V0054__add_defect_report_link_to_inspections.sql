-- Добавляем ссылку на документ акта об обнаружении дефектов
ALTER TABLE "t_p8942561_contractor_control_s".inspections 
ADD COLUMN IF NOT EXISTS defect_report_document_id INTEGER;

-- Индекс для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_inspections_defect_report_document 
ON "t_p8942561_contractor_control_s".inspections(defect_report_document_id);

COMMENT ON COLUMN "t_p8942561_contractor_control_s".inspections.defect_report_document_id IS 'ID документа акта об обнаружении дефектов (documents.id), созданного по результатам проверки';