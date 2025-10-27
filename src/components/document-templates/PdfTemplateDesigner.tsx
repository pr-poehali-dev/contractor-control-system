import { useEffect, useRef } from 'react';
import { Designer } from '@pdfme/ui';
import { Template, Font } from '@pdfme/common';
import { text, image } from '@pdfme/schemas';

interface PdfTemplateDesignerProps {
  template: Template | null;
  onSave: (template: Template) => void;
}

export function PdfTemplateDesigner({ template, onSave }: PdfTemplateDesignerProps) {
  const designerRef = useRef<HTMLDivElement>(null);
  const designerInstance = useRef<Designer | null>(null);

  useEffect(() => {
    if (!designerRef.current) return;

    const initDesigner = async () => {
      const defaultTemplate: Template = template || {
        basePdf: '',
        schemas: [
          [
            {
              name: 'title',
              type: 'text',
              position: { x: 20, y: 20 },
              width: 170,
              height: 10,
              fontSize: 18,
            },
          ],
        ],
      };

      const font: Font = {
        NotoSerifJP: {
          data: 'https://fonts.gstatic.com/s/notoserifjp/v7/xn77YHs72GKoTvER4Gn3b5eMZBaPRkgfU8fEwb0.woff2',
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
            lang: 'ru',
            labels: {
              'clear': 'Очистить',
              'addPageAfter': 'Добавить страницу после',
              'addPageBefore': 'Добавить страницу перед',
              'duplicatePage': 'Дублировать страницу',
              'deletePage': 'Удалить страницу',
              'removeItem': 'Удалить элемент',
              'edit': 'Редактировать',
            },
          },
          plugins: {
            text,
            image,
          },
        });

        designerInstance.current.onSaveTemplate(onSave);
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

  return (
    <div 
      ref={designerRef} 
      className="w-full h-[700px] border rounded-lg bg-white"
      style={{ minHeight: '700px' }}
    />
  );
}
