import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface ProjectsEmptyStateProps {
  hasProjects: boolean;
  onCreateProject: () => void;
  onResetFilters: () => void;
}

export default function ProjectsEmptyState({
  hasProjects,
  onCreateProject,
  onResetFilters,
}: ProjectsEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-96 text-center">
      <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
        <Icon name="Folder" size={48} className="text-slate-300" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">
        {hasProjects ? 'Проекты не найдены' : 'Нет проектов'}
      </h3>
      <p className="text-slate-600 mb-6">
        {hasProjects 
          ? 'Попробуйте изменить параметры поиска' 
          : 'Создайте первый проект для начала работы'}
      </p>
      <Button onClick={hasProjects ? onResetFilters : onCreateProject}>
        {hasProjects ? (
          'Сбросить фильтры'
        ) : (
          <>
            <Icon name="Plus" size={16} className="mr-2" />
            Создать первый проект
          </>
        )}
      </Button>
    </div>
  );
}
