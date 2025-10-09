import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import EditProjectDialog from '@/components/EditProjectDialog';

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user, token, userData, setUserData } = useAuth();
  const { toast } = useToast();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const projects = userData?.projects || [];
  const sites = userData?.sites || [];
  const works = userData?.works || [];

  const project = projects.find(p => p.id === Number(projectId));
  
  if (!project) {
    return (
      <div className="p-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/projects')}>
          <Icon name="ChevronLeft" size={20} className="mr-2" />
          Назад
        </Button>
        <div className="mt-8 text-center">
          <p className="text-slate-500">Проект не найден</p>
        </div>
      </div>
    );
  }

  const projectSites = sites.filter(s => s.project_id === project.id);
  const projectWorks = works.filter(w => 
    projectSites.some(s => s.id === w.object_id)
  );
  const completedWorks = projectWorks.filter(w => w.status === 'completed').length;
  const totalProgress = projectWorks.length > 0 
    ? Math.round((completedWorks / projectWorks.length) * 100)
    : 0;

  const sitesWithStats = projectSites.map(site => {
    const siteWorks = works.filter(w => w.object_id === site.id);
    const siteCompleted = siteWorks.filter(w => w.status === 'completed').length;
    const siteProgress = siteWorks.length > 0 
      ? Math.round((siteCompleted / siteWorks.length) * 100)
      : 0;

    return {
      ...site,
      worksCount: siteWorks.length,
      totalProgress: siteProgress,
    };
  });

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Активен';
      case 'pending': return 'Планирование';
      case 'completed': return 'Завершён';
      default: return status;
    }
  };

  const handleDelete = async () => {
    if (!confirm('Удалить проект? Это действие нельзя отменить.')) return;
    try {
      await api.deleteItem(token!, 'project', project.id);
      if (token) {
        const refreshed = await api.getUserData(token);
        setUserData(refreshed);
      }
      toast({ title: 'Проект удалён' });
      navigate('/projects');
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
      {/* Мобильный хедер */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/projects')}>
            <Icon name="ChevronLeft" size={20} />
          </Button>
          
          {user?.role === 'client' && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowActions(!showActions)}
            >
              <Icon name="MoreVertical" size={20} />
            </Button>
          )}
        </div>

        <h1 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">{project.title}</h1>
        
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
          <span className="flex items-center gap-1">
            <Icon name="Building" size={16} />
            {projectSites.length}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Icon name="Wrench" size={16} />
            {projectWorks.length}
          </span>
          <Badge variant={project.status === 'active' ? 'default' : 'secondary'} className="text-xs">
            {getStatusLabel(project.status)}
          </Badge>
        </div>

        {project.description && (
          <p className="text-sm text-slate-600 mt-2 line-clamp-2">{project.description}</p>
        )}

        {/* Действия */}
        {showActions && (
          <div className="mt-3 flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={() => setEditDialogOpen(true)}>
              <Icon name="Edit" size={16} className="mr-1" />
              Изменить
            </Button>
            <Button variant="outline" size="sm" className="flex-1" onClick={handleDelete}>
              <Icon name="Trash2" size={16} className="mr-1" />
              Удалить
            </Button>
          </div>
        )}
      </div>

      {/* Компактная статистика */}
      <div className="px-4 py-3 bg-white border-b border-slate-200">
        <div className="flex items-center justify-around text-center">
          <div className="flex-1">
            <p className="text-xl md:text-2xl font-bold text-slate-900">{totalProgress}%</p>
            <p className="text-xs text-slate-600">Прогресс</p>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div className="flex-1">
            <p className="text-xl md:text-2xl font-bold text-blue-600">
              {projectWorks.filter(w => w.status === 'active').length}
            </p>
            <p className="text-xs text-slate-600">В работе</p>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div className="flex-1">
            <p className="text-xl md:text-2xl font-bold text-green-600">
              {completedWorks}
            </p>
            <p className="text-xs text-slate-600">Готово</p>
          </div>
        </div>
      </div>

      {/* Список объектов */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Объекты ({projectSites.length})</h2>
          <Button 
            size="sm"
            onClick={() => navigate(`/projects/${projectId}/objects/create`)}
          >
            <Icon name="Plus" size={16} className="mr-1" />
            <span className="hidden sm:inline">Добавить</span>
          </Button>
        </div>

        {sitesWithStats.length === 0 ? (
          <Card className="p-8 text-center">
            <Icon name="Building2" size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 mb-4">Объектов пока нет</p>
            <Button onClick={() => navigate(`/projects/${projectId}/objects/create`)}>
              <Icon name="Plus" size={18} className="mr-2" />
              Создать первый объект
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {sitesWithStats.map((site) => (
              <Card 
                key={site.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/projects/${projectId}/objects/${site.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0 mr-3">
                      <h3 className="font-semibold text-base mb-1">{site.title}</h3>
                      <p className="text-sm text-slate-600 truncate flex items-center gap-1">
                        <Icon name="MapPin" size={14} />
                        {site.address}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs flex-shrink-0">
                      {site.worksCount} работ
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Прогресс</span>
                      <span className="font-semibold">{site.totalProgress}%</span>
                    </div>
                    <Progress value={site.totalProgress} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {editDialogOpen && (
        <EditProjectDialog
          project={project}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSuccess={() => {}}
        />
      )}
    </div>
  );
};

export default ProjectDetail;