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
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchTemplateDetail,
  updateTemplate,
  selectCurrentTemplate,
  selectTemplatesLoading,
} from '@/store/slices/documentTemplatesSlice';
import { PdfTemplateDesigner } from '@/components/document-templates/PdfTemplateDesigner';
import { Template } from '@pdfme/common';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function DocumentTemplateEditorNew() {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  
  const template = useAppSelector(selectCurrentTemplate);
  const loading = useAppSelector(selectTemplatesLoading);
  
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [pdfTemplate, setPdfTemplate] = useState<Template | null>(null);
  const [editorMode, setEditorMode] = useState<'visual' | 'json'>('visual');

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
        if (typeof template.content === 'object' && 'schemas' in template.content) {
          setPdfTemplate(template.content as Template);
        } else {
          setPdfTemplate({
            basePdf: '',
            schemas: [[]],
          });
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
          content: pdfTemplate || { basePdf: '', schemas: [[]] },
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

  const handlePdfTemplateSave = (newTemplate: Template) => {
    setPdfTemplate(newTemplate);
    console.log('PDF template updated:', newTemplate);
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

        <div className="space-y-6">
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
              <CardTitle>Дизайн PDF шаблона</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={editorMode} onValueChange={(v) => setEditorMode(v as 'visual' | 'json')}>
                <TabsList className="mb-4">
                  <TabsTrigger value="visual">
                    <Icon name="Layout" size={16} className="mr-2" />
                    Визуальный редактор
                  </TabsTrigger>
                  <TabsTrigger value="json">
                    <Icon name="Code" size={16} className="mr-2" />
                    JSON
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="visual">
                  <PdfTemplateDesigner 
                    template={pdfTemplate} 
                    onSave={handlePdfTemplateSave}
                  />
                </TabsContent>

                <TabsContent value="json">
                  <Textarea
                    value={JSON.stringify(pdfTemplate, null, 2)}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        setPdfTemplate(parsed);
                      } catch (error) {
                        console.error('Invalid JSON');
                      }
                    }}
                    className="font-mono text-sm h-[600px]"
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
