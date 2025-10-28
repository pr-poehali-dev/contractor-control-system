import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthRedux } from '@/hooks/useAuthRedux';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/api/apiClient';
import { ENDPOINTS } from '@/api/endpoints';

interface Task {
  id: string;
  inspection_id: number;
  inspection_number: string;
  defect_description: string;
  defect_location?: string;
  defect_severity?: string;
  defect_deadline?: string;
  defect_responsible?: string;
  status: string;
  work_id: number;
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
  const [searchQuery, setSearchQuery] = useState('');

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
      const response = await apiClient.get(ENDPOINTS.USER.DATA);
      
      if (response.success && response.data) {
        const allTasks: Task[] = [];
        
        for (const obj of response.data.objects || []) {
          for (const work of obj.works || []) {
            if (work.contractor_id === user.id) {
              for (const inspection of work.inspections || []) {
                if (inspection.status === 'completed' && inspection.defects) {
                  try {
                    const defects = JSON.parse(inspection.defects);
                    if (Array.isArray(defects) && defects.length > 0) {
                      for (const defect of defects) {
                        allTasks.push({
                          id: defect.id || defect.tempId,
                          inspection_id: inspection.id,
                          inspection_number: inspection.inspection_number,
                          defect_description: defect.description,
                          defect_location: defect.location,
                          defect_severity: defect.severity,
                          defect_deadline: defect.deadline,
                          defect_responsible: defect.responsible,
                          status: defect.remediation_status || 'pending',
                          work_id: work.id,
                          work_title: work.title,
                          object_title: obj.title,
                          created_at: inspection.created_at
                        });
                      }
                    }
                  } catch (e) {
                    console.error('Failed to parse defects:', e);
                  }
                }
              }
            }
          }
        }
        
        setTasks(allTasks);
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
    const matchesFilter = filter === 'all' || task.status === filter;
    const matchesSearch = searchQuery === '' || 
      task.defect_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.inspection_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.object_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.work_title.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
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
      <div className="bg-white border-b border-slate-200 p-4">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Мои задачи</h1>
        
        <div className="space-y-3">
          <div className="relative">
            <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Поиск по задачам, актам, объектам..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11"
            />
          </div>

          <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
            <SelectTrigger className="w-full h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Всего ({stats.all})</SelectItem>
              <SelectItem value="pending">В работе ({stats.pending})</SelectItem>
              <SelectItem value="completed">На проверке ({stats.completed})</SelectItem>
              <SelectItem value="verified">Выполнено ({stats.verified})</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-4">

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
                            Проверка: {task.inspection_number}
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
                          onClick={() => navigate(`/inspection/${task.inspection_id}`)}
                          className="flex-1 md:flex-none"
                        >
                          <Icon name="ExternalLink" size={16} className="mr-2" />
                          Открыть проверку
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