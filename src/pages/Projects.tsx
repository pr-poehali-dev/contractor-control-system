import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { useToast } from '@/hooks/use-toast';
import EditProjectDialog from '@/components/EditProjectDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type ViewMode = 'grid' | 'table';

const Projects = () => {
  const navigate = useNavigate();
  const { user, token, userData, setUserData } = useAuth();
  const { toast } = useToast();
  const [editProject, setEditProject] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<string>('date');

  useEffect(() => {
    if (user?.role === 'contractor') {
      navigate('/objects');
    }
  }, [user, navigate]);

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
      completedWorks,
      progress,
    };
  });

  let filteredProjects = projectsWithStats.filter((project) => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || project.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  if (sortBy === 'name') {
    filteredProjects = [...filteredProjects].sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortBy === 'progress') {
    filteredProjects = [...filteredProjects].sort((a, b) => b.progress - a.progress);
  } else if (sortBy === 'objects') {
    filteredProjects = [...filteredProjects].sort((a, b) => b.objectsCount - a.objectsCount);
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Активен';
      case 'pending': return 'Планирование';
      case 'completed': return 'Завершён';
      case 'archived': return 'В архиве';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      case 'archived': return 'bg-slate-100 text-slate-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const stats = [
    { label: 'Всего проектов', value: projects.length, icon: 'Folder', color: 'bg-blue-100 text-[#2563EB]' },
    { label: 'Активные', value: projects.filter(p => p.status === 'active').length, icon: 'PlayCircle', color: 'bg-green-100 text-green-600' },
    { label: 'В планировании', value: projects.filter(p => p.status === 'pending').length, icon: 'Clock', color: 'bg-yellow-100 text-yellow-600' },
    { label: 'Завершённые', value: projects.filter(p => p.status === 'completed').length, icon: 'CheckCircle2', color: 'bg-slate-100 text-slate-600' },
  ];

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* MOBILE: Simplified header */}
      <div className="md:hidden bg-white border-b border-slate-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">Проекты</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={() => navigate('/profile')}>
            <Icon name="User" size={24} />
          </Button>
        </div>
        
        {/* Mobile filters */}
        <div className="space-y-2">
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-full h-11">
              <SelectValue placeholder="Все проекты" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все проекты</SelectItem>
              <SelectItem value="active">Активные</SelectItem>
              <SelectItem value="pending">В планировании</SelectItem>
              <SelectItem value="completed">Завершённые</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full h-11">
              <SelectValue placeholder="По дате" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">По дате</SelectItem>
              <SelectItem value="name">По названию</SelectItem>
              <SelectItem value="progress">По прогрессу</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* DESKTOP: Original header */}
      <div className="hidden md:block bg-white border-b border-slate-200 p-6 md:p-8">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Реестр проектов</h1>
              <p className="text-lg text-slate-600">Управление строительными проектами</p>
            </div>
            <Button 
              size="lg" 
              onClick={() => navigate('/projects/create')}
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

      {/* MOBILE: List view */}
      <div className="md:hidden flex-1 overflow-y-auto pb-20 bg-white">
        {filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-center px-4">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Icon name="Folder" size={48} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Проекты не найдены</h3>
            <p className="text-slate-600 mb-6">Попробуйте изменить параметры поиска</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="p-4 active:bg-slate-50 transition-colors"
                onClick={() => navigate(`/projects/${project.id}`)}
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
        )}
      </div>

      {/* DESKTOP: Original grid/table view */}
      <div className="hidden md:block flex-1 overflow-y-auto p-6 md:p-8 pb-24 md:pb-8">
        <div className="max-w-[1600px] mx-auto">
          {filteredProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96 text-center">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Icon name="Folder" size={48} className="text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {projects.length === 0 ? 'Нет проектов' : 'Проекты не найдены'}
              </h3>
              <p className="text-slate-600 mb-6">
                {projects.length === 0 
                  ? 'Создайте первый проект для начала работы' 
                  : 'Попробуйте изменить параметры поиска'}
              </p>
              <Button onClick={() => {
                if (projects.length === 0) {
                  navigate('/projects/create');
                } else {
                  setSearchQuery('');
                  setSelectedStatus('all');
                }
              }}>
                {projects.length === 0 ? (
                  <>
                    <Icon name="Plus" size={16} className="mr-2" />
                    Создать первый проект
                  </>
                ) : (
                  'Сбросить фильтры'
                )}
              </Button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project, index) => (
                <Card 
                  key={project.id} 
                  className="cursor-pointer hover:shadow-xl transition-all animate-fade-in border-2 border-transparent hover:border-blue-200 group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => navigate(`/projects/${project.id}`)}
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
                        {(user?.role === 'client' || user?.role === 'admin') && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Icon name="MoreVertical" size={16} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                setEditProject(project);
                              }}>
                                <Icon name="Edit" size={16} className="mr-2" />
                                Изменить
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  if (!confirm('Удалить проект?')) return;
                                  try {
                                    await api.deleteItem(token!, 'project', project.id);
                                    if (token) {
                                      const refreshed = await api.getUserData(token);
                                      setUserData(refreshed);
                                    }
                                    toast({ title: 'Проект удалён' });
                                  } catch (error) {
                                    toast({ 
                                      title: 'Ошибка', 
                                      description: 'Не удалось удалить',
                                      variant: 'destructive'
                                    });
                                  }
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
          ) : (
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
                      {filteredProjects.map((project) => (
                        <tr
                          key={project.id}
                          className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                          onClick={() => navigate(`/projects/${project.id}`)}
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
                            {(user?.role === 'client' || user?.role === 'admin') && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <Icon name="MoreVertical" size={16} />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={(e) => {
                                    e.stopPropagation();
                                    setEditProject(project);
                                  }}>
                                    <Icon name="Edit" size={16} className="mr-2" />
                                    Изменить
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      if (!confirm('Удалить проект?')) return;
                                      try {
                                        await api.deleteItem(token!, 'project', project.id);
                                        if (token) {
                                          const refreshed = await api.getUserData(token);
                                          setUserData(refreshed);
                                        }
                                        toast({ title: 'Проект удалён' });
                                      } catch (error) {
                                        toast({ 
                                          title: 'Ошибка', 
                                          description: 'Не удалось удалить',
                                          variant: 'destructive'
                                        });
                                      }
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
          )}
        </div>
      </div>

      {editProject && (
        <EditProjectDialog
          project={editProject}
          open={!!editProject}
          onOpenChange={(open) => !open && setEditProject(null)}
          onSuccess={() => setEditProject(null)}
        />
      )}
    </div>
  );
};

export default Projects;