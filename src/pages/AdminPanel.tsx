import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const ADMIN_API = 'https://functions.poehali.dev/0b65962d-5a9a-40b3-8108-41e8d32b4a76';

interface Stats {
  clients_count: number;
  contractors_count: number;
  total_users: number;
  projects_count: number;
  objects_count: number;
  works_count: number;
  new_users_week: number;
}

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

interface WorkType {
  id: number;
  name: string;
  description?: string;
  unit: string;
  category?: string;
  created_at: string;
}

export default function AdminPanel() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [workTypes, setWorkTypes] = useState<WorkType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'work-types'>('stats');
  const [showAddWorkType, setShowAddWorkType] = useState(false);
  const [newWorkType, setNewWorkType] = useState({ name: '', description: '', unit: 'м²', category: '' });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    
    loadStats();
  }, [user, navigate]);

  const loadStats = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${ADMIN_API}?action=stats`, {
        headers: { 'X-Auth-Token': token }
      });
      
      if (!response.ok) throw new Error('Failed to load stats');
      
      const data = await response.json();
      setStats(data);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить статистику',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${ADMIN_API}?action=users`, {
        headers: { 'X-Auth-Token': token }
      });
      
      if (!response.ok) throw new Error('Failed to load users');
      
      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить пользователей',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId: number, isActive: boolean) => {
    if (!token) return;
    
    try {
      const response = await fetch(`${ADMIN_API}?action=toggle-user`, {
        method: 'PUT',
        headers: {
          'X-Auth-Token': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_id: userId, is_active: !isActive })
      });
      
      if (!response.ok) throw new Error('Failed to update user');
      
      toast({
        title: 'Успешно',
        description: 'Статус пользователя изменён'
      });
      
      loadUsers();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось изменить статус',
        variant: 'destructive'
      });
    }
  };

  const loadWorkTypes = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${ADMIN_API}?action=work-types`, {
        headers: { 'X-Auth-Token': token }
      });
      
      if (!response.ok) throw new Error('Failed to load work types');
      
      const data = await response.json();
      setWorkTypes(data.work_types);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить типы работ',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const addWorkType = async () => {
    if (!token || !newWorkType.name || !newWorkType.unit) {
      toast({
        title: 'Ошибка',
        description: 'Заполните обязательные поля',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      const response = await fetch(`${ADMIN_API}?action=add-work-type`, {
        method: 'POST',
        headers: {
          'X-Auth-Token': token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newWorkType)
      });
      
      if (!response.ok) throw new Error('Failed to add work type');
      
      toast({
        title: 'Успешно',
        description: 'Тип работы добавлен'
      });
      
      setNewWorkType({ name: '', description: '', unit: 'м²', category: '' });
      setShowAddWorkType(false);
      loadWorkTypes();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить тип работы',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    } else if (activeTab === 'work-types') {
      loadWorkTypes();
    }
  }, [activeTab]);

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="h-full flex flex-col bg-slate-50">
      <div className="bg-white border-b border-slate-200 p-6 md:p-8">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Админ-панель</h1>
              <p className="text-lg text-slate-600">Управление системой</p>
            </div>
            <Badge variant="secondary" className="text-base px-4 py-2">
              <Icon name="Shield" size={18} className="mr-2" />
              Администратор
            </Badge>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button
              variant={activeTab === 'stats' ? 'default' : 'outline'}
              onClick={() => setActiveTab('stats')}
            >
              <Icon name="BarChart3" size={18} className="mr-2" />
              Статистика
            </Button>
            <Button
              variant={activeTab === 'users' ? 'default' : 'outline'}
              onClick={() => setActiveTab('users')}
            >
              <Icon name="Users" size={18} className="mr-2" />
              Пользователи
            </Button>
            <Button
              variant={activeTab === 'work-types' ? 'default' : 'outline'}
              onClick={() => setActiveTab('work-types')}
            >
              <Icon name="Wrench" size={18} className="mr-2" />
              Справочник работ
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-[1600px] mx-auto">
          {loading && activeTab === 'stats' ? (
            <div className="flex items-center justify-center h-96">
              <Icon name="Loader2" size={48} className="animate-spin text-slate-400" />
            </div>
          ) : activeTab === 'stats' && stats ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-medium text-slate-600">Всего пользователей</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline gap-2">
                      <p className="text-4xl font-bold text-slate-900">{stats.total_users}</p>
                      <Badge variant="secondary" className="text-xs">
                        +{stats.new_users_week} за неделю
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-medium text-slate-600">Заказчики</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-blue-600">{stats.clients_count}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-medium text-slate-600">Подрядчики</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-green-600">{stats.contractors_count}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-medium text-slate-600">Проекты</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-slate-900">{stats.projects_count}</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-medium text-slate-600">Объекты</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-slate-900">{stats.objects_count}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-medium text-slate-600">Работы</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-slate-900">{stats.works_count}</p>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : activeTab === 'users' ? (
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
                              onClick={() => toggleUserStatus(u.id, u.is_active)}
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
          ) : activeTab === 'work-types' ? (
            <div className="space-y-6">
              <div className="flex justify-end">
                <Button onClick={() => setShowAddWorkType(!showAddWorkType)}>
                  <Icon name="Plus" size={18} className="mr-2" />
                  Добавить тип работы
                </Button>
              </div>

              {showAddWorkType && (
                <Card>
                  <CardHeader>
                    <CardTitle>Новый тип работы</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Название <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={newWorkType.name}
                          onChange={(e) => setNewWorkType({ ...newWorkType, name: e.target.value })}
                          placeholder="Например: Кладка кирпича"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Единица измерения <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={newWorkType.unit}
                          onChange={(e) => setNewWorkType({ ...newWorkType, unit: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                        >
                          <option value="м²">м²</option>
                          <option value="м³">м³</option>
                          <option value="м">м</option>
                          <option value="шт">шт</option>
                          <option value="т">т</option>
                          <option value="кг">кг</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Категория
                        </label>
                        <input
                          type="text"
                          value={newWorkType.category}
                          onChange={(e) => setNewWorkType({ ...newWorkType, category: e.target.value })}
                          placeholder="Например: Кладочные работы"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Описание
                        </label>
                        <input
                          type="text"
                          value={newWorkType.description}
                          onChange={(e) => setNewWorkType({ ...newWorkType, description: e.target.value })}
                          placeholder="Краткое описание"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button onClick={addWorkType}>
                        Сохранить
                      </Button>
                      <Button variant="outline" onClick={() => setShowAddWorkType(false)}>
                        Отмена
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="text-left p-4 text-sm font-semibold text-slate-700">ID</th>
                          <th className="text-left p-4 text-sm font-semibold text-slate-700">Название</th>
                          <th className="text-left p-4 text-sm font-semibold text-slate-700">Категория</th>
                          <th className="text-left p-4 text-sm font-semibold text-slate-700">Единица</th>
                          <th className="text-left p-4 text-sm font-semibold text-slate-700">Описание</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr>
                            <td colSpan={5} className="text-center p-8">
                              <Icon name="Loader2" size={32} className="animate-spin text-slate-400 mx-auto" />
                            </td>
                          </tr>
                        ) : workTypes.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="text-center p-8 text-slate-500">
                              Типы работ не найдены
                            </td>
                          </tr>
                        ) : (
                          workTypes.map(wt => (
                            <tr key={wt.id} className="border-b border-slate-100 hover:bg-slate-50">
                              <td className="p-4 text-sm text-slate-700">{wt.id}</td>
                              <td className="p-4 text-sm font-medium text-slate-900">{wt.name}</td>
                              <td className="p-4 text-sm text-slate-600">{wt.category || '-'}</td>
                              <td className="p-4">
                                <Badge variant="secondary">{wt.unit}</Badge>
                              </td>
                              <td className="p-4 text-sm text-slate-600">{wt.description || '-'}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}