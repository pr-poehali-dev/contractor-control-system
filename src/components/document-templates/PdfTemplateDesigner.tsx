import { useEffect, useRef, useState } from 'react';
import { Designer } from '@pdfme/ui';
import { Template, Font, Schema, BLANK_PDF } from '@pdfme/common';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface PdfTemplateDesignerProps {
  template: Template | null;
  onSave: (template: Template) => void;
}

const getBlankPdf = (): string => {
  return BLANK_PDF;
};

const PRESET_TEMPLATES = {
  contract: {
    name: 'Договор',
    icon: 'FileText',
    schemas: [[
      {
        name: 'contract_number',
        type: 'text',
        position: { x: 150, y: 15 },
        width: 40,
        height: 8,
        fontSize: 10,
        fontColor: '#000000',
        alignment: 'left',
      },
      {
        name: 'contract_date',
        type: 'text',
        position: { x: 150, y: 25 },
        width: 40,
        height: 8,
        fontSize: 10,
        fontColor: '#000000',
        alignment: 'left',
      },
      {
        name: 'title',
        type: 'text',
        position: { x: 20, y: 45 },
        width: 170,
        height: 12,
        fontSize: 18,
        fontColor: '#000000',
        alignment: 'center',
      },
      {
        name: 'party_1_name',
        type: 'text',
        position: { x: 20, y: 70 },
        width: 170,
        height: 8,
        fontSize: 11,
        fontColor: '#000000',
        alignment: 'left',
      },
      {
        name: 'party_2_name',
        type: 'text',
        position: { x: 20, y: 85 },
        width: 170,
        height: 8,
        fontSize: 11,
        fontColor: '#000000',
        alignment: 'left',
      },
      {
        name: 'terms',
        type: 'text',
        position: { x: 20, y: 105 },
        width: 170,
        height: 100,
        fontSize: 10,
        fontColor: '#000000',
        alignment: 'left',
      },
      {
        name: 'signature_1',
        type: 'image',
        position: { x: 20, y: 220 },
        width: 60,
        height: 20,
      },
      {
        name: 'signature_2',
        type: 'image',
        position: { x: 130, y: 220 },
        width: 60,
        height: 20,
      },
    ]],
  },
  invoice: {
    name: 'Счёт',
    icon: 'Receipt',
    schemas: [[
      {
        name: 'invoice_number',
        type: 'text',
        position: { x: 20, y: 15 },
        width: 170,
        height: 10,
        fontSize: 14,
        fontColor: '#000000',
        alignment: 'left',
      },
      {
        name: 'invoice_date',
        type: 'text',
        position: { x: 20, y: 30 },
        width: 80,
        height: 8,
        fontSize: 10,
        fontColor: '#666666',
        alignment: 'left',
      },
      {
        name: 'seller_info',
        type: 'text',
        position: { x: 20, y: 50 },
        width: 85,
        height: 40,
        fontSize: 9,
        fontColor: '#000000',
        alignment: 'left',
      },
      {
        name: 'buyer_info',
        type: 'text',
        position: { x: 110, y: 50 },
        width: 85,
        height: 40,
        fontSize: 9,
        fontColor: '#000000',
        alignment: 'left',
      },
      {
        name: 'items_table',
        type: 'text',
        position: { x: 20, y: 100 },
        width: 170,
        height: 80,
        fontSize: 9,
        fontColor: '#000000',
        alignment: 'left',
      },
      {
        name: 'total_amount',
        type: 'text',
        position: { x: 130, y: 190 },
        width: 60,
        height: 12,
        fontSize: 14,
        fontColor: '#000000',
        alignment: 'right',
      },
      {
        name: 'qr_code',
        type: 'qrcode',
        position: { x: 165, y: 210 },
        width: 25,
        height: 25,
      },
    ]],
  },
  act: {
    name: 'Акт выполненных работ',
    icon: 'ClipboardCheck',
    schemas: [[
      {
        name: 'act_number',
        type: 'text',
        position: { x: 150, y: 15 },
        width: 40,
        height: 8,
        fontSize: 10,
        fontColor: '#000000',
        alignment: 'left',
      },
      {
        name: 'act_date',
        type: 'text',
        position: { x: 150, y: 25 },
        width: 40,
        height: 8,
        fontSize: 10,
        fontColor: '#000000',
        alignment: 'left',
      },
      {
        name: 'title',
        type: 'text',
        position: { x: 20, y: 45 },
        width: 170,
        height: 12,
        fontSize: 16,
        fontColor: '#000000',
        alignment: 'center',
      },
      {
        name: 'contractor',
        type: 'text',
        position: { x: 20, y: 70 },
        width: 170,
        height: 8,
        fontSize: 10,
        fontColor: '#000000',
        alignment: 'left',
      },
      {
        name: 'customer',
        type: 'text',
        position: { x: 20, y: 85 },
        width: 170,
        height: 8,
        fontSize: 10,
        fontColor: '#000000',
        alignment: 'left',
      },
      {
        name: 'work_description',
        type: 'text',
        position: { x: 20, y: 105 },
        width: 170,
        height: 90,
        fontSize: 10,
        fontColor: '#000000',
        alignment: 'left',
      },
      {
        name: 'contractor_signature',
        type: 'image',
        position: { x: 20, y: 210 },
        width: 60,
        height: 20,
      },
      {
        name: 'customer_signature',
        type: 'image',
        position: { x: 130, y: 210 },
        width: 60,
        height: 20,
      },
    ]],
  },
  certificate: {
    name: 'Сертификат',
    icon: 'Award',
    schemas: [[
      {
        name: 'certificate_title',
        type: 'text',
        position: { x: 20, y: 60 },
        width: 170,
        height: 15,
        fontSize: 24,
        fontColor: '#1e40af',
        alignment: 'center',
      },
      {
        name: 'recipient_name',
        type: 'text',
        position: { x: 20, y: 90 },
        width: 170,
        height: 20,
        fontSize: 20,
        fontColor: '#000000',
        alignment: 'center',
      },
      {
        name: 'description',
        type: 'text',
        position: { x: 30, y: 120 },
        width: 150,
        height: 60,
        fontSize: 12,
        fontColor: '#333333',
        alignment: 'center',
      },
      {
        name: 'date',
        type: 'text',
        position: { x: 20, y: 190 },
        width: 80,
        height: 10,
        fontSize: 10,
        fontColor: '#666666',
        alignment: 'left',
      },
      {
        name: 'signature',
        type: 'image',
        position: { x: 130, y: 185 },
        width: 60,
        height: 20,
      },
    ]],
  },
};

export function PdfTemplateDesigner({ template, onSave }: PdfTemplateDesignerProps) {
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

  return (
    <div className="space-y-6">
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-start gap-3">
          <Icon name="Sparkles" size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="space-y-2 text-sm text-blue-900 flex-1">
            <p className="font-semibold">PDF редактор документов</p>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li>Используйте готовые шаблоны или создайте свой</li>
              <li>Перетаскивайте элементы и изменяйте их размер</li>
              <li>Настраивайте свойства элементов в боковой панели</li>
            </ul>
          </div>
          <Dialog open={showPresets} onOpenChange={setShowPresets}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex-shrink-0">
                <Icon name="Layout" size={16} className="mr-2" />
                Шаблоны
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Выберите готовый шаблон</DialogTitle>
                <DialogDescription>
                  Загрузите шаблон и настройте его под ваши задачи
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                {Object.entries(PRESET_TEMPLATES).map(([key, preset]) => (
                  <button
                    key={key}
                    onClick={() => loadPreset(key as keyof typeof PRESET_TEMPLATES)}
                    className="p-6 border-2 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group text-left"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center">
                        <Icon name={preset.icon as any} size={20} className="text-blue-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{preset.name}</div>
                        <div className="text-xs text-gray-500">
                          {preset.schemas[0].length} полей
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </Card>

      <Card className="p-6">
        <div className="space-y-4">
          <Label className="text-base font-semibold">Добавить поле</Label>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <Label className="text-xs text-gray-600">Тип поля</Label>
              <Select value={fieldType} onValueChange={setFieldType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">
                    <div className="flex items-center gap-2">
                      <Icon name="Type" size={14} />
                      Текст
                    </div>
                  </SelectItem>
                  <SelectItem value="image">
                    <div className="flex items-center gap-2">
                      <Icon name="Image" size={14} />
                      Изображение
                    </div>
                  </SelectItem>
                  <SelectItem value="qrcode">
                    <div className="flex items-center gap-2">
                      <Icon name="QrCode" size={14} />
                      QR-код
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label className="text-xs text-gray-600">Имя поля</Label>
              <Input
                value={fieldName}
                onChange={(e) => setFieldName(e.target.value)}
                placeholder="Например: company_name"
                onKeyDown={(e) => e.key === 'Enter' && addField()}
              />
            </div>

            <div className="flex items-end">
              <Button 
                onClick={addField} 
                className="w-full"
                disabled={!fieldName.trim()}
              >
                <Icon name="Plus" size={16} className="mr-2" />
                Добавить
              </Button>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={addPage} variant="outline" size="sm">
              <Icon name="FilePlus" size={16} className="mr-2" />
              Добавить страницу
            </Button>
            <Button onClick={removePage} variant="outline" size="sm">
              <Icon name="FileX" size={16} className="mr-2" />
              Удалить страницу
            </Button>
          </div>
        </div>
      </Card>

      <div 
        ref={designerRef} 
        className="border-2 border-gray-200 rounded-xl overflow-hidden shadow-lg bg-white"
        style={{ 
          minHeight: '800px',
          height: 'calc(100vh - 400px)',
        }}
      />

      {!isReady && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-gray-600 font-medium">Загрузка редактора...</p>
          </div>
        </div>
      )}
    </div>
  );
}
