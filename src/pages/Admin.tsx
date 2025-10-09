import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

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
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteData, setInviteData] = useState({
    name: '',
    phone: '',
    email: '',
    organization: '',
  });
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editData, setEditData] = useState({ name: '', email: '', phone: '', organization: '' });
  const [newPassword, setNewPassword] = useState('');
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
      const response = await fetch('https://functions.poehali.dev/3f6bb7ff-3e84-4770-8884-3e96062db7f2', {
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

  const handleInviteContractor = async () => {
    if (!inviteData.name || !inviteData.phone) {
      toast({
        title: 'Ошибка',
        description: 'Заполните обязательные поля: имя и телефон',
        variant: 'destructive',
      });
      return;
    }

    setIsSendingInvite(true);
    try {
      const response = await fetch('https://functions.poehali.dev/5865695e-cb4a-4795-bc42-5465c2b7ad0b', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Key': 'admin123',
        },
        body: JSON.stringify(inviteData),
      });

      if (!response.ok) throw new Error('Failed to invite contractor');

      const data = await response.json();
      
      toast({
        title: 'Успешно!',
        description: `Подрядчик ${inviteData.name} приглашён. SMS с паролем отправлено на ${inviteData.phone}`,
      });

      setIsInviteOpen(false);
      setInviteData({ name: '', phone: '', email: '', organization: '' });
      loadUsers();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить приглашение',
        variant: 'destructive',
      });
    } finally {
      setIsSendingInvite(false);
    }
  };

  const handleEditUser = (user: AdminUser) => {
    setEditingUser(user);
    setEditData({
      name: user.name,
      email: user.email || '',
      phone: user.phone,
      organization: user.organization || '',
    });
    setNewPassword('');
    setIsEditOpen(true);
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;

    try {
      const response = await fetch('https://functions.poehali.dev/3f6bb7ff-3e84-4770-8884-3e96062db7f2', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Key': 'admin123',
        },
        body: JSON.stringify({
          user_id: editingUser.id,
          ...editData,
        }),
      });

      if (!response.ok) throw new Error('Failed to update user');

      toast({
        title: 'Успешно!',
        description: 'Данные пользователя обновлены',
      });

      setIsEditOpen(false);
      loadUsers();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить пользователя',
        variant: 'destructive',
      });
    }
  };

  const handleResetPassword = async () => {
    if (!editingUser) return;

    try {
      const response = await fetch('https://functions.poehali.dev/3f6bb7ff-3e84-4770-8884-3e96062db7f2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Key': 'admin123',
        },
        body: JSON.stringify({
          action: 'reset_password',
          user_id: editingUser.id,
        }),
      });

      if (!response.ok) throw new Error('Failed to reset password');

      const data = await response.json();
      setNewPassword(data.password);

      toast({
        title: 'Пароль сброшен!',
        description: `Новый пароль: ${data.password}`,
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось сбросить пароль',
        variant: 'destructive',
      });
    }
  };

  const handleToggleStatus = async (userId: number) => {
    try {
      const response = await fetch('https://functions.poehali.dev/3f6bb7ff-3e84-4770-8884-3e96062db7f2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Key': 'admin123',
        },
        body: JSON.stringify({
          action: 'toggle_status',
          user_id: userId,
        }),
      });

      if (!response.ok) throw new Error('Failed to toggle status');

      toast({
        title: 'Статус изменён',
      });

      loadUsers();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось изменить статус',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteUser = async (userId: number, userName: string) => {
    if (!confirm(`Вы уверены что хотите УДАЛИТЬ пользователя "${userName}"? Это действие необратимо!`)) {
      return;
    }

    try {
      const response = await fetch('https://functions.poehali.dev/3f6bb7ff-3e84-4770-8884-3e96062db7f2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Key': 'admin123',
        },
        body: JSON.stringify({
          action: 'delete_user',
          user_id: userId,
        }),
      });

      if (!response.ok) throw new Error('Failed to delete user');

      toast({
        title: 'Пользователь удалён',
        description: `${userName} удалён из системы`,
      });

      loadUsers();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить пользователя',
        variant: 'destructive',
      });
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
        <div className="flex gap-3">
          <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
            <DialogTrigger asChild>
              <Button>
                <Icon name="UserPlus" size={18} className="mr-2" />
                Пригласить подрядчика
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Пригласить подрядчика</DialogTitle>
                <DialogDescription>
                  Введите данные подрядчика. На указанный телефон будет отправлен пароль для входа.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Имя *</Label>
                  <Input
                    id="name"
                    placeholder="Иван Иванов"
                    value={inviteData.name}
                    onChange={(e) => setInviteData({ ...inviteData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Телефон *</Label>
                  <Input
                    id="phone"
                    placeholder="+7 (900) 123-45-67"
                    value={inviteData.phone}
                    onChange={(e) => setInviteData({ ...inviteData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="contractor@example.com"
                    value={inviteData.email}
                    onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="organization">Организация</Label>
                  <Input
                    id="organization"
                    placeholder="ООО 'Стройпроект'"
                    value={inviteData.organization}
                    onChange={(e) => setInviteData({ ...inviteData, organization: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsInviteOpen(false)}>
                  Отмена
                </Button>
                <Button onClick={handleInviteContractor} disabled={isSendingInvite}>
                  {isSendingInvite ? (
                    <>
                      <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                      Отправка...
                    </>
                  ) : (
                    <>
                      <Icon name="Send" size={18} className="mr-2" />
                      Отправить приглашение
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button onClick={loadUsers} variant="outline">
            <Icon name="RefreshCw" size={18} className="mr-2" />
            Обновить
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <Icon name="Loader2" size={48} className="animate-spin text-slate-400 mx-auto" />
        </div>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold text-slate-700">ID</th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-700">Имя</th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-700">Email</th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-700">Телефон</th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-700">Роль</th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-700">Организация</th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-700">Статус</th>
                  <th className="text-right p-4 text-sm font-semibold text-slate-700">Действия</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-4 text-sm text-slate-700">{user.id}</td>
                    <td className="p-4 text-sm font-medium text-slate-900">{user.name}</td>
                    <td className="p-4 text-sm text-slate-600">{user.email || '-'}</td>
                    <td className="p-4 text-sm text-slate-600">{user.phone}</td>
                    <td className="p-4">
                      <Badge variant={user.role === 'admin' ? 'default' : user.role === 'client' ? 'secondary' : 'outline'}>
                        {user.role === 'admin' ? 'admin' : user.role === 'client' ? 'client' : 'contractor'}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm text-slate-600">{user.organization || '-'}</td>
                    <td className="p-4">
                      <Badge variant={user.is_active ? 'default' : 'secondary'}>
                        {user.is_active ? 'Активен' : 'Заблокирован'}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditUser(user)}
                          title="Редактировать"
                        >
                          <Icon name="Edit" size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleStatus(user.id)}
                          title={user.is_active ? 'Заблокировать' : 'Активировать'}
                        >
                          {user.is_active ? <Icon name="Ban" size={16} /> : <Icon name="CheckCircle" size={16} />}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteUser(user.id, user.name)}
                          title="Удалить"
                        >
                          <Icon name="Trash2" size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Редактировать пользователя</DialogTitle>
            <DialogDescription>
              Изменение данных пользователя {editingUser?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Имя</Label>
              <Input
                id="edit-name"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editData.email}
                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Телефон</Label>
              <Input
                id="edit-phone"
                value={editData.phone}
                onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-organization">Организация</Label>
              <Input
                id="edit-organization"
                value={editData.organization}
                onChange={(e) => setEditData({ ...editData, organization: e.target.value })}
              />
            </div>

            {newPassword && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <Label className="text-green-900">Новый пароль:</Label>
                <p className="font-mono font-bold text-lg text-green-900 mt-1">{newPassword}</p>
                <p className="text-xs text-green-700 mt-2">Сохраните пароль, он больше не будет показан</p>
              </div>
            )}

            <div className="pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleResetPassword}
                className="w-full"
              >
                <Icon name="Key" size={18} className="mr-2" />
                Сбросить пароль
              </Button>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSaveUser}>
              <Icon name="Save" size={18} className="mr-2" />
              Сохранить
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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