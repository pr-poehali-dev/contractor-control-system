import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ViewMode = 'grid' | 'table';

interface ProjectsDesktopHeaderProps {
  stats: Array<{ label: string; value: number; icon: string; color: string }>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  projects: any[];
  onNavigateCreate: () => void;
}

export default function ProjectsDesktopHeader({
  stats,
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  selectedStatus,
  setSelectedStatus,
  projects,
  onNavigateCreate,
}: ProjectsDesktopHeaderProps) {
  return (
    <div className="hidden md:block bg-white border-b border-slate-200 p-6 md:p-8">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Реестр проектов</h1>
            <p className="text-lg text-slate-600">Управление строительными проектами</p>
          </div>
          <Button 
            size="lg" 
            onClick={onNavigateCreate}
            data-tour="create-project-btn"
          >
            <Icon name="Plus" size={20} className="mr-2" />
            Создать проект
          </Button>
        </div>

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

        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Icon name="Search" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Поиск по названию проекта..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-[180px] h-12">
              <SelectValue placeholder="Сортировка" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">По дате</SelectItem>
              <SelectItem value="name">По названию</SelectItem>
              <SelectItem value="progress">По прогрессу</SelectItem>
              <SelectItem value="objects">По объектам</SelectItem>
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
            Все ({projects.length})
          </Button>
          <Button
            variant={selectedStatus === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedStatus('active')}
          >
            Активные ({projects.filter(p => p.status === 'active').length})
          </Button>
          <Button
            variant={selectedStatus === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedStatus('pending')}
          >
            Планирование ({projects.filter(p => p.status === 'pending').length})
          </Button>
          <Button
            variant={selectedStatus === 'completed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedStatus('completed')}
          >
            Завершённые ({projects.filter(p => p.status === 'completed').length})
          </Button>
        </div>
      </div>
    </div>
  );
}
