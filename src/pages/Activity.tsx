import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface ActivityItem {
  id: string;
  type: 'check' | 'defect' | 'work' | 'estimate' | 'user';
  title: string;
  description: string;
  timestamp: string;
  user: string;
  project?: string;
}

const mockActivity: ActivityItem[] = [
  {
    id: '1',
    type: 'defect',
    title: 'Добавлено замечание',
    description: 'Несоответствие качества кровельного покрытия ГОСТ 30547-97',
    timestamp: '10 минут назад',
    user: 'Инспектор Петров',
    project: 'Капремонт Казани 2025 • ул. Ленина, д. 10'
  },
  {
    id: '2',
    type: 'check',
    title: 'Проверка завершена',
    description: 'Проверка работ по замене кровли',
    timestamp: '2 часа назад',
    user: 'Инспектор Петров',
    project: 'Капремонт Казани 2025 • ул. Ленина, д. 10'
  },
  {
    id: '3',
    type: 'work',
    title: 'Запись в журнале работ',
    description: 'Добавлена запись о выполнении монтажа на площади 150 м²',
    timestamp: '5 часов назад',
    user: 'ООО "СтройМастер"',
    project: 'Капремонт Казани 2025 • ул. Ленина, д. 10'
  },
  {
    id: '4',
    type: 'estimate',
    title: 'Обновлена смета',
    description: 'Актуализирована версия 2.1 для работ по ремонту фасада',
    timestamp: '1 день назад',
    user: 'Инспектор Петров',
    project: 'Капремонт Казани 2025 • ул. Пушкина, д. 5'
  },
  {
    id: '5',
    type: 'user',
    title: 'Новый пользователь',
    description: 'Добавлен подрядчик ИП Сидоров А.А.',
    timestamp: '2 дня назад',
    user: 'Администратор',
    project: 'Система'
  },
];

const getActivityIcon = (type: ActivityItem['type']) => {
  switch (type) {
    case 'check': return 'Search';
    case 'defect': return 'AlertTriangle';
    case 'work': return 'Wrench';
    case 'estimate': return 'FileText';
    case 'user': return 'UserPlus';
  }
};

const getActivityColor = (type: ActivityItem['type']) => {
  switch (type) {
    case 'check': return 'bg-blue-100 text-blue-600';
    case 'defect': return 'bg-red-100 text-red-600';
    case 'work': return 'bg-green-100 text-green-600';
    case 'estimate': return 'bg-purple-100 text-purple-600';
    case 'user': return 'bg-slate-100 text-slate-600';
  }
};

const Activity = () => {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Журнал действий</h1>
        <p className="text-slate-600">История всех действий в системе</p>
      </div>

      <div className="space-y-4">
        {mockActivity.map((item, index) => (
          <Card 
            key={item.id} 
            className="animate-fade-in hover-scale"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${getActivityColor(item.type)}`}>
                  <Icon name={getActivityIcon(item.type) as any} size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-slate-900">{item.title}</h3>
                      <p className="text-sm text-slate-600 mt-1">{item.description}</p>
                    </div>
                    <span className="text-sm text-slate-500 whitespace-nowrap ml-4">
                      {item.timestamp}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-3 text-sm">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Icon name="User" size={14} />
                      {item.user}
                    </span>
                    {item.project && (
                      <Badge variant="outline" className="text-xs">
                        {item.project}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Activity;
