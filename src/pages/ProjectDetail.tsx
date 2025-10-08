import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { userData } = useAuth();

  const projects = userData?.projects || [];
  const sites = userData?.sites || [];
  const works = userData?.works || [];
  const remarks = userData?.remarks || [];

  const project = projects.find(p => p.id === Number(projectId));
  
  if (!project) {
    return (
      <div className="p-8">
        <Button variant="ghost" onClick={() => navigate('/projects')}>
          <Icon name="ChevronLeft" size={20} className="mr-2" />
          К списку проектов
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
  const activeWorks = projectWorks.filter(w => w.status === 'active').length;
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
      defectsCount: 0,
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

  return (
    <div className="p-8">
      <Button 
        variant="ghost" 
        className="mb-6"
        onClick={() => navigate('/projects')}
      >
        <Icon name="ChevronLeft" size={20} className="mr-2" />
        К списку проектов
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">{project.title}</h1>
        <div className="flex items-center gap-4 text-slate-600 mb-4">
          <span className="flex items-center gap-2">
            <Icon name="Building" size={18} />
            {projectSites.length} объектов
          </span>
          <span className="flex items-center gap-2">
            <Icon name="Wrench" size={18} />
            {projectWorks.length} работ
          </span>
          <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
            {getStatusLabel(project.status)}
          </Badge>
        </div>
        {project.description && (
          <p className="text-slate-600">{project.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Общий прогресс</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[#2563EB]">{totalProgress}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Активных работ</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{activeWorks}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Завершено работ</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{completedWorks}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Открытых замечаний</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">
              {remarks.filter(r => r.status === 'open').length}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Объекты</h2>
        <Button onClick={() => navigate(`/projects/${projectId}/objects/create`)}>
          <Icon name="Plus" size={16} className="mr-2" />
          Добавить объект
        </Button>
      </div>

      {sitesWithStats.length === 0 ? (
        <Card className="p-12 text-center">
          <Icon name="Building" size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 mb-4">Нет объектов в проекте</p>
          <Button onClick={() => navigate(`/projects/${projectId}/objects/create`)}>
            <Icon name="Plus" size={16} className="mr-2" />
            Добавить первый объект
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sitesWithStats.map((site, index) => (
            <Card 
              key={site.id}
              className="cursor-pointer hover-scale animate-fade-in transition-shadow hover:shadow-lg"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => navigate(`/projects/${projectId}/objects/${site.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg font-bold text-slate-900">{site.title}</CardTitle>
                  <Badge variant={site.status === 'active' ? 'default' : 'secondary'}>
                    {getStatusLabel(site.status)}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 mt-2">{site.address}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Работ: {site.worksCount}</span>
                    <span className="font-semibold text-[#2563EB]">{site.totalProgress}%</span>
                  </div>
                  <Progress value={site.totalProgress} className="h-2" />
                  {site.defectsCount > 0 && (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <Icon name="AlertCircle" size={16} />
                      {site.defectsCount} замечаний
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
