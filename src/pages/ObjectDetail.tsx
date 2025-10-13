import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ObjectDetail = () => {
  const { projectId, objectId } = useParams();
  const navigate = useNavigate();
  const { user, token, userData, setUserData } = useAuth();
  const { toast } = useToast();
  const [showActions, setShowActions] = useState(false);
  const [sortBy, setSortBy] = useState<string>('priority');

  const sites = userData?.sites || [];
  const works = userData?.works || [];
  const projects = userData?.projects || [];

  const site = sites.find(s => s.id === Number(objectId));
  const project = projects.find(p => p.id === Number(projectId));
  let siteWorks = works.filter(w => w.object_id === Number(objectId));

  if (sortBy === 'priority') {
    siteWorks = [...siteWorks].sort((a, b) => {
      const priorityOrder = { pending: 0, active: 1, completed: 2, on_hold: 3 };
      return (priorityOrder[a.status] || 99) - (priorityOrder[b.status] || 99);
    });
  } else if (sortBy === 'name') {
    siteWorks = [...siteWorks].sort((a, b) => a.title.localeCompare(b.title));
  }

  useEffect(() => {
    if (siteWorks.length > 0) {
      navigate(`/projects/${projectId}/objects/${objectId}/works/${siteWorks[0].id}`, { replace: true });
    }
  }, [siteWorks.length, projectId, objectId, navigate]);

  if (!site) {
    return (
      <div className="min-h-screen bg-slate-50 p-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/projects/${projectId}`)}>
          <Icon name="ChevronLeft" size={20} className="mr-2" />
          Назад
        </Button>
        <div className="mt-8 text-center">
          <p className="text-slate-500">Объект не найден</p>
        </div>
      </div>
    );
  }

  const handleEdit = () => {
    toast({ title: 'Редактирование объекта', description: 'Функция в разработке' });
  };

  const handleDelete = async () => {
    if (!confirm('Удалить объект? Это действие нельзя отменить.')) return;
    if (!user) return;
    
    try {
      await api.deleteItem(token!, 'object', site.id);
      if (token) {
        const refreshed = await api.getUserData(token);
        setUserData(refreshed);
      }
      toast({ title: 'Объект удалён' });
      navigate(`/projects/${projectId}`);
    } catch (error) {
      toast({ 
        title: 'Ошибка', 
        description: error instanceof Error ? error.message : 'Не удалось удалить',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* MOBILE: Compact header */}
      <div className="md:hidden sticky top-0 z-10 bg-white border-b border-slate-200 p-4">
        <div className="flex items-center gap-3 mb-3">
          <Button 
            variant="ghost" 
            size="icon"
            className="flex-shrink-0"
            onClick={() => navigate('/objects')}
          >
            <Icon name="ChevronLeft" size={24} />
          </Button>
          
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
              <Icon name="Building2" size={24} className="text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-slate-900 truncate">{site.title}</h1>
            </div>
          </div>

          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowActions(!showActions)}
          >
            <Icon name="Settings" size={20} />
          </Button>
        </div>

        {showActions && (
          <div className="mt-4 flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={handleEdit}>
              <Icon name="Edit" size={18} className="mr-1" />
              Изменить
            </Button>
            <Button variant="outline" size="sm" className="flex-1" onClick={handleDelete}>
              <Icon name="Trash2" size={16} className="mr-1" />
              Удалить
            </Button>
          </div>
        )}

        {/* Mobile filters */}
        <div className="mt-3 space-y-2">
          <Select value="all" onValueChange={() => {}}>
            <SelectTrigger className="w-full h-10">
              <SelectValue placeholder="Все журналы" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все журналы</SelectItem>
              <SelectItem value="active">В работе</SelectItem>
              <SelectItem value="completed">Завершено</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full h-10">
              <SelectValue placeholder="По приоритету" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="priority">По приоритету</SelectItem>
              <SelectItem value="name">По названию</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* DESKTOP: Original header */}
      <div className="hidden md:block sticky top-0 z-10 bg-white border-b border-slate-200 px-4 md:px-6 py-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <Button 
              variant="ghost" 
              size="icon"
              className="flex-shrink-0 mt-0.5"
              onClick={() => navigate(`/projects/${projectId}`)}
            >
              <Icon name="ChevronLeft" size={24} />
            </Button>
            
            <div className="min-w-0 flex-1">
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 mb-1">{site.title}</h1>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Icon name="MapPin" size={16} />
                <span className="truncate">{site.address}</span>
              </div>
            </div>
          </div>
          
          {(user?.role === 'client' || user?.role === 'admin') && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShowActions(!showActions)}
            >
              <Icon name="MoreVertical" size={20} />
            </Button>
          )}
        </div>

        {showActions && (
          <div className="mt-4 flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={handleEdit}>
              <Icon name="Edit" size={18} className="mr-1" />
              Изменить
            </Button>
            <Button variant="outline" size="sm" className="flex-1" onClick={handleDelete}>
              <Icon name="Trash2" size={16} className="mr-1" />
              Удалить
            </Button>
          </div>
        )}
      </div>

      {/* MOBILE: Work list cards */}
      <div className="md:hidden pb-20">
        {siteWorks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 px-4">
            <Icon name="Briefcase" size={48} className="text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Пока нет работ
            </h3>
            <p className="text-sm text-slate-600 mb-6 text-center max-w-md">
              Создайте первую работу для этого объекта
            </p>
            <Button onClick={() => navigate(`/projects/${projectId}/objects/${objectId}/works/create`)}>
              <Icon name="Plus" size={18} className="mr-2" />
              Создать работу
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 bg-white">
            {siteWorks.map((work) => (
              <div
                key={work.id}
                className="p-4 active:bg-slate-50 transition-colors"
                onClick={() => navigate(`/projects/${projectId}/objects/${objectId}/works/${work.id}`)}
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Icon name="Wrench" size={20} className="text-slate-600" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-base text-slate-900">{work.title}</h3>
                    </div>
                    
                    <p className="text-sm text-slate-500 mb-2">
                      Работа окончена. Пробил Иванов А.С. запросил примерку.
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <Badge className={
                        work.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        work.status === 'active' ? 'bg-blue-100 text-blue-700' :
                        work.status === 'completed' ? 'bg-green-100 text-green-700' :
                        'bg-slate-100 text-slate-700'
                      }>
                        {work.status === 'pending' && 'Требуется проверка'}
                        {work.status === 'active' && 'В работе'}
                        {work.status === 'completed' && 'Завершено'}
                        {work.status === 'on_hold' && 'Приостановлено'}
                      </Badge>
                      <span className="text-xs text-slate-400">2 часа назад</span>
                    </div>
                  </div>

                  <div className="flex-shrink-0 flex items-center">
                    <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                      <span className="text-xs font-semibold text-slate-600">5</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DESKTOP: Original work cards */}
      <div className="hidden md:block p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Работы</h2>
            <p className="text-sm text-slate-500 mt-1">
              {site.title} • {siteWorks.length} {siteWorks.length === 1 ? 'работа' : siteWorks.length < 5 ? 'работы' : 'работ'}
            </p>
          </div>
          {siteWorks.length > 0 && (
            <Button onClick={() => navigate(`/projects/${projectId}/objects/${objectId}/works/create`)}>
              <Icon name="Plus" size={18} className="mr-2" />
              Добавить
            </Button>
          )}
        </div>

        {siteWorks.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Icon name="Briefcase" size={48} className="text-slate-300 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Пока нет работ
              </h3>
              <p className="text-sm text-slate-600 mb-6 text-center max-w-md">
                Создайте первую работу для этого объекта, чтобы начать отслеживать прогресс
              </p>
              <Button onClick={() => navigate(`/projects/${projectId}/objects/${objectId}/works/create`)}>
                <Icon name="Plus" size={18} className="mr-2" />
                Создать работу
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {siteWorks.map((work) => (
              <Card 
                key={work.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/projects/${projectId}/objects/${objectId}/works/${work.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{work.title}</CardTitle>
                    <Badge variant={work.status === 'completed' ? 'default' : 'secondary'}>
                      {work.status === 'active' && 'В работе'}
                      {work.status === 'pending' && 'Ожидание'}
                      {work.status === 'completed' && 'Завершено'}
                      {work.status === 'on_hold' && 'Приостановлено'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {work.description && (
                    <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                      {work.description}
                    </p>
                  )}
                  {work.contractor_name && (
                    <div className="flex items-center text-sm text-slate-500">
                      <Icon name="User" size={14} className="mr-1" />
                      {work.contractor_name}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Floating action button for mobile */}
      {siteWorks.length > 0 && (
        <div className="md:hidden fixed bottom-20 right-4 z-20">
          <Button
            size="lg"
            className="h-14 w-14 rounded-full shadow-lg"
            onClick={() => navigate(`/projects/${projectId}/objects/${objectId}/works/create`)}
          >
            <Icon name="Plus" size={24} />
          </Button>
        </div>
      )}
    </div>
  );
};

export default ObjectDetail;
