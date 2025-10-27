import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchTemplateDetail, selectCurrentTemplate, selectTemplatesLoading } from '@/store/slices/documentTemplatesSlice';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import DocumentPreview from '@/components/DocumentPreview';

export default function NewDocument() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  
  const templateId = searchParams.get('templateId');
  const template = useAppSelector(selectCurrentTemplate);
  const loading = useAppSelector(selectTemplatesLoading);

  const [documentData, setDocumentData] = useState<Record<string, string>>({});
  const [documentTitle, setDocumentTitle] = useState('');

  useEffect(() => {
    if (templateId) {
      dispatch(fetchTemplateDetail(parseInt(templateId)));
    }
  }, [templateId, dispatch]);

  useEffect(() => {
    if (template) {
      const variables = template.content?.variables || [];
      const initialData: Record<string, string> = {};
      variables.forEach((v: string) => {
        initialData[v] = '';
      });
      setDocumentData(initialData);
      setDocumentTitle(`${template.name} - ${new Date().toLocaleDateString('ru-RU')}`);
    }
  }, [template]);

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto bg-slate-50 w-full">
        <div className="px-3 py-4 md:p-8 lg:p-12 max-w-7xl mx-auto">
          <Skeleton className="h-10 w-64 mb-6" />
          <div className="grid lg:grid-cols-2 gap-6">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Icon name="AlertCircle" size={48} className="text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 mb-4">Шаблон не найден</p>
          <Button onClick={() => navigate('/documents')}>
            <Icon name="ArrowLeft" size={18} className="mr-2" />
            Назад к документам
          </Button>
        </div>
      </div>
    );
  }

  const handleSaveDocument = async () => {
    if (!documentTitle.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите название документа',
        variant: 'destructive',
      });
      return;
    }

    const emptyFields = Object.entries(documentData).filter(([_, value]) => !value.trim());
    if (emptyFields.length > 0) {
      toast({
        title: 'Предупреждение',
        description: `Не заполнены поля: ${emptyFields.map(([key]) => key).join(', ')}`,
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Сохранение...',
      description: 'Функция сохранения в разработке',
    });
  };

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
            <Button onClick={handleSaveDocument}>
              <Icon name="Save" size={18} className="mr-2" />
              Сохранить
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Icon name="FileText" size={20} />
                  Информация о документе
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="doc-title">Название документа</Label>
                    <Input
                      id="doc-title"
                      value={documentTitle}
                      onChange={(e) => setDocumentTitle(e.target.value)}
                      placeholder="Введите название документа"
                      className="mt-1.5"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Icon name="Edit" size={20} />
                  Заполнение полей
                </h3>
                
                <div className="space-y-4">
                  {template.content?.variables?.map((variable: string) => (
                    <div key={variable}>
                      <Label htmlFor={`field-${variable}`} className="text-sm">
                        {variable}
                      </Label>
                      <Input
                        id={`field-${variable}`}
                        value={documentData[variable] || ''}
                        onChange={(e) => setDocumentData({
                          ...documentData,
                          [variable]: e.target.value
                        })}
                        placeholder={`Введите ${variable}`}
                        className="mt-1.5"
                      />
                    </div>
                  ))}
                  
                  {(!template.content?.variables || template.content.variables.length === 0) && (
                    <p className="text-sm text-slate-500 text-center py-4">
                      В этом шаблоне нет переменных для заполнения
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:sticky lg:top-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Icon name="Eye" size={20} />
                  Предпросмотр
                </h3>
                <DocumentPreview
                  html={template.content?.html || ''}
                  variables={documentData}
                  templateName={documentTitle}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}