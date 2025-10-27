import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { Document, Template } from '@/types/template';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function NewDocument() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const templateId = searchParams.get('templateId');
  
  const [template, setTemplate] = useState<Template | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});

  useEffect(() => {
    if (templateId) {
      const storedTemplates = localStorage.getItem('templates');
      if (storedTemplates) {
        const templates: Template[] = JSON.parse(storedTemplates);
        const foundTemplate = templates.find((t) => t.id === templateId);
        if (foundTemplate) {
          setTemplate(foundTemplate);
          
          const initialValues: Record<string, any> = {};
          foundTemplate.fields.forEach((field) => {
            initialValues[field.name] = field.defaultValue || '';
          });
          initialValues.date = format(new Date(), 'dd.MM.yyyy', { locale: ru });
          setFieldValues(initialValues);
        }
      }
    }
  }, [templateId]);

  const generateContent = () => {
    if (!template) return '';
    
    let content = template.content;
    
    Object.keys(fieldValues).forEach((key) => {
      const value = fieldValues[key];
      const regex = new RegExp(`{{${key}}}`, 'g');
      content = content.replace(regex, value || '');
    });
    
    return content;
  };

  const handleSave = () => {
    if (!template) return;

    const newDoc: Document = {
      id: `doc-${Date.now()}`,
      templateId: template.id,
      templateName: template.name,
      name: `${template.name} от ${format(new Date(), 'dd.MM.yyyy')}`,
      content: generateContent(),
      fieldValues: fieldValues,
      status: 'draft',
      createdBy: 'current-user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const storedDocuments = localStorage.getItem('documents');
    const documents: Document[] = storedDocuments ? JSON.parse(storedDocuments) : [];
    documents.push(newDoc);
    localStorage.setItem('documents', JSON.stringify(documents));
    
    navigate('/documents');
  };

  if (!template) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader2" size={48} className="animate-spin text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">Загрузка шаблона...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 w-full">
      <div className="px-3 py-4 md:p-8 lg:p-12 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/documents')}>
              <Icon name="ArrowLeft" size={18} className="mr-2" />
              Назад
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Создание документа</h1>
              <p className="text-slate-600 mt-1">Шаблон: {template.name}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/documents')}>
              Отмена
            </Button>
            <Button onClick={handleSave}>
              <Icon name="Save" size={18} className="mr-2" />
              Сохранить
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Icon name="FileEdit" size={20} className="text-blue-600" />
                  <h3 className="font-semibold">Заполнение полей</h3>
                </div>
                <p className="text-sm text-slate-500 mb-6">
                  Заполните все поля шаблона. Поля помеченные звездочкой (*) обязательны для заполнения.
                </p>
                <div className="space-y-4">
                  {template.fields.map((field) => (
                    <div key={field.id}>
                      <Label>
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      {field.type === 'multiline' ? (
                        <Textarea
                          value={fieldValues[field.name] || ''}
                          onChange={(e) =>
                            setFieldValues({ ...fieldValues, [field.name]: e.target.value })
                          }
                          placeholder={field.placeholder}
                          className="mt-1"
                          rows={4}
                        />
                      ) : field.type === 'date' ? (
                        <Input
                          type="date"
                          value={fieldValues[field.name] || ''}
                          onChange={(e) =>
                            setFieldValues({ ...fieldValues, [field.name]: e.target.value })
                          }
                          className="mt-1"
                        />
                      ) : field.type === 'number' ? (
                        <Input
                          type="number"
                          value={fieldValues[field.name] || ''}
                          onChange={(e) =>
                            setFieldValues({ ...fieldValues, [field.name]: e.target.value })
                          }
                          placeholder={field.placeholder}
                          className="mt-1"
                        />
                      ) : (
                        <Input
                          value={fieldValues[field.name] || ''}
                          onChange={(e) =>
                            setFieldValues({ ...fieldValues, [field.name]: e.target.value })
                          }
                          placeholder={field.placeholder}
                          className="mt-1"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Icon name="Eye" size={20} className="text-slate-600" />
                    <h3 className="font-semibold">Предпросмотр документа</h3>
                  </div>
                  <Button size="sm" variant="outline">
                    <Icon name="Download" size={16} className="mr-2" />
                    PDF
                  </Button>
                </div>
                <div 
                  className="prose prose-sm max-w-none bg-white p-8 rounded border min-h-[600px]"
                  dangerouslySetInnerHTML={{ __html: generateContent() }}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
