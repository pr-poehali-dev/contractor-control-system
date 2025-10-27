import { useEffect, useRef, useState, useCallback } from 'react';
import { Designer } from '@pdfme/ui';
import { Template, Font, Schema, BLANK_PDF } from '@pdfme/common';
import { text, image, barcodes } from '@pdfme/schemas';
import { generate } from '@pdfme/generator';
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
  const isInitialized = useRef(false);
  const currentTemplateRef = useRef<Template | null>(null);

  useEffect(() => {
    if (!designerRef.current) return;
    if (isInitialized.current && designerInstance.current) {
      if (template && template.basePdf) {
        const currentDesignerTemplate = designerInstance.current.getTemplate();
        if (JSON.stringify(currentDesignerTemplate) !== JSON.stringify(template)) {
          console.log('Updating designer with new template from props');
          designerInstance.current.updateTemplate(template);
          currentTemplateRef.current = template;
        }
      }
      return;
    }

    const initDesigner = async () => {
      const blankPdfBase64 = getBlankPdf();
      
      let defaultTemplate: Template;
      
      if (template && template.basePdf) {
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
          schemas: [[]],
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

        currentTemplateRef.current = defaultTemplate;

        designerInstance.current.onSaveTemplate((updatedTemplate) => {
          console.log('Template auto-saved:', updatedTemplate.schemas.length, 'pages');
          currentTemplateRef.current = updatedTemplate;
          if (onSave) {
            onSave(updatedTemplate);
          }
        });
        
        isInitialized.current = true;
        setIsReady(true);
        console.log('PDF Designer initialized with', defaultTemplate.schemas.length, 'page(s)');
      } catch (error) {
        console.error('Failed to initialize PDF designer:', error);
      }
    };

    initDesigner();

    return () => {
      if (designerInstance.current) {
        designerInstance.current.destroy();
        designerInstance.current = null;
        isInitialized.current = false;
      }
    };
  }, [template]);

  const addField = useCallback(() => {
    if (!designerInstance.current || !fieldName.trim()) return;
    
    const currentTemplate = designerInstance.current.getTemplate();
    const currentPage = 0;
    
    if (!currentTemplate.schemas[currentPage]) {
      currentTemplate.schemas[currentPage] = [];
    }
    
    const baseConfig = {
      name: fieldName.trim(),
      position: { 
        x: 20, 
        y: 80 + (currentTemplate.schemas[currentPage].length) * 15 
      },
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
    currentTemplateRef.current = currentTemplate;
    if (onSave) {
      onSave(currentTemplate);
    }
    setFieldName('');
    console.log('Field added:', newField.name);
  }, [fieldType, fieldName, onSave]);

  const addPage = useCallback(async () => {
    if (!designerInstance.current) return;
    
    try {
      const currentTemplate = designerInstance.current.getTemplate();
      console.log('Adding page. Current pages:', currentTemplate.schemas.length);
      
      let basePdfData = currentTemplate.basePdf;
      if (typeof basePdfData === 'string') {
        basePdfData = basePdfData.includes('data:') 
          ? basePdfData.split(',')[1] 
          : basePdfData;
      }

      const plugins = {
        text,
        image,
        qrcode: barcodes.qrcode,
      };

      const dummyInputs = currentTemplate.schemas.map(() => ({}));
      dummyInputs.push({});

      const multiPagePdf = await generate({
        template: {
          basePdf: basePdfData,
          schemas: [...currentTemplate.schemas, []],
        },
        inputs: dummyInputs,
        plugins,
      });

      const pdfBlob = new Blob([multiPagePdf.buffer], { type: 'application/pdf' });
      const reader = new FileReader();
      
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        
        const newTemplate = {
          ...currentTemplate,
          basePdf: base64,
          schemas: [...currentTemplate.schemas, []],
        };
        
        designerInstance.current?.updateTemplate(newTemplate);
        currentTemplateRef.current = newTemplate;
        if (onSave) {
          onSave(newTemplate);
        }
        console.log('Page added successfully. Total pages:', newTemplate.schemas.length);
      };
      
      reader.readAsDataURL(pdfBlob);
    } catch (error) {
      console.error('Failed to add page:', error);
    }
  }, [onSave]);

  const removePage = useCallback(async () => {
    if (!designerInstance.current) return;
    
    const currentTemplate = designerInstance.current.getTemplate();
    if (currentTemplate.schemas.length <= 1) {
      console.log('Cannot remove the last page');
      return;
    }
    
    try {
      console.log('Removing page. Current pages:', currentTemplate.schemas.length);
      
      let basePdfData = currentTemplate.basePdf;
      if (typeof basePdfData === 'string') {
        basePdfData = basePdfData.includes('data:') 
          ? basePdfData.split(',')[1] 
          : basePdfData;
      }

      const plugins = {
        text,
        image,
        qrcode: barcodes.qrcode,
      };

      const newSchemas = currentTemplate.schemas.slice(0, -1);
      const dummyInputs = newSchemas.map(() => ({}));

      const multiPagePdf = await generate({
        template: {
          basePdf: basePdfData,
          schemas: newSchemas,
        },
        inputs: dummyInputs,
        plugins,
      });

      const pdfBlob = new Blob([multiPagePdf.buffer], { type: 'application/pdf' });
      const reader = new FileReader();
      
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        
        const newTemplate = {
          ...currentTemplate,
          basePdf: base64,
          schemas: newSchemas,
        };
        
        designerInstance.current?.updateTemplate(newTemplate);
        currentTemplateRef.current = newTemplate;
        if (onSave) {
          onSave(newTemplate);
        }
        console.log('Page removed successfully. Total pages:', newTemplate.schemas.length);
      };
      
      reader.readAsDataURL(pdfBlob);
    } catch (error) {
      console.error('Failed to remove page:', error);
    }
  }, [onSave]);

  const loadPreset = useCallback((presetKey: keyof typeof PRESET_TEMPLATES) => {
    if (!designerInstance.current) return;
    
    const preset = PRESET_TEMPLATES[presetKey];
    const currentTemplate = designerInstance.current.getTemplate();
    
    const newTemplate = {
      ...currentTemplate,
      schemas: preset.schemas,
    };
    
    designerInstance.current.updateTemplate(newTemplate);
    currentTemplateRef.current = newTemplate;
    if (onSave) {
      onSave(newTemplate);
    }
    setShowPresets(false);
    console.log('Preset loaded:', presetKey);
  }, [onSave]);

  const getCurrentTemplate = useCallback((): Template | null => {
    if (!designerInstance.current) return currentTemplateRef.current;
    return designerInstance.current.getTemplate();
  }, []);

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