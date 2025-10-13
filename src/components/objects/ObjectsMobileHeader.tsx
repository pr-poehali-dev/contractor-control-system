import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Icon from '@/components/ui/icon';

interface Project {
  id: number;
  title: string;
}

interface ObjectsMobileHeaderProps {
  selectedProject: string;
  setSelectedProject: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  projects: Project[];
  onNavigateProfile: () => void;
}

export default function ObjectsMobileHeader({
  selectedProject,
  setSelectedProject,
  sortBy,
  setSortBy,
  projects,
  onNavigateProfile,
}: ObjectsMobileHeaderProps) {
  return (
    <div className="md:hidden bg-white border-b border-slate-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900">Главная</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={onNavigateProfile}>
          <Icon name="User" size={24} />
        </Button>
      </div>
      
      <div className="space-y-2">
        <Select value={selectedProject} onValueChange={setSelectedProject}>
          <SelectTrigger className="w-full h-11">
            <SelectValue placeholder="Все объекты" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все объекты</SelectItem>
            {projects.map(project => (
              <SelectItem key={project.id} value={String(project.id)}>
                {project.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full h-11">
            <SelectValue placeholder="По дате" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">По дате</SelectItem>
            <SelectItem value="name">По названию</SelectItem>
            <SelectItem value="progress">По приоритету</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
