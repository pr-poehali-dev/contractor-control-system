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
              className="hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
              onClick={() => {
                sessionStorage.setItem('inspectionFromPage', '/defects');
                navigate(`/inspection/${inspection.id}`);
              }}
            >
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-4 md:px-6 py-3 border-b">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="bg-white rounded-lg px-3 py-1.5 shadow-sm border border-slate-300">
                      <span className="text-sm font-semibold text-slate-900">Проверка №{inspection.inspection_number}</span>
                    </div>
                    {inspection.type && (
                      <Badge className="bg-amber-100 text-amber-900 border-amber-200 text-xs">
                        <Icon name={inspection.type === 'scheduled' ? 'Calendar' : 'Zap'} size={12} className="mr-1" />
                        {inspection.type === 'scheduled' ? 'Плановая' : 'Внеплановая'}
                      </Badge>
                    )}
                  </div>
                </div>
                
                {inspection.object && (
                  <div className="flex items-center gap-1.5 text-sm text-slate-600 mt-2">
                    <Icon name="MapPin" size={14} />
                    <span>{inspection.object.title}</span>
                  </div>
                )}
              </div>
              
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <Badge className={getStatusColor(inspection.status)}>
                    {getStatusLabel(inspection.status)}
                  </Badge>
                  
                  {inspection.defectsCount > 0 && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-100 rounded-full border border-red-200">
                      <Icon name="AlertCircle" size={14} className="text-red-600" />
                      <span className="text-xs font-semibold text-red-600">{inspection.defectsCount}</span>
                    </div>
                  )}
                </div>

                {inspection.work && (
                  <div className="flex gap-2 items-start text-sm text-slate-600">
                    <Icon name="Wrench" size={16} className="mt-0.5 flex-shrink-0" />
                    <span><strong>Работа:</strong> {inspection.work.title}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Defects;