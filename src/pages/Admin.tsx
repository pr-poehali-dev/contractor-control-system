import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface AdminUser {
  id: number;
  phone: string;
  email?: string;
  name: string;
  role: string;
  organization?: string;
  created_at: string;
  projects_count: number;
  works_count: number;
}

const Admin = () => {
  const [adminKey, setAdminKey] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAuth = () => {
    if (adminKey === 'admin123') {
      setIsAuthorized(true);
      loadUsers();
    } else {
      toast({
        title: 'Ошибка',
        description: 'Неверный ключ администратора',
        variant: 'destructive',
      });
    }
  };

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/TODO_ADMIN_URL', {
        headers: { 'X-Admin-Key': 'admin123' },
      });

      if (!response.ok) throw new Error('Failed to load users');

      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить пользователей',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Shield" size={24} />
              Админ-панель
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Введите ключ администратора"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
            />
            <Button onClick={handleAuth} className="w-full">
              Войти
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Админ-панель</h1>
          <p className="text-slate-600">Управление пользователями системы</p>
        </div>
        <Button onClick={loadUsers} variant="outline">
          <Icon name="RefreshCw" size={18} className="mr-2" />
          Обновить
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <Icon name="Loader2" size={48} className="animate-spin text-slate-400 mx-auto" />
        </div>
      ) : (
        <div className="grid gap-4">
          {users.map((user) => (
            <Card key={user.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{user.name}</h3>
                    <p className="text-sm text-slate-600">{user.phone}</p>
                    {user.email && <p className="text-sm text-slate-600">{user.email}</p>}
                  </div>
                  <Badge variant={user.role === 'client' ? 'default' : 'secondary'}>
                    {user.role === 'client' ? 'Заказчик' : 'Подрядчик'}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">ID:</span>
                    <p className="font-medium">{user.id}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Проектов:</span>
                    <p className="font-medium">{user.projects_count}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Работ:</span>
                    <p className="font-medium">{user.works_count}</p>
                  </div>
                </div>

                {user.organization && (
                  <div className="mt-3 pt-3 border-t">
                    <span className="text-sm text-slate-500">Организация:</span>
                    <p className="text-sm font-medium">{user.organization}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <Icon name="Info" size={16} className="inline mr-2" />
          Доступ к админ-панели: ключ <code className="bg-yellow-100 px-2 py-1 rounded">admin123</code>
        </p>
      </div>
    </div>
  );
};

export default Admin;
