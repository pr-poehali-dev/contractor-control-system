import { useEffect, useRef, useState } from 'react';
import { Designer } from '@pdfme/ui';
import { Template, Font, Schema } from '@pdfme/common';
import { text, image, barcodes } from '@pdfme/schemas';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { jsPDF } from 'jspdf';

interface PdfTemplateDesignerProps {
  template: Template | null;
  onSave: (template: Template) => void;
}

export function PdfTemplateDesigner({ template, onSave }: PdfTemplateDesignerProps) {
  const designerRef = useRef<HTMLDivElement>(null);
  const designerInstance = useRef<Designer | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [fieldType, setFieldType] = useState<string>('text');
  const [fieldName, setFieldName] = useState('');

  useEffect(() => {
    if (!designerRef.current) return;

    const initDesigner = async () => {
      const blankPdfBase64 = await generateBlankPdf();
      
      let defaultTemplate: Template;
      
      if (template && template.basePdf && typeof template.basePdf === 'string' && template.basePdf.length > 100) {
        defaultTemplate = {
          ...template,
          basePdf: template.basePdf.includes('data:') ? template.basePdf.split(',')[1] : template.basePdf,
        };
      } else {
        defaultTemplate = {
          basePdf: blankPdfBase64,
          schemas: template?.schemas || [
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

  const generateBlankPdf = async (): Promise<string> => {
    const doc = new jsPDF({
      format: 'a4',
      unit: 'mm',
    });
    
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 210, 297, 'F');
    
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.5);
    doc.rect(5, 5, 200, 287, 'S');
    
    doc.setTextColor(156, 163, 175);
    doc.setFontSize(16);
    doc.text('Пустой документ A4', 105, 140, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text('Добавьте поля через панель ниже', 105, 150, { align: 'center' });
    
    const pdfData = doc.output('datauristring');
    return pdfData.split(',')[1];
  };

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

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <Icon name="Info" size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="space-y-2 text-sm text-blue-900">
            <p className="font-semibold">Как работать с редактором:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Выберите тип поля, введите имя и нажмите "Добавить поле"</li>
              <li>Перетаскивайте элементы мышью для изменения позиции</li>
              <li>Изменяйте размер элементов, растягивая за углы</li>
              <li>Кликните на элемент, чтобы редактировать его свойства справа</li>
              <li>Добавляйте/удаляйте страницы кнопками внизу</li>
              <li>Сохраните изменения кнопкой "Сохранить" вверху страницы</li>
            </ul>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Тип поля</Label>
              <Select value={fieldType} onValueChange={setFieldType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">
                    <div className="flex items-center gap-2">
                      <Icon name="Type" size={16} />
                      Текст
                    </div>
                  </SelectItem>
                  <SelectItem value="image">
                    <div className="flex items-center gap-2">
                      <Icon name="Image" size={16} />
                      Изображение
                    </div>
                  </SelectItem>
                  <SelectItem value="qrcode">
                    <div className="flex items-center gap-2">
                      <Icon name="QrCode" size={16} />
                      QR-код
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Имя поля</Label>
              <Input
                value={fieldName}
                onChange={(e) => setFieldName(e.target.value)}
                placeholder="Например: название_компании"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addField();
                  }
                }}
              />
            </div>

            <div className="flex items-end">
              <Button 
                onClick={addField}
                disabled={!isReady || !fieldName.trim()}
                className="w-full"
              >
                <Icon name="Plus" size={16} className="mr-2" />
                Добавить поле
              </Button>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap pt-2 border-t">
            <Button 
              onClick={addPage}
              variant="outline"
              size="sm"
              disabled={!isReady}
            >
              <Icon name="FilePlus" size={16} className="mr-2" />
              Добавить страницу
            </Button>
            <Button 
              onClick={removePage}
              variant="outline"
              size="sm"
              disabled={!isReady}
            >
              <Icon name="FileMinus" size={16} className="mr-2" />
              Удалить последнюю страницу
            </Button>
          </div>
        </div>
      </Card>

      <div className="relative">
        <div 
          ref={designerRef} 
          className="w-full border-2 border-slate-200 rounded-lg bg-slate-50 overflow-hidden"
          style={{ minHeight: '700px', height: '700px' }}
        />

        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
            <div className="text-center space-y-3">
              <Icon name="Loader" size={32} className="animate-spin text-blue-600 mx-auto" />
              <p className="text-sm text-slate-600">Загрузка редактора...</p>
            </div>
          </div>
        )}
      </div>

      <Card className="p-4 bg-slate-50">
        <div className="space-y-2 text-xs text-slate-600">
          <p className="font-semibold">Доступные типы полей:</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div>
              <span className="font-medium">Текст:</span> Любой текстовый контент, заголовки, описания
            </div>
            <div>
              <span className="font-medium">Изображение:</span> Логотипы, подписи, фото
            </div>
            <div>
              <span className="font-medium">QR-код:</span> Ссылки, идентификаторы, контакты
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}