import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { Document } from '@/store/slices/documentsSlice';
import { ROUTES } from '@/constants/routes';

interface DocumentInfoProps {
  document: Document;
}

export default function DocumentInfo({ document }: DocumentInfoProps) {
  const navigate = useNavigate();
  
  const totalDefects = document.contentData?.totalDefects || 0;
  const criticalDefects = document.contentData?.criticalDefects || 0;
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between mb-2">
          <CardTitle className="text-xl">{document.title}</CardTitle>
          {document.status === 'draft' && (
            <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-300">Черновик</Badge>
          )}
          {document.status === 'pending_signature' && (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">На подписи</Badge>
          )}
          {document.status === 'signed' && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Подписан</Badge>
          )}
        </div>
        {document.document_number && (
          <p className="text-sm text-slate-500">{document.document_number}</p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-3 text-sm">
        {document.inspection_id && document.inspection_number && (
          <div>
            <p className="text-slate-500 mb-1">Проверка</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(ROUTES.INSPECTION_DETAIL(document.inspection_id!))}
              className="-ml-3 h-auto p-2 hover:bg-slate-100"
            >
              <Icon name="ClipboardList" size={16} className="mr-2 text-blue-600" />
              <span className="font-medium text-slate-900">{document.inspection_number}</span>
            </Button>
          </div>
        )}
        
        {document.work_title && (
          <div>
            <p className="text-slate-500 mb-0.5">Работа</p>
            <p className="font-medium text-slate-900">{document.work_title}</p>
          </div>
        )}
        
        {document.object_title && (
          <div>
            <p className="text-slate-500 mb-0.5">Объект</p>
            <p className="font-medium text-slate-900">{document.object_title}</p>
          </div>
        )}
        
        {totalDefects > 0 && (
          <div>
            <p className="text-slate-500 mb-1">Замечания</p>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-red-50 rounded-lg border border-red-200">
                <Icon name="AlertCircle" size={16} className="text-red-600" />
                <span className="font-bold text-red-600 text-base">{totalDefects}</span>
              </div>
              {criticalDefects > 0 && (
                <span className="text-xs text-red-600">из них критических: {criticalDefects}</span>
              )}
            </div>
          </div>
        )}
        
        <div>
          <p className="text-slate-500 mb-0.5">Сформирован</p>
          <p className="font-medium text-slate-900">
            {document.createdAt ? format(new Date(document.createdAt), 'd MMMM yyyy, HH:mm', { locale: ru }) : 'Не указано'}
          </p>
        </div>
        
        <div>
          <p className="text-slate-500 mb-0.5">Автор</p>
          <p className="font-medium text-slate-900">{document.created_by_name || 'Не указан'}</p>
        </div>
      </CardContent>
    </Card>
  );
}