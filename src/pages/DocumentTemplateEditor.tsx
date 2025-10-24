import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface DocumentTemplate {
  id: number;
  name: string;
  description: string;
  content: string;
  variables: string[];
  createdAt: string;
  updatedAt: string;
}

const mockTemplates: DocumentTemplate[] = [
  {
    id: 1,
    name: 'Акт выполненных работ',
    description: 'Стандартный шаблон акта для подтверждения выполненных работ',
    content: 'Акт выполненных работ №{{number}} от {{date}}\n\nИсполнитель: {{contractor}}\nЗаказчик: {{client}}\n\nВыполнены следующие работы:\n{{works_list}}\n\nОбщая стоимость: {{total_amount}} руб.',
    variables: ['number', 'date', 'contractor', 'client', 'works_list', 'total_amount'],
    createdAt: '2025-10-15T10:00:00',
    updatedAt: '2025-10-20T14:30:00',
  },
  {
    id: 2,
    name: 'Договор подряда',
    description: 'Типовой договор на выполнение строительно-монтажных работ',
    content: 'Договор подряда №{{contract_number}}\n\nЗаказчик: {{client_name}}, ИНН {{client_inn}}\nПодрядчик: {{contractor_name}}, ИНН {{contractor_inn}}\n\nПредмет договора: {{subject}}\nСрок выполнения: {{deadline}}\nСтоимость работ: {{amount}} руб.',
    variables: ['contract_number', 'client_name', 'client_inn', 'contractor_name', 'contractor_inn', 'subject', 'deadline', 'amount'],
    createdAt: '2025-09-20T09:15:00',
    updatedAt: '2025-10-10T16:45:00',
  },
];

export default function DocumentTemplateEditor() {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [template, setTemplate] = useState<DocumentTemplate | null>(null);
  const [isAddVariableDialogOpen, setIsAddVariableDialogOpen] = useState(false);
  const [newVariableName, setNewVariableName] = useState('');
  const [cursorPosition, setCursorPosition] = useState<number>(0);

  useEffect(() => {
    const found = mockTemplates.find((t) => t.id === Number(templateId));
    if (found) {
      setTemplate(found);
    }
  }, [templateId]);

  const extractVariables = (text: string): string[] => {
    const regex = /\{\{([^}]+)\}\}/g;
    const matches = text.matchAll(regex);
    const vars = new Set<string>();
    for (const match of matches) {
      vars.add(match[1].trim());
    }
    return Array.from(vars);
  };

  const handleContentChange = (newContent: string) => {
    if (!template) return;
    const variables = extractVariables(newContent);
    setTemplate({ ...template, content: newContent, variables });
  };

  const handleAddVariable = () => {
    if (!newVariableName.trim() || !template) return;

    const variableName = newVariableName.trim();
    const textArea = document.getElementById('template-content') as HTMLTextAreaElement;
    const currentContent = template.content;
    const before = currentContent.substring(0, cursorPosition);
    const after = currentContent.substring(cursorPosition);
    const newContent = `${before}{{${variableName}}}${after}`;

    handleContentChange(newContent);
    setIsAddVariableDialogOpen(false);
    setNewVariableName('');

    toast({
      title: 'Переменная добавлена',
      description: `Переменная {{${variableName}}} вставлена в текст`,
    });

    setTimeout(() => {
      textArea?.focus();
      const newPosition = cursorPosition + variableName.length + 4;
      textArea?.setSelectionRange(newPosition, newPosition);
    }, 100);
  };

  const handleInsertVariable = (variable: string) => {
    if (!template) return;
    const textArea = document.getElementById('template-content') as HTMLTextAreaElement;
    const currentContent = template.content;
    const position = textArea?.selectionStart || currentContent.length;
    const before = currentContent.substring(0, position);
    const after = currentContent.substring(position);
    const newContent = `${before}{{${variable}}}${after}`;

    handleContentChange(newContent);
    
    setTimeout(() => {
      textArea?.focus();
      const newPosition = position + variable.length + 4;
      textArea?.setSelectionRange(newPosition, newPosition);
    }, 100);
  };

  const handleSave = () => {
    if (!template) return;

    toast({
      title: 'Шаблон сохранён',
      description: 'Изменения успешно сохранены',
    });
  };

  if (!template) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Icon name="FileQuestion" size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-600">Шаблон не найден</p>
          <Button onClick={() => navigate('/document-templates')} className="mt-4">
            Вернуться к списку
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 w-full overflow-x-hidden">
      <div className="px-3 py-4 md:p-8 lg:p-12 max-w-7xl mx-auto w-full">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/document-templates')}>
              <Icon name="ArrowLeft" size={16} />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Редактор шаблона</h1>
            </div>
            <Button onClick={handleSave}>
              <Icon name="Save" size={16} className="mr-2" />
              Сохранить
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label htmlFor="template-name">Название шаблона</Label>
                  <Input
                    id="template-name"
                    value={template.name}
                    onChange={(e) => setTemplate({ ...template, name: e.target.value })}
                    placeholder="Название шаблона"
                  />
                </div>
                <div>
                  <Label htmlFor="template-description">Описание</Label>
                  <Textarea
                    id="template-description"
                    value={template.description}
                    onChange={(e) => setTemplate({ ...template, description: e.target.value })}
                    placeholder="Краткое описание"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Label htmlFor="template-content">Содержимое шаблона</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const textArea = document.getElementById('template-content') as HTMLTextAreaElement;
                      setCursorPosition(textArea?.selectionStart || template.content.length);
                      setIsAddVariableDialogOpen(true);
                    }}
                  >
                    <Icon name="Plus" size={14} className="mr-1.5" />
                    Добавить переменную
                  </Button>
                </div>
                <Textarea
                  id="template-content"
                  value={template.content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  onClick={(e) => setCursorPosition((e.target as HTMLTextAreaElement).selectionStart)}
                  onKeyUp={(e) => setCursorPosition((e.target as HTMLTextAreaElement).selectionStart)}
                  placeholder="Введите текст шаблона. Используйте {{имя_переменной}} для вставки переменных"
                  rows={15}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-slate-500 mt-2">
                  Используйте синтаксис <code className="bg-slate-100 px-1 py-0.5 rounded">{'{{имя_переменной}}'}</code> для вставки переменных
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Переменные ({template.variables.length})</h3>
                </div>
                {template.variables.length === 0 ? (
                  <div className="text-center py-8">
                    <Icon name="Variable" size={32} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-sm text-slate-500">Переменные пока не добавлены</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Введите {'{{имя}}'} в тексте
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {template.variables.map((variable) => (
                      <div
                        key={variable}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors group"
                      >
                        <Badge variant="secondary" className="font-mono text-xs">
                          {`{{${variable}}}`}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleInsertVariable(variable)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-7 text-xs"
                        >
                          <Icon name="Plus" size={12} className="mr-1" />
                          Вставить
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">Справка</h3>
                <div className="space-y-3 text-sm text-slate-600">
                  <div>
                    <p className="font-medium text-slate-700 mb-1">Как добавить переменную?</p>
                    <p className="text-xs">Напишите в тексте <code className="bg-slate-100 px-1 rounded">{'{{имя}}'}</code> или нажмите кнопку "Добавить переменную"</p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-700 mb-1">Примеры переменных</p>
                    <ul className="text-xs space-y-1 list-disc list-inside">
                      <li><code className="bg-slate-100 px-1 rounded">{'{{date}}'}</code> — дата</li>
                      <li><code className="bg-slate-100 px-1 rounded">{'{{number}}'}</code> — номер документа</li>
                      <li><code className="bg-slate-100 px-1 rounded">{'{{client}}'}</code> — заказчик</li>
                      <li><code className="bg-slate-100 px-1 rounded">{'{{amount}}'}</code> — сумма</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={isAddVariableDialogOpen} onOpenChange={setIsAddVariableDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить переменную</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="variable-name">Имя переменной</Label>
              <Input
                id="variable-name"
                placeholder="Например: date, number, client"
                value={newVariableName}
                onChange={(e) => setNewVariableName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddVariable()}
              />
              <p className="text-xs text-slate-500 mt-1">
                Используйте латинские буквы, цифры и подчёркивание
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddVariableDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleAddVariable} disabled={!newVariableName.trim()}>
              Добавить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
