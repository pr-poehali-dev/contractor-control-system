import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Project {
  id: number;
  title: string;
  status: string;
  objectsCount: number;
  totalWorks: number;
  completedWorks: number;
  progress: number;
}

interface ProjectsGridViewProps {
  projects: Project[];
  userRole?: string;
  getStatusLabel: (status: string) => string;
  getStatusColor: (status: string) => string;
  onProjectClick: (projectId: number) => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (projectId: number) => Promise<void>;
}

export default function ProjectsGridView({
  projects,
  userRole,
  getStatusLabel,
  getStatusColor,
  onProjectClick,
  onEditProject,
  onDeleteProject,
}: ProjectsGridViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project, index) => (
        <Card 
          key={project.id} 
          className="cursor-pointer hover:shadow-xl transition-all animate-fade-in border-2 border-transparent hover:border-blue-200 group"
          style={{ animationDelay: `${index * 0.1}s` }}
          onClick={() => onProjectClick(project.id)}
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition-colors flex-1">
                {project.title}
              </h3>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(project.status)}>
                  {getStatusLabel(project.status)}
                </Badge>
                {(userRole === 'client' || userRole === 'admin') && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Icon name="MoreVertical" size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        onEditProject(project);
                      }}>
                        <Icon name="Edit" size={16} className="mr-2" />
                        Изменить
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (!confirm('Удалить проект?')) return;
                          await onDeleteProject(project.id);
                        }}
                      >
                        <Icon name="Trash2" size={16} className="mr-2" />
                        Удалить
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Прогресс</span>
                <span className="font-bold text-blue-600">{project.progress}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-slate-600 pt-4 border-t border-slate-100">
              <span className="flex items-center gap-1.5">
                <Icon name="Building" size={16} />
                {project.objectsCount} объектов
              </span>
              <span className="flex items-center gap-1.5">
                <Icon name="Wrench" size={16} />
                {project.totalWorks} работ
              </span>
              <span className="flex items-center gap-1.5">
                <Icon name="CheckCircle2" size={16} />
                {project.completedWorks}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
