import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { safeDateCompare, isValidDate } from '@/utils/dateValidation';

const Activity = () => {
  const { userData, user } = useAuth();
  const [typeFilter, setTypeFilter] = useState<'all' | 'work' | 'check' | 'defect'>('all');
  const [objectFilter, setObjectFilter] = useState<number | null>(null);
  const [workFilter, setWorkFilter] = useState<number | null>(null);

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  const workLogs = (userData?.workLogs && Array.isArray(userData.workLogs)) ? userData.workLogs : [];
  const inspections = (userData?.inspections && Array.isArray(userData.inspections)) ? userData.inspections : [];
  const remarks = (userData?.remarks && Array.isArray(userData.remarks)) ? userData.remarks : [];
  const works = (userData?.works && Array.isArray(userData.works)) ? userData.works : [];
  const objects = (userData?.objects && Array.isArray(userData.objects)) ? userData.objects : [];
  const contractors = (userData?.contractors && Array.isArray(userData.contractors)) ? userData.contractors : [];

  console.log('🔍 Activity Debug:', {
    workLogsCount: workLogs.length,
    inspectionsCount: inspections.length,
    remarksCount: remarks.length,
    workLogs: workLogs.slice(0, 2),
    inspections: inspections.slice(0, 2),
    userData
  });

  const getWorkById = (workId: number) => works.find(w => w.id === workId);
  const getObjectByWorkId = (workId: number) => {
    const work = getWorkById(workId);
    return work ? objects.find(o => o.id === work.object_id) : null;
  };

  const allActivity = [
    ...workLogs.map(log => {
      const work = getWorkById(log.work_id);
      return {
        id: `log-${log.id}`,
        type: 'work' as const,
        title: 'Запись в журнале работ',
        description: log.description,
        timestamp: log.created_at,
        user: log.author_name,
        workId: log.work_id,
        contractorId: work?.contractor_id,
        objectId: work?.object_id,
      };
    }),
    ...inspections.map(insp => {
      const work = getWorkById(insp.work_id);
      return {
        id: `insp-${insp.id}`,
        type: 'check' as const,
        title: `Проверка №${insp.inspection_number}`,
        description: insp.notes || insp.description || 'Проверка выполнена',
        timestamp: insp.created_at,
        user: insp.author_name || 'Инспектор',
        workId: insp.work_id,
        contractorId: work?.contractor_id,
        objectId: work?.object_id,
      };
    }),
    ...remarks.map(rem => {
      const inspection = inspections.find(i => i.id === rem.inspection_id);
      const work = inspection ? getWorkById(inspection.work_id) : null;
      return {
        id: `rem-${rem.id}`,
        type: 'defect' as const,
        title: 'Замечание',
        description: rem.description,
        timestamp: rem.created_at,
        user: 'Инспектор',
        inspectionId: rem.inspection_id,
        workId: inspection?.work_id,
        contractorId: work?.contractor_id,
        objectId: work?.object_id,
      };
    }),
  ].sort((a, b) => safeDateCompare(a.timestamp, b.timestamp));

  const filteredActivity = allActivity.filter(item => {
    if (typeFilter !== 'all' && item.type !== typeFilter) return false;
    if (objectFilter && item.objectId !== objectFilter) return false;
    if (workFilter && item.workId !== workFilter) return false;
    return true;
  });

  const formatTimestamp = (timestamp: string) => {
    if (!isValidDate(timestamp)) return 'Неизвестная дата';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'только что';
    if (diffHours < 24) return `${diffHours} ч назад`;
    if (diffDays === 1) return 'вчера';
    if (diffDays < 7) return `${diffDays} д назад`;
    
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'check': return 'ClipboardCheck';
      case 'defect': return 'AlertCircle';
      case 'work': return 'Wrench';
      default: return 'Activity';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'check': return 'text-green-600 bg-green-100';
      case 'defect': return 'text-red-600 bg-red-100';
      case 'work': return 'text-blue-600 bg-blue-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  const getWorkTitle = (workId?: number) => {
    if (!workId) return null;
    return getWorkById(workId)?.title;
  };

  const getObjectTitle = (objectId?: number) => {
    if (!objectId) return null;
    return objects.find(o => o.id === objectId)?.title;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="sticky top-0 bg-white border-b z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-slate-900">Лента событий</h1>
          <p className="text-sm text-slate-500 mt-1">Последние события по всем проектам</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-6 space-y-3">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button
              variant={typeFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter('all')}
            >
              <Icon name="Activity" size={16} className="mr-1" />
              Все
            </Button>
            <Button
              variant={typeFilter === 'work' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter('work')}
            >
              <Icon name="Wrench" size={16} className="mr-1" />
              Журнал работ
            </Button>
            <Button
              variant={typeFilter === 'check' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter('check')}
            >
              <Icon name="ClipboardCheck" size={16} className="mr-1" />
              Проверки
            </Button>
            <Button
              variant={typeFilter === 'defect' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter('defect')}
            >
              <Icon name="AlertCircle" size={16} className="mr-1" />
              Замечания
            </Button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            <select
              className="text-sm border rounded-md px-3 py-1.5 bg-white"
              value={objectFilter || ''}
              onChange={(e) => setObjectFilter(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">Все объекты</option>
              {objects.map(obj => (
                <option key={obj.id} value={obj.id}>{obj.title}</option>
              ))}
            </select>

            <select
              className="text-sm border rounded-md px-3 py-1.5 bg-white"
              value={workFilter || ''}
              onChange={(e) => setWorkFilter(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">Все работы</option>
              {works.map(work => (
                <option key={work.id} value={work.id}>{work.title}</option>
              ))}
            </select>
          </div>
        </div>

        {filteredActivity.length === 0 ? (
        <Card className="p-12 text-center">
          <Icon name="Activity" size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500">Нет активности</p>
        </Card>
        ) : (
          <div className="space-y-4">
            {filteredActivity.map((item, index) => (
              <Card 
                key={item.id}
                className="animate-fade-in hover:shadow-md transition-shadow"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getIconColor(item.type)}`}>
                      <Icon name={getIcon(item.type) as any} size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 mb-1">{item.title}</h3>
                          <p className="text-sm text-slate-600 mb-2">{item.description}</p>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Icon name="User" size={12} />
                              {item.user}
                            </span>
                            <span className="flex items-center gap-1">
                              <Icon name="Clock" size={12} />
                              {formatTimestamp(item.timestamp)}
                            </span>
                            {item.objectId && (
                              <span className="flex items-center gap-1">
                                <Icon name="Building" size={12} />
                                {getObjectTitle(item.objectId)}
                              </span>
                            )}
                            {item.workId && (
                              <span className="flex items-center gap-1">
                                <Icon name="Briefcase" size={12} />
                                {getWorkTitle(item.workId)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Activity;