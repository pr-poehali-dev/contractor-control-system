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

interface ProjectsTableViewProps {
  projects: Project[];
  userRole?: string;
  getStatusLabel: (status: string) => string;
  getStatusColor: (status: string) => string;
  onProjectClick: (projectId: number) => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (projectId: number) => Promise<void>;
}

export default function ProjectsTableView({
  projects,
  userRole,
  getStatusLabel,
  getStatusColor,
  onProjectClick,
  onEditProject,
  onDeleteProject,
}: ProjectsTableViewProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-slate-700">Проект</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-700">Статус</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-700">Прогресс</th>
                <th className="text-right p-4 text-sm font-semibold text-slate-700">Объекты</th>
                <th className="text-right p-4 text-sm font-semibold text-slate-700">Работы</th>
                <th className="text-right p-4 text-sm font-semibold text-slate-700">Действия</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr
                  key={project.id}
                  className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => onProjectClick(project.id)}
                >
                  <td className="p-4">
                    <p className="font-semibold text-slate-900">{project.title}</p>
                  </td>
                  <td className="p-4">
                    <Badge className={getStatusColor(project.status)}>
                      {getStatusLabel(project.status)}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-slate-100 rounded-full h-2 max-w-[120px]">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-slate-700 w-12">{project.progress}%</span>
                    </div>
                  </td>
                  <td className="p-4 text-right text-sm text-slate-700">
                    {project.objectsCount}
                  </td>
                  <td className="p-4 text-right">
                    <span className="text-sm text-slate-700">
                      {project.completedWorks}/{project.totalWorks}
                    </span>
                  </td>
                  <td className="p-4 text-right">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
