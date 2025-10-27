import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import TiptapEditor from '@/components/TiptapEditor';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchTemplateDetail,
  updateTemplate,
  selectCurrentTemplate,
  selectTemplatesLoading,
} from '@/store/slices/documentTemplatesSlice';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function DocumentTemplateEditor() {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  
  const template = useAppSelector(selectCurrentTemplate);
  const loading = useAppSelector(selectTemplatesLoading);
  
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [documentContent, setDocumentContent] = useState('');
  const [documentVariables, setDocumentVariables] = useState<string[]>([]);
  const [fieldType, setFieldType] = useState<'text' | 'number' | 'date' | 'email'>('text');
  const [fieldName, setFieldName] = useState('');

  useEffect(() => {
    if (templateId) {
      dispatch(fetchTemplateDetail(parseInt(templateId)));
    }
  }, [dispatch, templateId]);

  useEffect(() => {
    if (template) {
      setTemplateName(template.name);
      setTemplateDescription(template.description || '');
      
      if (template.content) {
        if (template.content.html) {
          setDocumentContent(template.content.html);
        }
        if (template.content.variables) {
          setDocumentVariables(template.content.variables);
        }
      }
    }
  }, [template]);

  const handleSave = async () => {
    if (!templateId || !template) return;

    try {
      await dispatch(
        updateTemplate({
          id: parseInt(templateId),
          name: templateName,
          description: templateDescription,
          content: { 
            html: documentContent, 
            variables: documentVariables 
          },
        })
      ).unwrap();

      toast({
        title: 'Шаблон сохранён',
        description: 'Изменения успешно сохранены',
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить шаблон',
        variant: 'destructive',
      });
    }
  };

  const handleAddField = () => {
    if (!fieldName.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите название поля',
        variant: 'destructive',
      });
      return;
    }

    if (documentVariables.includes(fieldName)) {
      toast({
        title: 'Ошибка',
        description: 'Поле с таким названием уже существует',
        variant: 'destructive',
      });
      return;
    }

    setDocumentVariables([...documentVariables, fieldName]);
    setFieldName('');
  };

  const handleDeleteField = (variable: string) => {
    setDocumentVariables(documentVariables.filter(v => v !== variable));
  };

  if (loading && !template) {
    return (
      <div className="flex-1 overflow-y-auto bg-slate-50 w-full">
        <div className="px-3 py-4 md:p-8 lg:p-12 max-w-7xl mx-auto">
          <Skeleton className="h-10 w-64 mb-6" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Icon name="FileQuestion" size={64} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Шаблон не найден</h3>
          <Button onClick={() => navigate('/document-templates')} className="mt-4">
            Вернуться к списку
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 w-full">
      <div className="px-3 py-4 md:p-8 lg:p-12 max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Button variant="ghost" size="sm" onClick={() => navigate('/document-templates')}>
              <Icon name="ArrowLeft" size={18} />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Редактор шаблона</h1>
            </div>
            <Button onClick={handleSave}>
              <Icon name="Save" size={18} className="mr-2" />
              Сохранить
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Основная информация</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="template-name">Название шаблона</Label>
                  <Input
                    id="template-name"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="Название шаблона"
                  />
                </div>
                <div>
                  <Label htmlFor="template-description">Описание</Label>
                  <Textarea
                    id="template-description"
                    value={templateDescription}
                    onChange={(e) => setTemplateDescription(e.target.value)}
                    placeholder="Краткое описание"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Редактор документа</CardTitle>
              </CardHeader>
              <CardContent>
                <TiptapEditor
                  content={documentContent}
                  onChange={setDocumentContent}
                  placeholder="Начните писать документ..."
                  variables={documentVariables}
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Добавить поле</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="field-type">Тип поля</Label>
                  <Select value={fieldType} onValueChange={(val: any) => setFieldType(val)}>
                    <SelectTrigger id="field-type" className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Текст</SelectItem>
                      <SelectItem value="number">Число</SelectItem>
                      <SelectItem value="date">Дата</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="field-name">Имя поля</Label>
                  <Input
                    id="field-name"
                    value={fieldName}
                    onChange={(e) => setFieldName(e.target.value)}
                    placeholder="Например: company_name"
                    className="mt-2"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddField();
                      }
                    }}
                  />
                </div>

                <Button 
                  onClick={handleAddField}
                  className="w-full"
                >
                  <Icon name="Plus" size={16} className="mr-2" />
                  Добавить
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Поля ({documentVariables.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {documentVariables.length === 0 ? (
                  <p className="text-sm text-slate-500">Добавьте поля для шаблона</p>
                ) : (
                  <div className="space-y-2">
                    {documentVariables.map((variable) => (
                      <div 
                        key={variable} 
                        className="flex items-center justify-between p-3 border rounded hover:bg-slate-50 transition-colors"
                      >
                        <code className="text-sm font-mono text-blue-600">{`{{${variable}}}`}</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteField(variable)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Icon name="Trash2" size={14} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Подсказки</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-600">
                <div>
                  <strong className="block mb-1">Форматирование</strong>
                  <p className="text-xs">Используйте панель инструментов для форматирования текста</p>
                </div>
                <div>
                  <strong className="block mb-1">Вставка полей</strong>
                  <p className="text-xs">Нажмите на поле в панели инструментов, чтобы вставить его в текст</p>
                </div>
                <div>
                  <strong className="block mb-1">Переменные</strong>
                  <p className="text-xs">
                    Формат: <code className="bg-slate-100 px-1 rounded">{'{{имя_поля}}'}</code>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
