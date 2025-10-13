import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

interface Site {
  id: number;
  status: string;
}

interface Stat {
  label: string;
  value: number;
  icon: string;
  color: string;
}

interface ObjectsDesktopHeaderProps {
  stats: Stat[];
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  viewMode: 'grid' | 'table';
  setViewMode: (mode: 'grid' | 'table') => void;
  selectedStatus: string;
  setSelectedStatus: (value: string) => void;
  selectedProject: string;
  setSelectedProject: (value: string) => void;
  projects: Project[];
  sites: Site[];
  isContractor: boolean;
  onNavigateProjects: () => void;
}

export default function ObjectsDesktopHeader({
  stats,
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  selectedStatus,
  setSelectedStatus,
  selectedProject,
  setSelectedProject,
  projects,
  sites,
  isContractor,
  onNavigateProjects,
}: ObjectsDesktopHeaderProps) {
  return (
    <div className="hidden md:block bg-white border-b border-slate-200 p-6 md:p-8">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Реестр объектов</h1>
            <p className="text-lg text-slate-600">Управление строительными объектами</p>
          </div>
          {!isContractor && (
            <Button size="lg" onClick={onNavigateProjects}>
              <Icon name="Plus" size={20} className="mr-2" />
              Добавить объект
            </Button>
          )}
        </div>

        {!isContractor && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {stats.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-4">
                  <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center mb-3`}>
                    <Icon name={stat.icon as any} size={20} />
                  </div>
                  <p className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</p>
                  <p className="text-sm text-slate-600">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Icon name="Search" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Поиск по названию, адресу, проекту..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>
          
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-full md:w-[200px] h-12">
              <SelectValue placeholder="Все проекты" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все проекты</SelectItem>
              {projects.map(project => (
                <SelectItem key={project.id} value={String(project.id)}>
                  {project.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-[180px] h-12">
              <SelectValue placeholder="Сортировка" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">По дате</SelectItem>
              <SelectItem value="name">По названию</SelectItem>
              <SelectItem value="progress">По прогрессу</SelectItem>
              <SelectItem value="works">По работам</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              className="h-12 w-12"
              onClick={() => setViewMode('grid')}
            >
              <Icon name="LayoutGrid" size={20} />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="icon"
              className="h-12 w-12"
              onClick={() => setViewMode('table')}
            >
              <Icon name="List" size={20} />
            </Button>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button
            variant={selectedStatus === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedStatus('all')}
          >
            Все ({sites.length})
          </Button>
          <Button
            variant={selectedStatus === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedStatus('active')}
          >
            В работе ({sites.filter(s => s.status === 'active').length})
          </Button>
          <Button
            variant={selectedStatus === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedStatus('pending')}
          >
            Ожидание ({sites.filter(s => s.status === 'pending').length})
          </Button>
          <Button
            variant={selectedStatus === 'completed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedStatus('completed')}
          >
            Завершено ({sites.filter(s => s.status === 'completed').length})
          </Button>
        </div>
      </div>
    </div>
  );
}
