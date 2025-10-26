import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

const getRoleBadgeVariant = (role: string): 'default' | 'secondary' | 'outline' => {
  if (role === 'admin') return 'default';
  if (role === 'client') return 'secondary';
  return 'outline';
};

const getRoleLabel = (role: string): string => {
  if (role === 'admin') return 'admin';
  if (role === 'client') return 'client';
  return 'contractor';
};

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

interface UsersTableProps {
  users: AdminUser[];
  onEditUser: (user: AdminUser) => void;
  onToggleStatus: (userId: number) => void;
  onDeleteUser: (userId: number, userName: string) => void;
}

export const UsersTable = ({
  users,
  onEditUser,
  onToggleStatus,
  onDeleteUser,
}: UsersTableProps) => {
  return (
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
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    {getRoleLabel(user.role)}
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
                      onClick={() => onEditUser(user)}
                      title="Редактировать"
                    >
                      <Icon name="Edit" size={16} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onToggleStatus(user.id)}
                      title={user.is_active ? 'Заблокировать' : 'Активировать'}
                    >
                      {user.is_active ? <Icon name="Ban" size={16} /> : <Icon name="CheckCircle" size={16} />}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => onDeleteUser(user.id, user.name)}
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
  );
};