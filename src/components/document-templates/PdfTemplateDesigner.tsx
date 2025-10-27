import { Template } from '@pdfme/common';
import { usePdfDesigner } from './usePdfDesigner';
import { DesignerHeader } from './DesignerHeader';
import { FieldControls } from './FieldControls';
import { DesignerCanvas } from './DesignerCanvas';

interface PdfTemplateDesignerProps {
  template: Template | null;
  onSave: (template: Template) => void;
}

export function PdfTemplateDesigner({ template, onSave }: PdfTemplateDesignerProps) {
  const {
    designerRef,
    isReady,
    fieldType,
    fieldName,
    showPresets,
    setFieldType,
    setFieldName,
    setShowPresets,
    addField,
    addPage,
    removePage,
    loadPreset,
    getCurrentTemplate,
  } = usePdfDesigner({ template, onSave });

  return (
    <div className="space-y-6">
      <DesignerHeader
        showPresets={showPresets}
        onShowPresetsChange={setShowPresets}
        onLoadPreset={loadPreset}
        currentTemplate={getCurrentTemplate()}
      />

      <FieldControls
        fieldType={fieldType}
        fieldName={fieldName}
        onFieldTypeChange={setFieldType}
        onFieldNameChange={setFieldName}
        onAddField={addField}
        onAddPage={addPage}
        onRemovePage={removePage}
      />

      <DesignerCanvas ref={designerRef} isReady={isReady} />
    </div>
  );
}