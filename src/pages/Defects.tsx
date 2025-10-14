import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';

const Defects = () => {
  const { userData } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const remarks = (userData?.remarks && Array.isArray(userData.remarks)) ? userData.remarks : [];
  const inspections = (userData?.inspections && Array.isArray(userData.inspections)) ? userData.inspections : [];
  const works = (userData?.works && Array.isArray(userData.works)) ? userData.works : [];
  const objects = (userData?.objects && Array.isArray(userData.objects)) ? userData.objects : [];

  const remarksWithContext = remarks.map(remark => {
    const inspection = inspections.find(i => i.id === remark.inspection_id);
    const work = works.find(w => w.id === inspection?.work_id);
    const object = objects.find(o => o.id === work?.object_id);

    return { ...remark, inspection, work, object };
  });

  const filteredRemarks = remarksWithContext.filter(r => {
    if (statusFilter === 'all') return true;
    return r.status === statusFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-700';
      case 'resolved': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-slate-100 text-slate-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Открыто';
      case 'resolved': return 'Устранено';
      case 'rejected': return 'Отклонено';
      default: return status;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ru-RU', { 
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Замечания</h1>
        <p className="text-slate-600">Все замечания по проверкам качества работ</p>
      </div>

      <div className="mb-6 flex gap-4 items-center justify-between">
        <div className="w-64">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все ({remarks.length})</SelectItem>
              <SelectItem value="open">Открытые ({remarks.filter(r => r.status === 'open').length})</SelectItem>
              <SelectItem value="resolved">Устраненные ({remarks.filter(r => r.status === 'resolved').length})</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-3">
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{remarks.filter(r => r.status === 'open').length}</p>
            <p className="text-xs text-slate-500">Открыто</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{remarks.filter(r => r.status === 'resolved').length}</p>
            <p className="text-xs text-slate-500">Устранено</p>
          </div>
        </div>
      </div>

      {filteredRemarks.length === 0 ? (
        <Card className="p-12 text-center">
          <Icon name="CheckCircle2" size={64} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500">Нет замечаний</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRemarks.map((remark) => (
            <Card key={remark.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <Badge className={getStatusColor(remark.status)}>
                      {getStatusLabel(remark.status)}
                    </Badge>
                    <h3 className="font-semibold text-lg mt-2">Замечание #{remark.id}</h3>
                    <p className="text-slate-700 mt-2">{remark.description}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-slate-600 mt-4">
                  {remark.normative_ref && (
                    <div className="flex gap-2">
                      <Icon name="FileText" size={16} />
                      <span><strong>Норматив:</strong> {remark.normative_ref}</span>
                    </div>
                  )}
                  {remark.work && (
                    <div className="flex gap-2">
                      <Icon name="Wrench" size={16} />
                      <span><strong>Работа:</strong> {remark.work.title}</span>
                    </div>
                  )}
                  {remark.object && (
                    <div className="flex gap-2">
                      <Icon name="MapPin" size={16} />
                      <span>{remark.object.title}</span>
                    </div>
                  )}
                  <div className="flex gap-2 text-slate-500 text-xs pt-2 border-t">
                    <Icon name="Calendar" size={14} />
                    <span>Создано: {formatDate(remark.created_at)}</span>
                    {remark.resolved_at && <span> • Устранено: {formatDate(remark.resolved_at)}</span>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Defects;