import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const Projects = () => {
  const navigate = useNavigate();
  const { userData } = useAuth();

  const projects = userData?.projects || [];
  const sites = userData?.sites || [];
  const works = userData?.works || [];

  const projectsWithStats = projects.map(project => {
    const projectSites = sites.filter(s => s.project_id === project.id);
    const projectWorks = works.filter(w => 
      projectSites.some(s => s.id === w.object_id)
    );
    const completedWorks = projectWorks.filter(w => w.status === 'completed').length;
    const progress = projectWorks.length > 0 
      ? Math.round((completedWorks / projectWorks.length) * 100)
      : 0;

    return {
      ...project,
      objectsCount: projectSites.length,
      totalWorks: projectWorks.length,
      progress,
    };
  });

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Активен';
      case 'pending': return 'Планирование';
      case 'completed': return 'Завершён';
      case 'archived': return 'В архиве';
      default: return status;
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-slate-900">Проекты</h1>
          <Button onClick={() => navigate('/projects/create')}>
            <Icon name="Plus" size={20} className="mr-2" />
            Создать проект
          </Button>
        </div>
        <p className="text-slate-600">Управление всеми строительными проектами</p>
      </div>

      {projects.length === 0 ? (
        <Card className="p-12 text-center">
          <Icon name="Folder" size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 mb-4">Нет проектов</p>
          <Button onClick={() => navigate('/projects/create')}>
            <Icon name="Plus" size={16} className="mr-2" />
            Создать первый проект
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projectsWithStats.map((project, index) => (
            <Card 
              key={project.id} 
              className="cursor-pointer hover-scale animate-fade-in transition-shadow hover:shadow-lg"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-lg font-bold text-slate-900">{project.title}</CardTitle>
                  <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                    {getStatusLabel(project.status)}
                  </Badge>
                </div>
                <CardDescription>
                  <div className="flex items-center gap-4 text-sm mt-3">
                    <span className="flex items-center gap-1">
                      <Icon name="Building" size={16} />
                      {project.objectsCount} объектов
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon name="Wrench" size={16} />
                      {project.totalWorks} работ
                    </span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Прогресс</span>
                    <span className="font-semibold text-[#2563EB]">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Projects;
