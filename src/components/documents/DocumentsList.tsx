import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchDocuments,
  selectDocuments,
  selectDocumentsLoading,
  setCurrentDocument,
} from '@/store/slices/documentsSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DocumentsListProps {
  workId?: number;
  onSelectDocument?: (documentId: number) => void;
}

export default function DocumentsList({ workId, onSelectDocument }: DocumentsListProps) {
  const dispatch = useAppDispatch();
  const documents = useAppSelector(selectDocuments);
  const loading = useAppSelector(selectDocumentsLoading);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const params = workId ? { work_id: workId } : undefined;
    dispatch(fetchDocuments(params));
  }, [dispatch, workId]);

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.document_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      draft: { label: 'Черновик', className: 'bg-slate-100 text-slate-700' },
      pending_signature: { label: 'На подписи', className: 'bg-amber-100 text-amber-700' },
      signed: { label: 'Подписан', className: 'bg-green-100 text-green-700' },
      rejected: { label: 'Отклонён', className: 'bg-red-100 text-red-700' },
    };

    const variant = variants[status] || variants.draft;

    return (
      <Badge className={cn('font-medium', variant.className)}>
        {variant.label}
      </Badge>
    );
  };

  const getDocumentTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      inspection_act: 'ClipboardCheck',
      remediation_act: 'Wrench',
      acceptance_act: 'CheckCircle',
      defect_report: 'AlertTriangle',
    };

    return icons[type] || 'FileText';
  };

  const handleDocumentClick = (docId: number) => {
    dispatch(setCurrentDocument(documents.find(d => d.id === docId) || null));
    onSelectDocument?.(docId);
  };

  if (loading && documents.length === 0) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Документы</span>
            <Button size="sm">
              <Icon name="Plus" size={16} className="mr-2" />
              Создать документ
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Поиск документов..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="draft">Черновики</SelectItem>
                <SelectItem value="pending_signature">На подписи</SelectItem>
                <SelectItem value="signed">Подписанные</SelectItem>
                <SelectItem value="rejected">Отклонённые</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Icon name="FileText" size={48} className="mx-auto mb-2 opacity-20" />
                <p>Документы не найдены</p>
              </div>
            ) : (
              filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => handleDocumentClick(doc.id)}
                  className="p-4 border rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Icon
                        name={getDocumentTypeIcon(doc.document_type)}
                        size={20}
                        className="text-blue-500"
                      />
                      <div>
                        <h4 className="font-semibold">{doc.title}</h4>
                        <p className="text-sm text-slate-500">{doc.document_number}</p>
                      </div>
                    </div>
                    {getStatusBadge(doc.status)}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    {doc.work_title && (
                      <span className="flex items-center gap-1">
                        <Icon name="Briefcase" size={14} />
                        {doc.work_title}
                      </span>
                    )}

                    <span className="flex items-center gap-1">
                      <Icon name="Calendar" size={14} />
                      {format(new Date(doc.created_at), 'dd MMM yyyy', { locale: ru })}
                    </span>

                    {doc.pending_signatures ? (
                      <span className="flex items-center gap-1 text-amber-600">
                        <Icon name="Clock" size={14} />
                        {doc.pending_signatures} ожидают подписи
                      </span>
                    ) : null}

                    {doc.signed_count ? (
                      <span className="flex items-center gap-1 text-green-600">
                        <Icon name="Check" size={14} />
                        {doc.signed_count} подписей
                      </span>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
