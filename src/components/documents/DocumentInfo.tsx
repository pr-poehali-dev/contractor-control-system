import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Document } from '@/store/slices/documentsSlice';

interface DocumentInfoProps {
  document: Document;
}

export default function DocumentInfo({ document }: DocumentInfoProps) {
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
        
        <div>
          <p className="text-slate-500 mb-0.5">Создан</p>
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
