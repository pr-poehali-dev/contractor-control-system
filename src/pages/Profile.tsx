import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

const Profile = () => {
  const { user } = useAuth();

  const stats = user?.role === 'customer' 
    ? [
        { label: 'Проектов', value: '3', icon: 'FolderKanban' },
        { label: 'Объектов', value: '25', icon: 'Building' },
        { label: 'Проверок', value: '142', icon: 'ClipboardCheck' },
        { label: 'Замечаний', value: '8', icon: 'AlertCircle' },
      ]
    : [
        { label: 'Работ', value: '3', icon: 'Wrench' },
        { label: 'Завершено', value: '15', icon: 'CheckCircle2' },
        { label: 'Записей', value: '48', icon: 'FileText' },
        { label: 'Устранено', value: '12', icon: 'CheckCircle2' },
      ];

  const activities = [
    { action: 'Создана проверка', details: 'Замена кровли • ул. Ленина, д. 10', time: '2 часа назад', icon: 'Search' },
    { action: 'Добавлено замечание', details: 'Несоответствие качества покрытия', time: '5 часов назад', icon: 'AlertTriangle' },
    { action: 'Обновлена смета', details: 'Ремонт фасада • версия 2.1', time: '1 день назад', icon: 'FileText' },
    { action: 'Завершена работа', details: 'Замена окон • ул. Ленина, д. 10', time: '2 дня назад', icon: 'CheckCircle2' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Профиль</h1>
        <p className="text-slate-600">Персональная информация и активность</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex flex-col items-center text-center">
              <Avatar className="w-24 h-24 mb-4">
                <AvatarFallback className="bg-gradient-to-br from-[#2563EB] to-[#1E40AF] text-white text-2xl">
                  {user?.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-xl mb-2">{user?.name}</CardTitle>
              <CardDescription>{user?.email}</CardDescription>
              <Badge className="mt-3" variant="outline">
                {user?.role === 'admin' ? 'Администратор' : user?.role === 'client' ? 'Заказчик' : 'Подрядчик'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <Icon name="Phone" className="text-slate-600" size={20} />
              <div>
                <p className="text-xs text-slate-600">Телефон</p>
                <p className="font-medium text-sm">+7 (900) 123-45-67</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <Icon name="MapPin" className="text-slate-600" size={20} />
              <div>
                <p className="text-xs text-slate-600">Город</p>
                <p className="font-medium text-sm">Казань</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <Icon name="Calendar" className="text-slate-600" size={20} />
              <div>
                <p className="text-xs text-slate-600">В системе с</p>
                <p className="font-medium text-sm">01.01.2025</p>
              </div>
            </div>
            <Button className="w-full mt-4" variant="outline">
              <Icon name="Edit" size={18} className="mr-2" />
              Редактировать профиль
            </Button>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Статистика</CardTitle>
              <CardDescription>Ваша активность в системе</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                  <div 
                    key={stat.label} 
                    className="text-center p-4 bg-slate-50 rounded-lg animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Icon name={stat.icon as any} className="text-[#2563EB]" size={24} />
                    </div>
                    <p className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</p>
                    <p className="text-xs text-slate-600">{stat.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Последняя активность</CardTitle>
              <CardDescription>Ваши недавние действия</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <div 
                    key={index} 
                    className="flex items-start gap-4 animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon name={activity.icon as any} className="text-slate-600" size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{activity.action}</p>
                      <p className="text-sm text-slate-600">{activity.details}</p>
                      <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Быстрые действия</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="justify-start">
                  <Icon name="FileDown" size={18} className="mr-2" />
                  Экспорт данных
                </Button>
                <Button variant="outline" className="justify-start">
                  <Icon name="Download" size={18} className="mr-2" />
                  Скачать отчёт
                </Button>
                <Button variant="outline" className="justify-start">
                  <Icon name="Lock" size={18} className="mr-2" />
                  Сменить пароль
                </Button>
                <Button variant="outline" className="justify-start">
                  <Icon name="Bell" size={18} className="mr-2" />
                  Уведомления
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;