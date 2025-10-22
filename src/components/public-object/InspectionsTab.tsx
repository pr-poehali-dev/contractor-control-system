import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';

interface InspectionsTabProps {
  objectId: number;
}

const InspectionsTab = ({ objectId }: InspectionsTabProps) => {
  const { userData } = useAuth();

  const works = (userData?.works && Array.isArray(userData.works)) 
    ? userData.works.filter(w => w.object_id === objectId) 
    : [];
  const inspections = (userData?.inspections && Array.isArray(userData.inspections)) ? userData.inspections : [];

  // Получаем проверки по работам этого объекта
  const objectInspections = inspections.filter(insp => {
    const work = works.find(w => w.id === insp.work_id);
    return work !== undefined;
  }).map(insp => {
    const work = works.find(w => w.id === insp.work_id);
    
    let defectsCount = 0;
    try {
      const defects = insp.defects ? JSON.parse(insp.defects) : [];
      defectsCount = Array.isArray(defects) ? defects.length : 0;
    } catch (e) {
      defectsCount = 0;
    }

    return { ...insp, work, defectsCount };
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
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900">Проверки</h2>
      {objectInspections.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Icon name="ClipboardCheck" size={48} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600">Нет проверок по этому объекту</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {objectInspections.map((inspection) => (
            <Card key={inspection.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div className="flex-1 w-full">
                    <h3 className="font-bold text-lg text-slate-900 mb-3">
                      Проверка №{inspection.inspection_number}
                    </h3>
                    
                    {inspection.work && (
                      <div className="mb-3">
                        <span className="text-slate-600 text-sm"><span className="font-semibold text-slate-900">Работа:</span> {inspection.work.title}</span>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={getStatusColor(inspection.status)}>
                        {getStatusLabel(inspection.status)}
                      </Badge>
                      {inspection.type && (
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Icon name={inspection.type === 'scheduled' ? 'Calendar' : 'Zap'} size={13} />
                          {inspection.type === 'scheduled' ? 'Плановая' : 'Внеплановая'}
                        </span>
                      )}
                    </div>
                    
                    {inspection.description && (
                      <p className="text-slate-600 mt-3 text-sm leading-relaxed">{inspection.description}</p>
                    )}
                  </div>
                  
                  {inspection.defectsCount > 0 && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg border border-red-200 self-start">
                      <Icon name="AlertCircle" size={18} className="text-red-600" />
                      <span className="font-bold text-red-600 text-lg">{inspection.defectsCount}</span>
                    </div>
                  )}
                </div>

                {inspection.scheduled_date && (
                  <div className="flex gap-2 text-xs text-slate-500 mt-4 pt-4 border-t border-slate-100">
                    <Icon name="Calendar" size={14} />
                    <span><span className="font-medium">Запланирована:</span> {formatDate(inspection.scheduled_date)}</span>
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

export default InspectionsTab;