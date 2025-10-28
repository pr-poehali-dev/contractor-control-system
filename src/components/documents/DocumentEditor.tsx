import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DocumentEditorProps {
  htmlContent: string;
  variables: string[];
  contentData: Record<string, any>;
  onSave: (data: Record<string, any>) => void;
  onDownload?: () => void;
}

export default function DocumentEditor({
  htmlContent,
  variables,
  contentData,
  onSave,
  onDownload,
}: DocumentEditorProps) {
  const [formData, setFormData] = useState<Record<string, any>>(contentData || {});

  useEffect(() => {
    setFormData(contentData || {});
  }, [contentData]);

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  const renderPreview = () => {
    let preview = htmlContent || '';
    
    Object.entries(formData).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      preview = preview.replace(regex, value || `[${key}]`);
    });

    variables.forEach(variable => {
      if (!formData[variable]) {
        const regex = new RegExp(`\\{\\{${variable}\\}\\}`, 'g');
        preview = preview.replace(regex, `<span class="bg-yellow-100 px-1 rounded">[${variable}]</span>`);
      }
    });

    return preview;
  };

  const getFieldType = (fieldName: string): 'text' | 'textarea' | 'date' => {
    const lowerName = fieldName.toLowerCase();
    if (lowerName.includes('date') || lowerName.includes('дата')) return 'date';
    if (lowerName.includes('description') || lowerName.includes('defects') || lowerName.includes('дефект')) return 'textarea';
    return 'text';
  };

  const getFieldLabel = (fieldName: string): string => {
    const labels: Record<string, string> = {
      date: 'Дата',
      object_name: 'Название объекта',
      object_address: 'Адрес объекта',
      work_name: 'Название работ',
      work_volume: 'Объем работ',
      work_cost: 'Стоимость работ',
      client_representative: 'Представитель заказчика',
      contractor_representative: 'Представитель подрядчика',
      defects_description: 'Описание дефектов',
      detection_date: 'Дата обнаружения',
      deadline_date: 'Срок устранения',
      start_date: 'Дата начала',
      end_date: 'Дата окончания',
      quality_assessment: 'Оценка качества',
    };
    return labels[fieldName] || fieldName.replace(/_/g, ' ');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      <Card className="flex flex-col">
        <CardHeader className="border-b bg-slate-50">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icon name="FileEdit" size={20} />
              Заполнение полей
            </CardTitle>
            <Button onClick={handleSave} size="sm">
              <Icon name="Save" size={16} className="mr-2" />
              Сохранить
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full">
            <div className="p-6 space-y-4">
              {variables.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Icon name="FileQuestion" size={48} className="mx-auto mb-4 text-slate-300" />
                  <p>В документе нет переменных для заполнения</p>
                </div>
              ) : (
                variables.map((variable) => {
                  const fieldType = getFieldType(variable);
                  const label = getFieldLabel(variable);

                  return (
                    <div key={variable}>
                      <Label htmlFor={variable} className="text-sm font-medium mb-2 block">
                        {label}
                      </Label>
                      {fieldType === 'textarea' ? (
                        <Textarea
                          id={variable}
                          value={formData[variable] || ''}
                          onChange={(e) => handleFieldChange(variable, e.target.value)}
                          placeholder={`Введите ${label.toLowerCase()}`}
                          rows={4}
                        />
                      ) : fieldType === 'date' ? (
                        <Input
                          id={variable}
                          type="date"
                          value={formData[variable] || ''}
                          onChange={(e) => handleFieldChange(variable, e.target.value)}
                        />
                      ) : (
                        <Input
                          id={variable}
                          type="text"
                          value={formData[variable] || ''}
                          onChange={(e) => handleFieldChange(variable, e.target.value)}
                          placeholder={`Введите ${label.toLowerCase()}`}
                        />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="flex flex-col">
        <CardHeader className="border-b bg-slate-50">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icon name="Eye" size={20} />
              Предпросмотр документа
            </CardTitle>
            {onDownload && (
              <Button onClick={onDownload} variant="outline" size="sm">
                <Icon name="Download" size={16} className="mr-2" />
                Скачать PDF
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full">
            <div className="p-8">
              <div className="bg-white rounded-lg prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: renderPreview() }} />
              </div>
              
              {variables.some(v => !formData[v]) && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
                  <Icon name="AlertTriangle" size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-900">Не все поля заполнены</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Поля, выделенные желтым цветом, требуют заполнения
                    </p>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
