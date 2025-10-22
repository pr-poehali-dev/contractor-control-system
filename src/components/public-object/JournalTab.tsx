import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';
import { safeDateCompare, isValidDate } from '@/utils/dateValidation';

interface JournalTabProps {
  objectId: number;
}

const JournalTab = ({ objectId }: JournalTabProps) => {
  const { userData } = useAuth();

  const works = (userData?.works && Array.isArray(userData.works)) 
    ? userData.works.filter(w => w.object_id === objectId) 
    : [];
  const workLogs = (userData?.workLogs && Array.isArray(userData.workLogs)) ? userData.workLogs : [];
  const inspections = (userData?.inspections && Array.isArray(userData.inspections)) ? userData.inspections : [];

  // Собираем все события по работам объекта
  const allActivity = [
    ...workLogs
      .filter(log => {
        const work = works.find(w => w.id === log.work_id);
        return work !== undefined;
      })
      .map(log => {
        const work = works.find(w => w.id === log.work_id);
        return {
          id: `log-${log.id}`,
          type: 'work' as const,
          title: 'Отчёт о работе',
          description: log.description,
          timestamp: log.created_at,
          user: log.author_name,
          workTitle: work?.title,
        };
      }),
    ...inspections
      .filter(insp => {
        const work = works.find(w => w.id === insp.work_id);
        return work !== undefined;
      })
      .map(insp => {
        const work = works.find(w => w.id === insp.work_id);
        return {
          id: `insp-${insp.id}`,
          type: 'check' as const,
          title: `Проверка №${insp.inspection_number}`,
          description: insp.notes || insp.description || 'Проверка выполнена',
          timestamp: insp.created_at,
          user: insp.author_name || 'Инспектор',
          workTitle: work?.title,
        };
      }),
  ].sort((a, b) => safeDateCompare(a.timestamp, b.timestamp));

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
    return type === 'check' ? 'ClipboardCheck' : 'Wrench';
  };

  const getIconColor = (type: string) => {
    return type === 'check' ? 'text-green-600 bg-green-100' : 'text-blue-600 bg-blue-100';
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900">Журнал работ</h2>
      {allActivity.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Icon name="Activity" size={48} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600">Нет событий в журнале</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {allActivity.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getIconColor(item.type)}`}>
                    <Icon name={getIcon(item.type) as any} size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 mb-1">{item.title}</h3>
                    <p className="text-sm text-slate-600 mb-2">{item.description}</p>
                    {item.workTitle && (
                      <div className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 rounded text-xs text-slate-700 mb-2">
                        <Icon name="Wrench" size={12} />
                        <span>{item.workTitle}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Icon name="User" size={12} />
                        <span>{item.user}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Icon name="Clock" size={12} />
                        <span>{formatTimestamp(item.timestamp)}</span>
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
  );
};

export default JournalTab;