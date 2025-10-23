import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthRedux } from '@/hooks/useAuthRedux';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/api/apiClient';
import { ENDPOINTS } from '@/api/endpoints';

interface Task {
  id: number;
  report_id: number;
  report_number: string;
  defect_id: string;
  defect_description: string;
  defect_location?: string;
  defect_severity?: string;
  status: string;
  work_title: string;
  object_title: string;
  created_at: string;
}

const MyTasks = () => {
  const navigate = useNavigate();
  const { user, token } = useAuthRedux();
  const { toast } = useToast();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'verified'>('all');

  useEffect(() => {
    if (user?.role === 'contractor' && user?.id && token) {
      loadTasks();
    }
  }, [user?.id, user?.role, token]);

  const loadTasks = async () => {
    if (!token || user?.role !== 'contractor') {
      return;
    }
    
    setLoading(true);
    try {
      const response = await apiClient.get(
        `${ENDPOINTS.CONTRACTORS.TASKS}?contractor_id=${user.id}`
      );
      
      if (response.success) {
        setTasks(response.data?.tasks || []);
      } else {
        console.error('[MyTasks] Error response:', response.error);
      }
    } catch (error) {
      console.error('[MyTasks] Fetch error:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить задачи',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity?: string) => {
    if (!severity) return 'bg-slate-100 text-slate-700';
    
    switch (severity.toLowerCase()) {
      case 'критическое':
        return 'bg-red-100 text-red-700';
      case 'высокое':
        return 'bg-orange-100 text-orange-700';
      case 'среднее':
        return 'bg-yellow-100 text-yellow-700';
      case 'низкое':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: 'Ожидает устранения', color: 'text-orange-600', icon: 'Clock' };
      case 'completed':
        return { label: 'На проверке', color: 'text-blue-600', icon: 'Eye' };
      case 'verified':
        return { label: 'Подтверждено', color: 'text-green-600', icon: 'CheckCircle2' };
      case 'rejected':
        return { label: 'Отклонено', color: 'text-red-600', icon: 'XCircle' };
      default:
        return { label: status, color: 'text-slate-600', icon: 'CircleAlert' };
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  const stats = {
    all: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    verified: tasks.filter(t => t.status === 'verified').length
  };

  if (user?.role !== 'contractor') {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto text-center">
          <Icon name="AlertCircle" size={48} className="mx-auto text-slate-400 mb-4" />
          <p className="text-slate-600">Эта страница доступна только подрядчикам</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Загрузка задач...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Icon name="ClipboardCheck" size={28} className="text-blue-600" />
            Мои задачи
          </h1>
          <p className="text-slate-600 mt-2">Замечания для устранения</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          <Card 
            className={`cursor-pointer transition-all ${filter === 'all' ? 'ring-2 ring-blue-600' : ''}`}
            onClick={() => setFilter('all')}
          >
            <CardContent className="p-3 text-center">
              <div className="text-xl font-bold text-slate-900">{stats.all}</div>
              <div className="text-xs text-slate-600">Всего</div>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all ${filter === 'pending' ? 'ring-2 ring-orange-600' : ''}`}
            onClick={() => setFilter('pending')}
          >
            <CardContent className="p-3 text-center">
              <div className="text-xl font-bold text-orange-600">{stats.pending}</div>
              <div className="text-xs text-slate-600">В работе</div>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all ${filter === 'completed' ? 'ring-2 ring-blue-600' : ''}`}
            onClick={() => setFilter('completed')}
          >
            <CardContent className="p-3 text-center">
              <div className="text-xl font-bold text-blue-600">{stats.completed}</div>
              <div className="text-xs text-slate-600">На проверке</div>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all ${filter === 'verified' ? 'ring-2 ring-green-600' : ''}`}
            onClick={() => setFilter('verified')}
          >
            <CardContent className="p-3 text-center">
              <div className="text-xl font-bold text-green-600">{stats.verified}</div>
              <div className="text-xs text-slate-600">Выполнено</div>
            </CardContent>
          </Card>
        </div>

        {filteredTasks.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Icon name="CheckCircle2" size={48} className="mx-auto text-slate-400 mb-4" />
              <p className="text-slate-600">
                {filter === 'all' ? 'Нет задач' : 'Нет задач в этой категории'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task) => {
              const statusInfo = getStatusInfo(task.status);
              
              return (
                <Card key={task.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span className="text-xs font-medium text-slate-500">
                            Акт: {task.report_number}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(task.defect_severity)}`}>
                            {task.defect_severity || 'Не указано'}
                          </span>
                          <div className={`flex items-center gap-1 text-xs font-medium ${statusInfo.color}`}>
                            <Icon name={statusInfo.icon as any} size={14} />
                            {statusInfo.label}
                          </div>
                        </div>

                        <h3 className="font-semibold text-lg mb-2">
                          {task.defect_description}
                        </h3>

                        <div className="space-y-1 text-sm text-slate-600 mb-3">
                          {task.defect_location && (
                            <div className="flex items-center gap-2">
                              <Icon name="MapPin" size={14} className="flex-shrink-0" />
                              <span className="truncate">{task.defect_location}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Icon name="Building2" size={14} className="flex-shrink-0" />
                            <span className="truncate">{task.object_title}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Icon name="Wrench" size={14} className="flex-shrink-0" />
                            <span className="truncate">{task.work_title}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex md:flex-col gap-2">
                        <Button
                          onClick={() => navigate(`/defect-report/${task.report_id}`)}
                          className="flex-1 md:flex-none"
                        >
                          <Icon name="ExternalLink" size={16} className="mr-2" />
                          Открыть акт
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTasks;