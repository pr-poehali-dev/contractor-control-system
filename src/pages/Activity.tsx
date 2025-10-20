import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { safeDateCompare, isValidDate } from '@/utils/dateValidation';

const Activity = () => {
  const { userData } = useAuth();

  const workLogs = (userData?.workLogs && Array.isArray(userData.workLogs)) ? userData.workLogs : [];
  const inspections = (userData?.inspections && Array.isArray(userData.inspections)) ? userData.inspections : [];
  const remarks = (userData?.remarks && Array.isArray(userData.remarks)) ? userData.remarks : [];
  const works = (userData?.works && Array.isArray(userData.works)) ? userData.works : [];
  const objects = (userData?.objects && Array.isArray(userData.objects)) ? userData.objects : [];

  const allActivity = [
    ...workLogs.map(log => ({
      id: `log-${log.id}`,
      type: 'work' as const,
      title: 'Запись в журнале работ',
      description: log.description,
      timestamp: log.created_at,
      user: log.author_name,
      workId: log.work_id,
    })),
    ...inspections.map(insp => ({
      id: `insp-${insp.id}`,
      type: 'check' as const,
      title: `Проверка №${insp.inspection_number}`,
      description: insp.notes || 'Проверка выполнена',
      timestamp: insp.created_at,
      user: insp.inspector_name,
      workId: insp.work_id,
    })),
    ...remarks.map(rem => ({
      id: `rem-${rem.id}`,
      type: 'defect' as const,
      title: 'Замечание',
      description: rem.description,
      timestamp: rem.created_at,
      user: 'Инспектор',
      inspectionId: rem.inspection_id,
    })),
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

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Лента активности</h1>
        <p className="text-slate-600">Последние события по всем проектам</p>
      </div>

      {allActivity.length === 0 ? (
        <Card className="p-12 text-center">
          <Icon name="Activity" size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500">Нет активности</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {allActivity.map((item, index) => (
            <Card 
              key={item.id}
              className="animate-fade-in hover:shadow-md transition-shadow"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getIconColor(item.type)}`}>
                    <Icon name={getIcon(item.type) as any} size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-1">{item.title}</h3>
                        <p className="text-sm text-slate-600 mb-2">{item.description}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Icon name="User" size={12} />
                            {item.user}
                          </span>
                          <span className="flex items-center gap-1">
                            <Icon name="Clock" size={12} />
                            {formatTimestamp(item.timestamp)}
                          </span>
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
  );
};

export default Activity;