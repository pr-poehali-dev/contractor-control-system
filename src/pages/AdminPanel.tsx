import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import AdminStats from '@/components/admin/AdminStats';
import AdminUsers from '@/components/admin/AdminUsers';
import AdminWorkTypes from '@/components/admin/AdminWorkTypes';

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
          {activeTab === 'stats' && (
            <AdminStats stats={stats} loading={loading} />
          )}
          
          {activeTab === 'users' && (
            <AdminUsers users={users} onToggleUserStatus={toggleUserStatus} />
          )}
          
          {activeTab === 'work-types' && (
            <AdminWorkTypes
              workTypes={workTypes}
              loading={loading}
              showAddWorkType={showAddWorkType}
              newWorkType={newWorkType}
              onToggleAddForm={() => setShowAddWorkType(!showAddWorkType)}
              onNewWorkTypeChange={setNewWorkType}
              onAddWorkType={addWorkType}
            />
          )}
        </div>
      </div>
    </div>
  );
}
