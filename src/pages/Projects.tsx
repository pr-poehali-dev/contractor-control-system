import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

type ProjectStatus = 'active' | 'planning' | 'completed';

interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  objectsCount: number;
  totalWorks: number;
  progress: number;
}

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Капремонт Казани 2025',
    status: 'active',
    objectsCount: 12,
    totalWorks: 48,
    progress: 67,
  },
  {
    id: '2',
    name: 'Благоустройство дворов',
    status: 'active',
    objectsCount: 8,
    totalWorks: 24,
    progress: 34,
  },
  {
    id: '3',
    name: 'Реконструкция школ',
    status: 'planning',
    objectsCount: 5,
    totalWorks: 35,
    progress: 12,
  },
];

const Projects = () => {
  const navigate = useNavigate();

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-slate-900">Проекты</h1>
          <Button>
            <Icon name="Plus" size={20} className="mr-2" />
            Создать проект
          </Button>
        </div>
        <p className="text-slate-600">Управление всеми строительными проектами</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockProjects.map((project, index) => (
          <Card 
            key={project.id} 
            className="cursor-pointer hover-scale animate-fade-in transition-shadow hover:shadow-lg"
            style={{ animationDelay: `${index * 0.1}s` }}
            onClick={() => navigate(`/projects/${project.id}`)}
          >
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <CardTitle className="text-lg font-bold text-slate-900">{project.name}</CardTitle>
                <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                  {project.status === 'active' ? 'Активен' : project.status === 'planning' ? 'Планирование' : 'Завершён'}
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
    </div>
  );
};

export default Projects;
