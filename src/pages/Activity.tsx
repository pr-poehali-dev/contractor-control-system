import { useState } from 'react';
import { useAuthRedux } from '@/hooks/useAuthRedux';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { safeDateCompare, isValidDate } from '@/utils/dateValidation';
import WorkLogModal from '@/components/work-journal/WorkLogModal';

const Activity = () => {
  const { userData, user } = useAuthRedux();
  const [typeFilter, setTypeFilter] = useState<'all' | 'work' | 'check' | 'info'>('all');
  const [objectFilter, setObjectFilter] = useState<number | null>(null);
  const [workFilter, setWorkFilter] = useState<number | null>(null);
  const [selectedWorkLog, setSelectedWorkLog] = useState<any>(null);
  const [isWorkReportModalOpen, setIsWorkReportModalOpen] = useState(false);

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
  const infoPosts = (userData?.infoPosts && Array.isArray(userData.infoPosts)) ? userData.infoPosts : [];
  const works = (userData?.works && Array.isArray(userData.works)) ? userData.works : [];
  const objects = (userData?.objects && Array.isArray(userData.objects)) ? userData.objects : [];
  const contractors = (userData?.contractors && Array.isArray(userData.contractors)) ? userData.contractors : [];

  console.log('🔍 Activity Debug:', {
    workLogsCount: workLogs.length,
    inspectionsCount: inspections.length,
    infoPostsCount: infoPosts.length,
    allActivityCount: workLogs.length + inspections.length + infoPosts.length,
    workLogs: workLogs.slice(0, 2),
    inspections: inspections.slice(0, 2),
    infoPosts: infoPosts.slice(0, 2)
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
        title: 'Отчёт о работе',
        description: log.description,
        timestamp: log.created_at,
        user: log.author_name,
        workId: log.work_id,
        contractorId: work?.contractor_id,
        objectId: work?.object_id,
        workLog: log,
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
        inspectionNumber: insp.inspection_number,
        workTitle: work?.title,
      };
    }),
    ...infoPosts.map(post => {
      const object = objects.find(o => o.id === post.object_id);
      return {
        id: `info-${post.id}`,
        type: 'info' as const,
        title: post.title || 'Информация',
        description: post.content,
        timestamp: post.created_at,
        user: post.author_name || 'Администратор',
        objectId: post.object_id,
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
      case 'work': return 'Wrench';
      case 'info': return 'Info';
      default: return 'Activity';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'check': return 'text-green-600 bg-green-100';
      case 'work': return 'text-blue-600 bg-blue-100';
      case 'info': return 'text-purple-600 bg-purple-100';
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
              variant={typeFilter === 'info' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTypeFilter('info')}
            >
              <Icon name="Info" size={16} className="mr-1" />
              Информация
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
                className="animate-fade-in hover:shadow-md transition-shadow overflow-hidden"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {item.type === 'check' && (
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-3 border-b flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-white rounded-lg px-3 py-1.5 shadow-sm border border-amber-200">
                        <span className="text-sm font-semibold text-amber-900">{item.title}</span>
                      </div>
                      {item.objectId && (
                        <div className="flex items-center gap-1.5 text-sm text-slate-700">
                          <Icon name="MapPin" size={14} />
                          <span className="font-medium">{getObjectTitle(item.objectId)}</span>
                        </div>
                      )}
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 rounded-full text-xs font-medium text-amber-900 border border-amber-200">
                      <Icon name="Zap" size={12} />
                      <span>Внеплановая</span>
                    </div>
                  </div>
                )}
                
                <CardContent 
                  className={`p-6 ${item.type === 'work' ? 'cursor-pointer hover:bg-slate-50 transition-colors' : ''}`}
                  onClick={() => {
                    if (item.type === 'work' && (item as any).workLog) {
                      setSelectedWorkLog((item as any).workLog);
                      setIsWorkReportModalOpen(true);
                    }
                  }}
                >
                  <div className="flex items-start gap-4">
                    {item.type !== 'check' && (
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getIconColor(item.type)}`}>
                        <Icon name={getIcon(item.type) as any} size={20} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      {item.type !== 'check' && (
                        <h3 className="font-semibold text-slate-900 mb-1">{item.title}</h3>
                      )}
                      
                      {item.type === 'check' && item.workId && (
                        <div className="flex items-center gap-2 mb-2">
                          <Icon name="Wrench" size={14} className="text-slate-500" />
                          <span className="text-sm font-medium text-slate-700">Работа: {getWorkTitle(item.workId)}</span>
                        </div>
                      )}
                      
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
                        {item.type !== 'check' && item.objectId && (
                          <span className="flex items-center gap-1">
                            <Icon name="Building" size={12} />
                            {getObjectTitle(item.objectId)}
                          </span>
                        )}
                        {item.type !== 'check' && item.workId && (
                          <span className="flex items-center gap-1">
                            <Icon name="Briefcase" size={12} />
                            {getWorkTitle(item.workId)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {selectedWorkLog && (
        <WorkLogModal
          isOpen={isWorkReportModalOpen}
          onClose={() => {
            setIsWorkReportModalOpen(false);
            setSelectedWorkLog(null);
          }}
          workLog={{
            id: selectedWorkLog.id,
            description: selectedWorkLog.description,
            timestamp: selectedWorkLog.created_at,
            author: selectedWorkLog.author_name,
            photoUrls: selectedWorkLog.photo_urls ? selectedWorkLog.photo_urls.split(',').filter((url: string) => url.trim()) : [],
            volume: selectedWorkLog.volume,
            materials: selectedWorkLog.materials
          }}
        />
      )}
    </div>
  );
};

export default Activity;