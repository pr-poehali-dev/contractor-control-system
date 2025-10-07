import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';

const Settings = () => {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Настройки</h1>
        <p className="text-slate-600">Управление параметрами системы</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Профиль</CardTitle>
            <CardDescription>Персональная информация</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Имя</Label>
              <Input id="name" defaultValue="Инспектор Петров" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="inspector@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Телефон</Label>
              <Input id="phone" type="tel" defaultValue="+7 (900) 123-45-67" />
            </div>
            <Button>
              <Icon name="Save" size={18} className="mr-2" />
              Сохранить изменения
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Уведомления</CardTitle>
            <CardDescription>Настройка оповещений</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Email-уведомления</p>
                <p className="text-xs text-slate-500">Получать письма о событиях</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Push-уведомления</p>
                <p className="text-xs text-slate-500">Браузерные оповещения</p>
              </div>
              <Switch />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">SMS-уведомления</p>
                <p className="text-xs text-slate-500">Важные события по SMS</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Безопасность</CardTitle>
            <CardDescription>Управление доступом и паролем</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Текущий пароль</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Новый пароль</Label>
                <Input id="new-password" type="password" />
              </div>
            </div>
            <Button variant="outline">
              <Icon name="Lock" size={18} className="mr-2" />
              Изменить пароль
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Интеграции</CardTitle>
            <CardDescription>Подключенные сервисы</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center">
                  <Icon name="Mail" className="text-slate-600" size={20} />
                </div>
                <div>
                  <p className="font-medium">Электронная почта</p>
                  <p className="text-sm text-slate-500">Подключено</p>
                </div>
              </div>
              <Button variant="outline" size="sm">Настроить</Button>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center">
                  <Icon name="FileText" className="text-slate-600" size={20} />
                </div>
                <div>
                  <p className="font-medium">1С:Предприятие</p>
                  <p className="text-sm text-slate-500">Не подключено</p>
                </div>
              </div>
              <Button variant="outline" size="sm">Подключить</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
