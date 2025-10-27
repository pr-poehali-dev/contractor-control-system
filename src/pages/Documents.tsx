import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthRedux } from '@/hooks/useAuthRedux';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchDocuments, selectDocuments, selectDocumentsLoading } from '@/store/slices/documentsSlice';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const Documents = () => {
  const { isAuthenticated } = useAuthRedux();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const documents = useAppSelector(selectDocuments);
  const loading = useAppSelector(selectDocumentsLoading);
  
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchDocuments());
    }
  }, [dispatch, isAuthenticated]);

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; variant: 'default' | 'destructive' | 'secondary' | 'outline'; color: string }> = {
      draft: { label: 'Черновик', variant: 'outline', color: 'text-slate-600' },
      pending_signature: { label: 'На подписи', variant: 'default', color: 'text-blue-600' },
      signed: { label: 'Подписан', variant: 'secondary', color: 'text-green-600' },
      rejected: { label: 'Отклонён', variant: 'destructive', color: 'text-red-600' }
    };
    return configs[status] || configs.draft;
  };

  const getDocumentTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      act: 'Акт выполненных работ',
      inspection: 'Акт проверки',
      defect_report: 'Акт о дефектах',
      completion: 'Акт приёмки',
      protocol: 'Протокол',
      contract: 'Договор'
    };
    return types[type] || type;
  };

  const filteredDocuments = documents.filter(doc => {
    if (statusFilter !== 'all' && doc.status !== statusFilter) return false;
    if (typeFilter !== 'all' && doc.document_type !== typeFilter) return false;
    return true;
  });

  const handleCreateDocument = () => {
    setCreateDialogOpen(true);
  };

  if (loading && documents.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto bg-slate-50 w-full">
        <div className="px-3 py-4 md:p-8 lg:p-12 max-w-7xl mx-auto">
          <Skeleton className="h-10 w-64 mb-6" />
          <div className="flex gap-2 mb-6">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 w-full">
      <div className="px-3 py-4 md:p-8 lg:p-12 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">Документооборот</h1>
            <p className="text-slate-600">
              Юридически значимые документы по проектам
            </p>
          </div>
          
          <Button onClick={handleCreateDocument}>
            <Icon name="FilePlus" size={18} className="mr-2" />
            Создать документ
          </Button>
        </div>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Создать документ</DialogTitle>
              <DialogDescription>
                Выберите действие для создания документа
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4">
              <Button 
                variant="outline" 
                className="w-full justify-start h-auto p-4"
                onClick={() => {
                  setCreateDialogOpen(false);
                  navigate('/document-templates');
                }}
              >
                <div className="flex items-start gap-3 text-left">
                  <Icon name="FileText" size={24} className="text-blue-600 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">Создать из шаблона</div>
                    <div className="text-sm text-slate-500">Выберите готовый шаблон документа</div>
                  </div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start h-auto p-4"
                onClick={() => {
                  setCreateDialogOpen(false);
                  navigate('/document/new');
                }}
              >
                <div className="flex items-start gap-3 text-left">
                  <Icon name="FilePlus" size={24} className="text-green-600 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">Создать пустой документ</div>
                    <div className="text-sm text-slate-500">Начните с чистого листа</div>
                  </div>
                </div>
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Всего документов</p>
                  <p className="text-2xl font-bold">{documents.length}</p>
                </div>
                <Icon name="FileText" size={24} className="text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">На подписи</p>
                  <p className="text-2xl font-bold">
                    {documents.filter(d => d.status === 'pending_signature').length}
                  </p>
                </div>
                <Icon name="Clock" size={24} className="text-amber-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Подписано</p>
                  <p className="text-2xl font-bold">
                    {documents.filter(d => d.status === 'signed').length}
                  </p>
                </div>
                <Icon name="CheckCircle" size={24} className="text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Черновики</p>
                  <p className="text-2xl font-bold">
                    {documents.filter(d => d.status === 'draft').length}
                  </p>
                </div>
                <Icon name="FileEdit" size={24} className="text-slate-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label className="text-sm font-medium mb-2">Статус</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Все статусы" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все статусы</SelectItem>
                    <SelectItem value="draft">Черновик</SelectItem>
                    <SelectItem value="pending_signature">На подписи</SelectItem>
                    <SelectItem value="signed">Подписан</SelectItem>
                    <SelectItem value="rejected">Отклонён</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <Label className="text-sm font-medium mb-2">Тип документа</Label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Все типы" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все типы</SelectItem>
                    <SelectItem value="act">Акт работ</SelectItem>
                    <SelectItem value="inspection">Акт проверки</SelectItem>
                    <SelectItem value="defect_report">Акт о дефектах</SelectItem>
                    <SelectItem value="completion">Акт приёмки</SelectItem>
                    <SelectItem value="protocol">Протокол</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {filteredDocuments.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Icon name="FileText" size={64} className="mx-auto mb-4 text-slate-300" />
              <h3 className="text-xl font-semibold mb-2">Нет документов</h3>
              <p className="text-slate-500 mb-6">
                {statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Попробуйте изменить фильтры'
                  : 'Создайте первый документ для начала работы'}
              </p>
              {statusFilter === 'all' && typeFilter === 'all' && (
                <Button onClick={handleCreateDocument}>
                  <Icon name="FilePlus" size={18} className="mr-2" />
                  Создать документ
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredDocuments.map((doc) => {
              const statusConfig = getStatusConfig(doc.status);
              
              return (
                <Card
                  key={doc.id}
                  className="hover:shadow-md transition-all cursor-pointer border-l-4"
                  style={{ borderLeftColor: statusConfig.color.replace('text-', '') }}
                  onClick={() => navigate(`/document/${doc.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon name="FileText" size={24} className="text-blue-600" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-slate-900 text-lg">
                                {doc.title}
                              </h3>
                              <Badge variant={statusConfig.variant}>
                                {statusConfig.label}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-600">
                              {getDocumentTypeLabel(doc.document_type)}
                              {doc.document_number && ` №${doc.document_number}`}
                            </p>
                          </div>

                          <div className="text-right flex-shrink-0">
                            <div className="text-sm font-medium text-slate-900">
                              {format(new Date(doc.created_at), 'd MMMM yyyy', { locale: ru })}
                            </div>
                            <div className="text-xs text-slate-500">
                              {format(new Date(doc.created_at), 'HH:mm')}
                            </div>
                          </div>
                        </div>

                        {doc.work_title && (
                          <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                            <Icon name="Briefcase" size={14} />
                            <span>{doc.object_title} → {doc.work_title}</span>
                          </div>
                        )}

                        {doc.signatures && doc.signatures.length > 0 && (
                          <div className="flex items-center gap-4 mt-3 pt-3 border-t">
                            <div className="flex items-center gap-2 text-sm">
                              <Icon name="Users" size={14} className="text-slate-400" />
                              <span className="text-slate-600">
                                Подписей: {doc.signed_count || 0} из {doc.signatures.length}
                              </span>
                            </div>
                            {doc.pending_signatures && doc.pending_signatures > 0 && (
                              <div className="flex items-center gap-1 text-sm text-amber-600">
                                <Icon name="Clock" size={14} />
                                <span>Ожидается: {doc.pending_signatures}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <Icon name="ChevronRight" size={20} className="text-slate-400 flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Documents;