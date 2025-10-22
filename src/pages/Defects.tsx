import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';

const Defects = () => {
  const navigate = useNavigate();
  const { userData } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const inspections = (userData?.inspections && Array.isArray(userData.inspections)) ? userData.inspections : [];
  const works = (userData?.works && Array.isArray(userData.works)) ? userData.works : [];
  const objects = (userData?.objects && Array.isArray(userData.objects)) ? userData.objects : [];

  const inspectionsWithContext = inspections.map(inspection => {
    const work = works.find(w => w.id === inspection.work_id);
    const object = objects.find(o => o.id === work?.object_id);
    
    let defectsCount = 0;
    try {
      const defects = inspection.defects ? JSON.parse(inspection.defects) : [];
      defectsCount = Array.isArray(defects) ? defects.length : 0;
    } catch (e) {
      defectsCount = 0;
    }

    return { ...inspection, work, object, defectsCount };
  });

  const filteredInspections = inspectionsWithContext.filter(i => {
    if (statusFilter === 'all') return true;
    return i.status === statusFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'active': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Запланирована';
      case 'active': return 'На проверке';
      case 'completed': return 'Завершена';
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
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Проверки</h1>
        <p className="text-slate-600">Все проверки качества работ</p>
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-4 items-stretch md:items-center md:justify-between">
        <div className="w-full md:w-64">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все проверки ({inspections.length})</SelectItem>
              <SelectItem value="draft">Запланированы ({inspections.filter(i => i.status === 'draft').length})</SelectItem>
              <SelectItem value="active">На проверке ({inspections.filter(i => i.status === 'active').length})</SelectItem>
              <SelectItem value="completed">Завершены ({inspections.filter(i => i.status === 'completed').length})</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-3 justify-around md:justify-end">
          <div className="text-center">
            <p className="text-2xl md:text-2xl font-bold text-blue-600">{inspections.filter(i => i.status === 'draft').length}</p>
            <p className="text-xs text-slate-500">Запланировано</p>
          </div>
          <div className="text-center">
            <p className="text-2xl md:text-2xl font-bold text-amber-600">{inspections.filter(i => i.status === 'active').length}</p>
            <p className="text-xs text-slate-500">На проверке</p>
          </div>
          <div className="text-center">
            <p className="text-2xl md:text-2xl font-bold text-green-600">{inspections.filter(i => i.status === 'completed').length}</p>
            <p className="text-xs text-slate-500">Завершено</p>
          </div>
        </div>
      </div>

      {filteredInspections.length === 0 ? (
        <Card className="p-12 text-center">
          <Icon name="ClipboardCheck" size={64} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500">Нет проверок</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredInspections.map((inspection) => (
            <Card 
              key={inspection.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => {
                sessionStorage.setItem('inspectionFromPage', '/defects');
                navigate(`/inspection/${inspection.id}`);
              }}
            >
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-3 mb-3">
                  <div className="flex-1 w-full">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      {inspection.object && (
                        <div className="bg-slate-100 text-slate-700 px-3 py-1 rounded-md text-sm font-medium flex items-center gap-1.5">
                          <Icon name="MapPin" size={14} />
                          {inspection.object.title}
                        </div>
                      )}
                    </div>
                    
                    <h3 className="font-semibold text-base md:text-lg mb-2">
                      Проверка №{inspection.inspection_number}
                    </h3>
                    
                    {inspection.work && (
                      <div className="mb-3">
                        <span className="text-base text-slate-700"><strong>Работа:</strong> {inspection.work.title}</span>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge className={getStatusColor(inspection.status)}>
                        {getStatusLabel(inspection.status)}
                      </Badge>
                      {inspection.type && (
                        <span className="text-sm text-slate-600">
                          {inspection.type === 'scheduled' ? '📅 Плановая' : '⚡ Внеплановая'}
                        </span>
                      )}
                    </div>
                    
                    {inspection.description && (
                      <p className="text-slate-700 mt-2 text-sm">{inspection.description}</p>
                    )}
                  </div>
                  
                  {inspection.defectsCount > 0 && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-red-100 rounded-lg self-start">
                      <Icon name="AlertCircle" size={18} className="text-red-600" />
                      <span className="font-semibold text-red-600">{inspection.defectsCount}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-sm text-slate-600 mt-4">
                  {inspection.scheduled_date && (
                    <div className="flex gap-2">
                      <Icon name="Calendar" size={16} />
                      <span><strong>Запланирована:</strong> {formatDate(inspection.scheduled_date)}</span>
                    </div>
                  )}
                  <div className="flex gap-2 text-slate-500 text-xs pt-2 border-t">
                    <Icon name="Calendar" size={14} />
                    <span>Создана: {formatDate(inspection.created_at)}</span>
                    {inspection.completed_at && <span> • Завершена: {formatDate(inspection.completed_at)}</span>}
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