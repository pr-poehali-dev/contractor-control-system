import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Template, TemplateField } from '@/types/template';

export default function TemplateEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<Template | null>(null);
  const [customFields, setCustomFields] = useState<TemplateField[]>([]);
  const [showFieldDialog, setShowFieldDialog] = useState(false);
  const [newField, setNewField] = useState<Partial<TemplateField>>({
    type: 'text',
    required: false,
  });

  useEffect(() => {
    const storedTemplates = localStorage.getItem('templates');
    if (storedTemplates) {
      const templates: Template[] = JSON.parse(storedTemplates);
      const found = templates.find((t) => t.id === id);
      if (found) {
        setTemplate(found);
        setCustomFields(found.fields);
      }
    }
  }, [id]);

  const handleSave = () => {
    if (!template) return;

    const storedTemplates = localStorage.getItem('templates');
    if (storedTemplates) {
      const templates: Template[] = JSON.parse(storedTemplates);
      const index = templates.findIndex((t) => t.id === id);
      if (index !== -1) {
        templates[index] = {
          ...template,
          fields: customFields,
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem('templates', JSON.stringify(templates));
        navigate('/document-templates');
      }
    }
  };

  const handleAddField = () => {
    if (!newField.name || !newField.label) return;

    const field: TemplateField = {
      id: `field-${Date.now()}`,
      name: newField.name,
      label: newField.label,
      type: newField.type as TemplateField['type'],
      placeholder: newField.placeholder,
      required: newField.required || false,
      options: newField.options,
    };

    setCustomFields([...customFields, field]);
    setShowFieldDialog(false);
    setNewField({ type: 'text', required: false });
  };

  const handleRemoveField = (fieldId: string) => {
    setCustomFields(customFields.filter((f) => f.id !== fieldId));
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
            <Button variant="ghost" size="sm" onClick={() => navigate('/document-templates')}>
              <Icon name="ArrowLeft" size={18} className="mr-2" />
              Назад
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{template.name}</h1>
              {template.isSystem && (
                <Badge variant="secondary" className="mt-1">Системный шаблон</Badge>
              )}
            </div>
          </div>
          <Button onClick={handleSave}>
            <Icon name="Save" size={18} className="mr-2" />
            Сохранить
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div>
            <Tabs defaultValue="fields" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="fields">Мои поля</TabsTrigger>
                <TabsTrigger value="system">Системные поля</TabsTrigger>
              </TabsList>

              <TabsContent value="fields" className="mt-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">Мои поля</h3>
                      <Button size="sm" onClick={() => setShowFieldDialog(true)}>
                        <Icon name="Plus" size={16} className="mr-2" />
                        Добавить поле
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {customFields.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                          <Icon name="Inbox" size={48} className="mx-auto mb-3 text-slate-300" />
                          <p>Поля не добавлены</p>
                          <p className="text-sm">Создайте поля для заполнения шаблона</p>
                        </div>
                      ) : (
                        customFields.map((field) => (
                          <div
                            key={field.id}
                            className="border rounded-lg p-4 bg-white hover:bg-slate-50"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium">{field.label}</span>
                                  {field.required && (
                                    <Badge variant="destructive" className="text-xs">*</Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                  <code className="bg-slate-100 px-2 py-0.5 rounded text-xs">
                                    {`{{${field.name}}}`}
                                  </code>
                                  <span>•</span>
                                  <span>{field.type}</span>
                                </div>
                                {field.placeholder && (
                                  <p className="text-xs text-slate-400 mt-1">
                                    Пример: {field.placeholder}
                                  </p>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveField(field.id)}
                              >
                                <Icon name="Trash2" size={16} className="text-red-600" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="system" className="mt-4">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Системные поля</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 p-2 bg-slate-50 rounded">
                        <code className="bg-white px-2 py-1 rounded text-xs">{'{'}{'{'}}date{'}'}{'}'}</code>
                        <span className="text-slate-600">- Текущая дата</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-slate-50 rounded">
                        <code className="bg-white px-2 py-1 rounded text-xs">{'{'}{'{'}}objectName{'}'}{'}'}</code>
                        <span className="text-slate-600">- Название объекта</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-slate-50 rounded">
                        <code className="bg-white px-2 py-1 rounded text-xs">{'{'}{'{'}}workName{'}'}{'}'}</code>
                        <span className="text-slate-600">- Название работы</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {showFieldDialog && (
              <Card className="mt-4 border-2 border-blue-500">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Добавить новое поле</h3>
                  <div className="space-y-4">
                    <div>
                      <Label>Название переменной</Label>
                      <Input
                        placeholder="например: customerName"
                        value={newField.name || ''}
                        onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Отображаемое название</Label>
                      <Input
                        placeholder="например: ФИО заказчика"
                        value={newField.label || ''}
                        onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Тип поля</Label>
                      <Select
                        value={newField.type}
                        onValueChange={(value) => setNewField({ ...newField, type: value as TemplateField['type'] })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Текст</SelectItem>
                          <SelectItem value="number">Число</SelectItem>
                          <SelectItem value="date">Дата</SelectItem>
                          <SelectItem value="multiline">Многострочный текст</SelectItem>
                          <SelectItem value="select">Выбор из списка</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Подсказка (placeholder)</Label>
                      <Input
                        placeholder="Введите подсказку"
                        value={newField.placeholder || ''}
                        onChange={(e) => setNewField({ ...newField, placeholder: e.target.value })}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="required"
                        checked={newField.required}
                        onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
                        className="rounded"
                      />
                      <Label htmlFor="required" className="cursor-pointer">Обязательное поле</Label>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleAddField} className="flex-1">
                        Добавить
                      </Button>
                      <Button variant="outline" onClick={() => setShowFieldDialog(false)}>
                        Отмена
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Содержимое шаблона</h3>
                  <Button size="sm" variant="ghost">
                    <Icon name="Eye" size={16} className="mr-2" />
                    Предпросмотр
                  </Button>
                </div>
                <Textarea
                  value={template.content}
                  onChange={(e) => setTemplate({ ...template, content: e.target.value })}
                  className="font-mono text-sm min-h-[600px]"
                  placeholder="Введите содержимое шаблона. Используйте {{fieldName}} для вставки полей"
                />
                <p className="text-xs text-slate-500 mt-2">
                  Используйте переменные в формате {'{'}{'{'}}название{'}'}{'}'} для подстановки значений
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
