import { useEffect, useRef, useState, useCallback } from 'react';
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
  const [currentTemplate, setCurrentTemplate] = useState<Template | null>(null);
  const onSaveRef = useRef(onSave);

  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  useEffect(() => {
    if (!designerRef.current) return;

    const initDesigner = async () => {
      const blankPdfBase64 = getBlankPdf();
      
      let defaultTemplate: Template;
      
      if (currentTemplate && currentTemplate.basePdf) {
        defaultTemplate = currentTemplate;
      } else if (template && template.basePdf) {
        if (typeof template.basePdf === 'string' && template.basePdf.length > 100) {
          let pdfData = template.basePdf;
          
          if (pdfData.includes('data:')) {
            pdfData = pdfData.split(',')[1];
          }
          
          if (pdfData.startsWith('JVBERi0')) {
            defaultTemplate = {
              ...template,
              basePdf: pdfData,
            };
          } else {
            defaultTemplate = {
              basePdf: blankPdfBase64,
              schemas: template?.schemas || [[]],
            };
          }
        } else {
          defaultTemplate = {
            basePdf: blankPdfBase64,
            schemas: template?.schemas || [[]],
          };
        }
      } else {
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

        designerInstance.current.onSaveTemplate((updatedTemplate) => {
          setCurrentTemplate(updatedTemplate);
          onSaveRef.current(updatedTemplate);
        });
        
        setCurrentTemplate(defaultTemplate);
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
  }, [template]);

  const addField = useCallback(() => {
    if (!designerInstance.current || !fieldName.trim()) return;
    
    const template = designerInstance.current.getTemplate();
    const currentPage = 0;
    
    if (!template.schemas[currentPage]) {
      template.schemas[currentPage] = [];
    }
    
    const baseConfig = {
      name: fieldName.trim(),
      position: { x: 20, y: 80 + (template.schemas[currentPage].length) * 15 },
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
    
    template.schemas[currentPage].push(newField);
    designerInstance.current.updateTemplate(template);
    setFieldName('');
  }, [fieldType, fieldName]);

  const addPage = useCallback(() => {
    if (!designerInstance.current) return;
    
    const template = designerInstance.current.getTemplate();
    
    let basePdfArray: string[];
    if (Array.isArray(template.basePdf)) {
      basePdfArray = [...template.basePdf];
    } else {
      basePdfArray = [template.basePdf];
    }
    
    basePdfArray.push(basePdfArray[0]);
    
    const newTemplate = {
      ...template,
      basePdf: basePdfArray,
      schemas: [...template.schemas, []],
    };
    
    designerInstance.current.updateTemplate(newTemplate);
  }, []);

  const removePage = useCallback(() => {
    if (!designerInstance.current) return;
    
    const template = designerInstance.current.getTemplate();
    if (template.schemas.length <= 1) return;
    
    let basePdfArray: string[];
    if (Array.isArray(template.basePdf)) {
      basePdfArray = template.basePdf.slice(0, -1);
    } else {
      basePdfArray = [template.basePdf];
    }
    
    const newTemplate = {
      ...template,
      basePdf: basePdfArray.length === 1 ? basePdfArray[0] : basePdfArray,
      schemas: template.schemas.slice(0, -1),
    };
    
    designerInstance.current.updateTemplate(newTemplate);
  }, []);

  const loadPreset = useCallback((presetKey: keyof typeof PRESET_TEMPLATES) => {
    if (!designerInstance.current) return;
    
    const preset = PRESET_TEMPLATES[presetKey];
    const template = designerInstance.current.getTemplate();
    
    const newTemplate = {
      ...template,
      schemas: preset.schemas,
    };
    
    designerInstance.current.updateTemplate(newTemplate);
    setShowPresets(false);
  }, []);

  const getCurrentTemplate = useCallback((): Template | null => {
    if (!designerInstance.current) return currentTemplate;
    return designerInstance.current.getTemplate();
  }, [currentTemplate]);

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
    getCurrentTemplate,
  };
}
