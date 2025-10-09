import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface User {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  role: string;
  organization?: string;
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

interface AdminUsersProps {
  users: User[];
  onToggleUserStatus: (userId: number, isActive: boolean) => void;
}

export default function AdminUsers({ users, onToggleUserStatus }: AdminUsersProps) {
  return (
    <Card>
      <CardContent className="p-0">
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
              {users.map(u => (
                <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4 text-sm text-slate-700">{u.id}</td>
                  <td className="p-4 text-sm font-medium text-slate-900">{u.name}</td>
                  <td className="p-4 text-sm text-slate-600">{u.email || '-'}</td>
                  <td className="p-4 text-sm text-slate-600">{u.phone || '-'}</td>
                  <td className="p-4">
                    <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>
                      {u.role}
                    </Badge>
                  </td>
                  <td className="p-4 text-sm text-slate-600">{u.organization || '-'}</td>
                  <td className="p-4">
                    <Badge variant={u.is_active ? 'default' : 'secondary'}>
                      {u.is_active ? 'Активен' : 'Заблокирован'}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onToggleUserStatus(u.id, u.is_active)}
                    >
                      {u.is_active ? 'Заблокировать' : 'Активировать'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
