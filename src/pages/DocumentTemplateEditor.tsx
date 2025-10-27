import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import TiptapEditor from '@/components/TiptapEditor';
import DocumentPreview from '@/components/DocumentPreview';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function DocumentTemplateEditor() {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  
  const template = useAppSelector(selectCurrentTemplate);
  const loading = useAppSelector(selectTemplatesLoading);
  
  const [templateName, setTemplateName] = useState('');
  const [documentContent, setDocumentContent] = useState('');
  const [documentVariables, setDocumentVariables] = useState<string[]>([]);
  const [fieldType, setFieldType] = useState<'text' | 'number' | 'date' | 'email'>('text');
  const [fieldName, setFieldName] = useState('');
  const [previewData, setPreviewData] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');

  useEffect(() => {
    if (templateId) {
      dispatch(fetchTemplateDetail(parseInt(templateId)));
    }
  }, [dispatch, templateId]);

  useEffect(() => {
    if (template) {
      setTemplateName(template.name);
      
      if (template.content) {
        if (template.content.html) {
          setDocumentContent(template.content.html);
        }
        if (template.content.variables) {
          setDocumentVariables(template.content.variables);
          const initialData: Record<string, string> = {};
          template.content.variables.forEach((v: string) => {
            initialData[v] = '';
          });
          setPreviewData(initialData);
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
    setPreviewData({ ...previewData, [fieldName]: '' });
    setFieldName('');
  };

  const handleDeleteField = (variable: string) => {
    setDocumentVariables(documentVariables.filter(v => v !== variable));
    const newData = { ...previewData };
    delete newData[variable];
    setPreviewData(newData);
  };

  if (loading && !template) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Загрузка шаблона...</p>
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
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-white">
      <div className="border-b bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/document-templates')}>
            <Icon name="ArrowLeft" size={18} />
          </Button>
          <div>
            <Input
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="text-xl font-semibold border-0 px-0 focus-visible:ring-0 h-auto"
              placeholder="Название шаблона"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate('/document-templates')}>
            Отмена
          </Button>
          <Button onClick={handleSave}>
            <Icon name="Save" size={18} className="mr-2" />
            Сохранить
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col">
            <div className="border-b px-6">
              <TabsList className="h-12">
                <TabsTrigger value="editor" className="gap-2">
                  <Icon name="Edit" size={16} />
                  Редактор
                </TabsTrigger>
                <TabsTrigger value="preview" className="gap-2">
                  <Icon name="Eye" size={16} />
                  Предпросмотр
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="editor" className="flex-1 m-0 p-6 overflow-hidden">
              <TiptapEditor
                content={documentContent}
                onChange={setDocumentContent}
                variables={documentVariables}
                className="h-full"
              />
            </TabsContent>

            <TabsContent value="preview" className="flex-1 m-0 overflow-hidden">
              <DocumentPreview
                html={documentContent}
                variables={previewData}
                templateName={templateName}
              />
            </TabsContent>
          </Tabs>
        </div>

        <div className="w-80 border-l bg-slate-50 overflow-y-auto">
          <div className="p-6 space-y-6">
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Icon name="Plus" size={18} />
                Добавить поле
              </h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="field-type" className="text-xs">Тип поля</Label>
                  <Select value={fieldType} onValueChange={(val: any) => setFieldType(val)}>
                    <SelectTrigger id="field-type" className="mt-1.5">
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
                  <Label htmlFor="field-name" className="text-xs">Имя поля</Label>
                  <Input
                    id="field-name"
                    value={fieldName}
                    onChange={(e) => setFieldName(e.target.value)}
                    placeholder="company_name"
                    className="mt-1.5"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddField();
                      }
                    }}
                  />
                </div>

                <Button onClick={handleAddField} className="w-full" size="sm">
                  <Icon name="Plus" size={16} className="mr-2" />
                  Добавить
                </Button>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Icon name="List" size={18} />
                Поля ({documentVariables.length})
              </h3>
              {documentVariables.length === 0 ? (
                <p className="text-sm text-slate-500">Нет полей</p>
              ) : (
                <div className="space-y-2">
                  {documentVariables.map((variable) => (
                    <div key={variable} className="group">
                      <div className="flex items-center justify-between p-2 rounded-lg border bg-white hover:border-blue-200 transition-colors">
                        <code className="text-xs font-mono text-blue-600">{variable}</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteField(variable)}
                          className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Icon name="X" size={14} />
                        </Button>
                      </div>
                      {activeTab === 'preview' && (
                        <Input
                          value={previewData[variable] || ''}
                          onChange={(e) => setPreviewData({ ...previewData, [variable]: e.target.value })}
                          placeholder={`Значение для ${variable}`}
                          className="mt-1.5 text-sm"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}