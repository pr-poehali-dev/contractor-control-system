import { useEffect, useRef, useState } from 'react';
import { Designer } from '@pdfme/ui';
import { Template, Font } from '@pdfme/common';
import { text, image, barcodes } from '@pdfme/schemas';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Card } from '@/components/ui/card';

interface PdfTemplateDesignerProps {
  template: Template | null;
  onSave: (template: Template) => void;
}

export function PdfTemplateDesigner({ template, onSave }: PdfTemplateDesignerProps) {
  const designerRef = useRef<HTMLDivElement>(null);
  const designerInstance = useRef<Designer | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!designerRef.current) return;

    const initDesigner = async () => {
      const blankPdfBase64 = await generateBlankPdf();
      
      const defaultTemplate: Template = template || {
        basePdf: blankPdfBase64,
        schemas: [
          [
            {
              name: 'title',
              type: 'text',
              position: { x: 20, y: 20 },
              width: 170,
              height: 15,
              fontSize: 24,
              fontColor: '#000000',
              alignment: 'left',
            },
            {
              name: 'date',
              type: 'text',
              position: { x: 20, y: 40 },
              width: 80,
              height: 10,
              fontSize: 12,
              fontColor: '#666666',
              alignment: 'left',
            },
            {
              name: 'content',
              type: 'text',
              position: { x: 20, y: 60 },
              width: 170,
              height: 100,
              fontSize: 14,
              fontColor: '#000000',
              alignment: 'left',
            },
          ],
        ],
      };

      if (!defaultTemplate.basePdf) {
        defaultTemplate.basePdf = blankPdfBase64;
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
            lang: 'ru',
            labels: {
              'clear': '✖ Очистить',
              'addPageAfter': '+ Добавить страницу после',
              'addPageBefore': '+ Добавить страницу перед',
              'duplicatePage': '⎘ Дублировать страницу',
              'deletePage': '🗑 Удалить страницу',
              'removeItem': '✖ Удалить элемент',
              'edit': '✎ Редактировать',
              'cancel': 'Отмена',
              'field': 'Поле',
              'fieldName': 'Имя поля',
              'require': 'Обязательно',
              'uniq': 'Уникально',
              'cancel': 'Отмена',
            },
          },
          plugins: {
            text,
            image,
            ...barcodes,
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

  const generateBlankPdf = async (): Promise<string> => {
    const width = 210;
    const height = 297;
    
    const canvas = document.createElement('canvas');
    canvas.width = width * 2.835;
    canvas.height = height * 2.835;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#f3f4f6';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Пустой документ A4', canvas.width / 2, canvas.height / 2);
    ctx.font = '14px Arial';
    ctx.fillText('Добавьте поля через панель справа', canvas.width / 2, canvas.height / 2 + 30);
    
    return canvas.toDataURL('image/png');
  };

  const addTextField = () => {
    if (!designerInstance.current) return;
    
    const currentTemplate = designerInstance.current.getTemplate();
    const currentPage = 0;
    
    const newField = {
      name: `field_${Date.now()}`,
      type: 'text',
      position: { x: 20, y: 80 + (currentTemplate.schemas[currentPage]?.length || 0) * 15 },
      width: 80,
      height: 10,
      fontSize: 12,
      fontColor: '#000000',
      alignment: 'left',
    };
    
    currentTemplate.schemas[currentPage].push(newField);
    designerInstance.current.updateTemplate(currentTemplate);
  };

  const addImageField = () => {
    if (!designerInstance.current) return;
    
    const currentTemplate = designerInstance.current.getTemplate();
    const currentPage = 0;
    
    const newField = {
      name: `image_${Date.now()}`,
      type: 'image',
      position: { x: 20, y: 80 + (currentTemplate.schemas[currentPage]?.length || 0) * 15 },
      width: 40,
      height: 40,
    };
    
    currentTemplate.schemas[currentPage].push(newField);
    designerInstance.current.updateTemplate(currentTemplate);
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <Icon name="Info" size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="space-y-2 text-sm text-blue-900">
            <p className="font-semibold">Как работать с редактором:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Нажмите кнопки ниже, чтобы добавить текстовые поля или изображения</li>
              <li>Перетаскивайте элементы мышью для изменения позиции</li>
              <li>Изменяйте размер элементов, растягивая за углы</li>
              <li>Кликните на элемент, чтобы редактировать его свойства справа</li>
              <li>Сохраните изменения кнопкой "Сохранить" вверху страницы</li>
            </ul>
          </div>
        </div>
      </Card>

      <div className="flex gap-2 flex-wrap">
        <Button 
          onClick={addTextField}
          variant="outline"
          size="sm"
          disabled={!isReady}
        >
          <Icon name="Type" size={16} className="mr-2" />
          Добавить текстовое поле
        </Button>
        <Button 
          onClick={addImageField}
          variant="outline"
          size="sm"
          disabled={!isReady}
        >
          <Icon name="Image" size={16} className="mr-2" />
          Добавить изображение
        </Button>
      </div>

      <div 
        ref={designerRef} 
        className="w-full border-2 border-slate-200 rounded-lg bg-slate-50 overflow-hidden"
        style={{ minHeight: '700px', height: '700px' }}
      />

      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80">
          <div className="text-center space-y-3">
            <Icon name="Loader" size={32} className="animate-spin text-blue-600 mx-auto" />
            <p className="text-sm text-slate-600">Загрузка редактора...</p>
          </div>
        </div>
      )}
    </div>
  );
}
