import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface Project {
  id: number;
  title: string;
  status: string;
  objectsCount: number;
  totalWorks: number;
  completedWorks: number;
}

interface ProjectsMobileListProps {
  projects: Project[];
  getStatusLabel: (status: string) => string;
  getStatusColor: (status: string) => string;
  onProjectClick: (projectId: number) => void;
}

export default function ProjectsMobileList({
  projects,
  getStatusLabel,
  getStatusColor,
  onProjectClick,
}: ProjectsMobileListProps) {
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center px-4">
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <Icon name="Folder" size={48} className="text-slate-300" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Проекты не найдены</h3>
        <p className="text-slate-600 mb-6">Попробуйте изменить параметры поиска</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100">
      {projects.map((project) => (
        <div
          key={project.id}
          className="p-4 active:bg-slate-50 transition-colors"
          onClick={() => onProjectClick(project.id)}
        >
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-16 h-16 bg-blue-100 rounded-lg overflow-hidden flex items-center justify-center">
              <Icon name="Folder" size={28} className="text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base text-slate-900 mb-1">{project.title}</h3>
              <p className="text-sm text-slate-500 mb-2">
                {project.objectsCount} {project.objectsCount === 1 ? 'объект' : 'объекта'}
              </p>
              <div className="flex items-center gap-2 text-xs">
                <Badge className={getStatusColor(project.status)}>
                  {getStatusLabel(project.status)}
                </Badge>
                <span className="text-slate-400">{project.completedWorks}/{project.totalWorks}</span>
              </div>
            </div>
            <div className="flex-shrink-0 text-right">
              <div className="text-xs text-slate-400 mb-1">2 дня назад</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
