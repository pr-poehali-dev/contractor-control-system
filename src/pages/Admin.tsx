import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { AdminAuthForm } from '@/components/admin/AdminAuthForm';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { UsersTable } from '@/components/admin/UsersTable';
import { EditUserDialog } from '@/components/admin/EditUserDialog';
import { apiClient } from '@/api/apiClient';
import { ENDPOINTS } from '@/api/endpoints';

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
  is_active?: boolean;
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
      const response = await apiClient.get(ENDPOINTS.ADMIN.USERS, {
        headers: { 'X-Admin-Key': 'admin123' },
      });

      if (!response.success) throw new Error('Failed to load users');

      setUsers(response.data?.users || []);
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
      const response = await apiClient.post(ENDPOINTS.CONTRACTORS.INVITE, inviteData, {
        headers: {
          'X-Admin-Key': 'admin123',
        },
      });

      if (!response.success) throw new Error('Failed to invite contractor');
      
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
      const response = await apiClient.put(ENDPOINTS.ADMIN.USERS, {
        user_id: editingUser.id,
        ...editData,
      }, {
        headers: {
          'X-Admin-Key': 'admin123',
        },
      });

      if (!response.success) throw new Error('Failed to update user');

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
      const response = await apiClient.post(ENDPOINTS.ADMIN.USERS, {
        action: 'reset_password',
        user_id: editingUser.id,
      }, {
        headers: {
          'X-Admin-Key': 'admin123',
        },
      });

      if (!response.success) throw new Error('Failed to reset password');

      setNewPassword(response.data.password);

      toast({
        title: 'Пароль сброшен!',
        description: `Новый пароль: ${response.data.password}`,
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
      const response = await apiClient.post(ENDPOINTS.ADMIN.USERS, {
        action: 'toggle_status',
        user_id: userId,
      }, {
        headers: {
          'X-Admin-Key': 'admin123',
        },
      });

      if (!response.success) throw new Error('Failed to toggle status');

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
      const response = await apiClient.post(ENDPOINTS.ADMIN.USERS, {
        action: 'delete_user',
        user_id: userId,
      }, {
        headers: {
          'X-Admin-Key': 'admin123',
        },
      });

      if (!response.success) throw new Error('Failed to delete user');

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
      <AdminAuthForm
        adminKey={adminKey}
        onAdminKeyChange={setAdminKey}
        onAuth={handleAuth}
      />
    );
  }

  return (
    <div className="p-4 md:p-8 pb-24 md:pb-10">
      <AdminHeader
        isInviteOpen={isInviteOpen}
        onInviteOpenChange={setIsInviteOpen}
        inviteData={inviteData}
        onInviteDataChange={setInviteData}
        onInvite={handleInviteContractor}
        isSendingInvite={isSendingInvite}
        onRefresh={loadUsers}
      />

      {isLoading ? (
        <div className="text-center py-12">
          <Icon name="Loader2" size={48} className="animate-spin text-slate-400 mx-auto" />
        </div>
      ) : (
        <UsersTable
          users={users}
          onEditUser={handleEditUser}
          onToggleStatus={handleToggleStatus}
          onDeleteUser={handleDeleteUser}
        />
      )}

      <EditUserDialog
        isOpen={isEditOpen}
        onOpenChange={setIsEditOpen}
        editingUser={editingUser}
        editData={editData}
        onEditDataChange={setEditData}
        onSave={handleSaveUser}
        onResetPassword={handleResetPassword}
        newPassword={newPassword}
      />

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