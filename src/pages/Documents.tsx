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
import { fetchTemplates, selectTemplates, selectTemplatesLoading } from '@/store/slices/documentTemplatesSlice';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import CreateDocumentModal from '@/components/documents/CreateDocumentModal';

const Documents = () => {
  const { isAuthenticated } = useAuthRedux();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const documents = useAppSelector(selectDocuments);
  const loading = useAppSelector(selectDocumentsLoading);
  const templates = useAppSelector(selectTemplates);
  const templatesLoading = useAppSelector(selectTemplatesLoading);
  
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchDocuments());
      dispatch(fetchTemplates());
    }
  }, [dispatch, isAuthenticated]);

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; variant: 'default' | 'destructive' | 'secondary' | 'outline'; color: string }> = {
      draft: { label: 'Черновик', variant: 'outline', color: 'text-slate-600' },
      pending: { label: 'На подписи', variant: 'default', color: 'text-blue-600' },
      signed: { label: 'Подписан', variant: 'secondary', color: 'text-green-600' },
      archived: { label: 'В архиве', variant: 'secondary', color: 'text-slate-500' }
    };
    return configs[status] || configs.draft;
  };

  const filteredDocuments = documents.filter(doc => {
    if (statusFilter !== 'all' && doc.status !== statusFilter) return false;
    return true;
  });

  const handleCreateDocument = () => {
    setIsCreateModalOpen(true);
  };

  const handleSelectTemplate = (templateId: number, templateName: string) => {
    navigate(`/document/new?templateId=${templateId}`);
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
        </div>

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
                    {documents.filter(d => d.status === 'pending').length}
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

        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">Документы</h2>
            <p className="text-sm text-slate-600">Список созданных документов</p>
          </div>
          <Button 
            onClick={handleCreateDocument}
                  className="w-full md:w-auto"
                >
                  <Icon name="FilePlus" size={18} className="mr-2" />
                  Создать документ
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Label className="text-sm font-medium">Статус</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Все статусы" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="draft">Черновик</SelectItem>
                  <SelectItem value="pending">На подписи</SelectItem>
                  <SelectItem value="signed">Подписан</SelectItem>
                  <SelectItem value="archived">В архиве</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {filteredDocuments.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Icon name="FileText" size={64} className="mx-auto mb-4 text-slate-300" />
              <h3 className="text-xl font-semibold mb-2">Нет документов</h3>
              <p className="text-slate-500 mb-6">
                {statusFilter !== 'all'
                  ? 'Попробуйте изменить фильтры'
                  : 'Создайте первый документ для начала работы'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredDocuments.map((doc) => {
              const statusConfig = getStatusConfig(doc.status);
              
              return (
                <Card
                  key={doc.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/document/${doc.id}`)}
                >
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-blue-50 rounded-lg flex-shrink-0">
                        <Icon name="FileText" size={24} className="text-blue-600" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <h3 className="font-semibold text-lg mb-1">{doc.title}</h3>
                            <p className="text-sm text-slate-500">
                              Шаблон: {doc.templateName || 'Не указан'}
                            </p>
                          </div>
                          <Badge variant={statusConfig.variant}>
                            {statusConfig.label}
                          </Badge>
                        </div>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-slate-600 mt-3">
                          <div className="flex items-center gap-1.5">
                            <Icon name="Calendar" size={16} />
                            <span>
                              Создан: {doc.createdAt ? format(new Date(doc.createdAt), 'd MMMM yyyy', { locale: ru }) : 'Не указано'}
                            </span>
                          </div>
                          {doc.updatedAt && doc.updatedAt !== doc.createdAt && (
                            <div className="flex items-center gap-1.5">
                              <Icon name="Clock" size={16} />
                              <span>
                                Обновлён: {format(new Date(doc.updatedAt), 'd MMMM yyyy', { locale: ru })}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <Icon name="ChevronRight" size={20} className="text-slate-400 flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <CreateDocumentModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          templates={templates.filter(t => !t.is_system)}
          loading={templatesLoading}
          onSelectTemplate={handleSelectTemplate}
        />
      </div>
    </div>
  );
};

export default Documents;