import { useEffect, useRef, useState } from 'react';
import { Designer } from '@pdfme/ui';
import { Template, Font, Schema, BLANK_PDF } from '@pdfme/common';
import { text, image, barcodes } from '@pdfme/schemas';
import { PRESET_TEMPLATES } from './pdf-presets';

const getBlankPdf = (): string => {
  return BLANK_PDF;
};

interface UsePdfDesignerProps {
  template: Template | null;
  onSave: (template: Template) => void;
}

export function usePdfDesigner({ template, onSave }: UsePdfDesignerProps) {
  const designerRef = useRef<HTMLDivElement>(null);
  const designerInstance = useRef<Designer | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [fieldType, setFieldType] = useState<string>('text');
  const [fieldName, setFieldName] = useState('');
  const [showPresets, setShowPresets] = useState(false);

  useEffect(() => {
    if (!designerRef.current) return;

    const initDesigner = async () => {
      const blankPdfBase64 = getBlankPdf();
      
      let defaultTemplate: Template;
      let useBlankPdf = true;
      
      if (template && template.basePdf) {
        if (typeof template.basePdf === 'string' && template.basePdf.length > 100) {
          let pdfData = template.basePdf;
          
          if (pdfData.includes('data:')) {
            pdfData = pdfData.split(',')[1];
          }
          
          if (pdfData.startsWith('JVBERi0')) {
            useBlankPdf = false;
            defaultTemplate = {
              ...template,
              basePdf: pdfData,
            };
          }
        }
      }
      
      if (useBlankPdf) {
        defaultTemplate = {
          basePdf: blankPdfBase64,
          schemas: template?.schemas || [[]],
        };
      }

      const font: Font = {
        Roboto: {
          data: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5WZLCzYlKw.ttf',
          fallback: true,
        },
      };

      try {
        if (designerInstance.current) {
          designerInstance.current.destroy();
        }

        designerInstance.current = new Designer({
          domContainer: designerRef.current,
          template: defaultTemplate,
          options: {
            font,
          },
          plugins: {
            text,
            image,
            qrcode: barcodes.qrcode,
          },
        });

        designerInstance.current.onSaveTemplate(onSave);
        setIsReady(true);
      } catch (error) {
        console.error('Failed to initialize PDF designer:', error);
      }
    };

    initDesigner();

    return () => {
      if (designerInstance.current) {
        designerInstance.current.destroy();
        designerInstance.current = null;
      }
    };
  }, [template, onSave]);

  const addField = () => {
    if (!designerInstance.current || !fieldName.trim()) return;
    
    const currentTemplate = designerInstance.current.getTemplate();
    const currentPage = 0;
    
    const baseConfig = {
      name: fieldName.trim(),
      position: { x: 20, y: 80 + (currentTemplate.schemas[currentPage]?.length || 0) * 15 },
    };

    let newField: Schema;

    switch (fieldType) {
      case 'text':
        newField = {
          ...baseConfig,
          type: 'text',
          width: 80,
          height: 10,
          fontSize: 12,
          fontColor: '#000000',
          alignment: 'left',
        };
        break;
      case 'image':
        newField = {
          ...baseConfig,
          type: 'image',
          width: 40,
          height: 40,
        };
        break;
      case 'qrcode':
        newField = {
          ...baseConfig,
          type: 'qrcode',
          width: 30,
          height: 30,
        };
        break;
      default:
        return;
    }
    
    currentTemplate.schemas[currentPage].push(newField);
    designerInstance.current.updateTemplate(currentTemplate);
    setFieldName('');
  };

  const addPage = () => {
    if (!designerInstance.current) return;
    
    const currentTemplate = designerInstance.current.getTemplate();
    currentTemplate.schemas.push([]);
    designerInstance.current.updateTemplate(currentTemplate);
  };

  const removePage = () => {
    if (!designerInstance.current) return;
    
    const currentTemplate = designerInstance.current.getTemplate();
    if (currentTemplate.schemas.length > 1) {
      currentTemplate.schemas.pop();
      designerInstance.current.updateTemplate(currentTemplate);
    }
  };

  const loadPreset = (presetKey: keyof typeof PRESET_TEMPLATES) => {
    if (!designerInstance.current) return;
    
    const preset = PRESET_TEMPLATES[presetKey];
    const currentTemplate = designerInstance.current.getTemplate();
    
    const newTemplate = {
      ...currentTemplate,
      schemas: preset.schemas,
    };
    
    designerInstance.current.updateTemplate(newTemplate);
    setShowPresets(false);
  };

  return {
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
  };
}
