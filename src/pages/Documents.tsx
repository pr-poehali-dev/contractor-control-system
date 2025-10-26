import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthRedux } from '@/hooks/useAuthRedux';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const Documents = () => {
  const { userData } = useAuthRedux();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'defect_reports' | 'acts' | 'protocols'>('all');

  const getDocumentTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      defect_report: 'Акт об обнаружении дефектов',
      act: 'Акт выполненных работ',
      protocol: 'Протокол осмотра'
    };
    return types[type] || type;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; variant: 'default' | 'destructive' | 'secondary' | 'outline' }> = {
      active: { label: 'Активный', variant: 'default' },
      resolved: { label: 'Устранено', variant: 'secondary' },
      closed: { label: 'Закрыт', variant: 'outline' }
    };
    
    const config = variants[status] || { label: status, variant: 'outline' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const mockDocuments = [
    {
      id: 1021,
      type: 'defect_report',
      report_number: 'NPDR-25-51-20251021',
      document_date: '2025-10-21T06:02:00',
      status: 'active',
      object_id: 1,
      work_id: 1,
      total_defects: 2,
      critical_defects: 0,
      description: 'Дом Пушкина → Монтаж вентиляционной системы'
    },
    {
      id: 1020,
      type: 'defect_report',
      report_number: 'NPDR-25-51-20251020',
      document_date: '2025-10-20T14:58:00',
      status: 'active',
      object_id: 1,
      work_id: 1,
      total_defects: 2,
      critical_defects: 0,
      description: 'Дом Пушкина → Монтаж вентиляционной системы'
    },
    {
      id: 1016,
      type: 'defect_report',
      report_number: 'NPDR-25-51-20251016',
      document_date: '2025-10-16T14:44:00',
      status: 'active',
      object_id: 1,
      work_id: 1,
      total_defects: 2,
      critical_defects: 0,
      description: 'Дом Пушкина → Монтаж вентиляционной системы'
    },
  ];

  const allDocuments = [
    ...mockDocuments,
    ...(userData?.defect_reports || []).map((report: any) => ({
      ...report,
      type: 'defect_report',
      document_date: report.created_at
    })),
  ].sort((a, b) => new Date(b.document_date).getTime() - new Date(a.document_date).getTime());

  const filteredDocuments = filter === 'all' 
    ? allDocuments 
    : allDocuments.filter(doc => doc.type === filter.slice(0, -1));

  const getWorkTitle = (workId: number) => {
    return userData?.works?.find((w: any) => w.id === workId)?.title || 'Неизвестная работа';
  };

  const getObjectTitle = (objectId: number) => {
    return userData?.objects?.find((o: any) => o.id === objectId)?.title || 'Неизвестный объект';
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 w-full overflow-x-hidden">
      <div className="px-3 py-4 md:p-8 lg:p-12 max-w-7xl mx-auto w-full">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">Документы</h1>
          <p className="text-slate-600">
            Все сформированные документы по проектам
          </p>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            Все документы
          </Button>
          <Button
            variant={filter === 'defect_reports' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('defect_reports')}
          >
            Акты о дефектах
          </Button>
          <Button
            variant={filter === 'acts' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('acts')}
            disabled
          >
            Акты работ
          </Button>
          <Button
            variant={filter === 'protocols' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('protocols')}
            disabled
          >
            Протоколы
          </Button>
        </div>

        {filteredDocuments.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                <Icon name="FileText" size={32} className="text-slate-400" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Нет документов
            </h3>
            <p className="text-slate-500 mb-6">
              {filter === 'all' 
                ? 'Пока не создано ни одного документа'
                : 'Нет документов выбранного типа'}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredDocuments.map((doc: any) => (
              <Card
                key={`${doc.type}-${doc.id}`}
                className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  if (doc.type === 'defect_report') {
                    navigate(`/defect-report/${doc.id}`);
                  }
                }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon name="FileText" size={24} className="text-blue-600" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-900">
                            {getDocumentTypeLabel(doc.type)} №{doc.report_number || doc.document_number}
                          </h3>
                          {getStatusBadge(doc.status)}
                        </div>
                        <p className="text-sm text-slate-600">
                          {getObjectTitle(doc.object_id)} → {getWorkTitle(doc.work_id)}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-sm font-medium text-slate-900">
                          {format(new Date(doc.document_date), 'd MMMM yyyy', { locale: ru })}
                        </div>
                        <div className="text-xs text-slate-500">
                          {format(new Date(doc.document_date), 'HH:mm')}
                        </div>
                      </div>
                    </div>

                    {doc.type === 'defect_report' && (
                      <div className="flex gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <Icon name="AlertTriangle" size={16} className="text-orange-500" />
                          <span>Всего дефектов: {doc.total_defects || 0}</span>
                        </div>
                        {doc.critical_defects > 0 && (
                          <div className="flex items-center gap-1">
                            <Icon name="AlertCircle" size={16} className="text-red-500" />
                            <span>Критических: {doc.critical_defects}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <Button variant="ghost" size="sm">
                    <Icon name="ChevronRight" size={20} />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Documents;