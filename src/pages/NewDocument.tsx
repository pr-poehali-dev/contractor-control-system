import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchTemplateDetail, selectCurrentTemplate, selectTemplatesLoading } from '@/store/slices/documentTemplatesSlice';
import { Skeleton } from '@/components/ui/skeleton';

export default function NewDocument() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const templateId = searchParams.get('templateId');
  const template = useAppSelector(selectCurrentTemplate);
  const loading = useAppSelector(selectTemplatesLoading);

  useEffect(() => {
    if (templateId) {
      dispatch(fetchTemplateDetail(parseInt(templateId)));
    }
  }, [templateId, dispatch]);

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
        </div>

        <Card>
          <CardContent className="p-8 text-center">
            <Icon name="Construction" size={64} className="mx-auto mb-4 text-slate-300" />
            <h3 className="text-xl font-semibold mb-2">
              Редактор документов находится в разработке
            </h3>
            <p className="text-slate-600 mb-6">
              Скоро здесь появится полнофункциональный редактор для создания документов из шаблонов
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate('/documents')}>
                Вернуться к документам
              </Button>
              <Button onClick={() => navigate('/document-templates')}>
                Посмотреть шаблоны
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
