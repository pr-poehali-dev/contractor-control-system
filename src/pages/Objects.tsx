import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Icon from '@/components/ui/icon';

type ViewMode = 'grid' | 'table';

const statusEmoji = {
  active: '🟢',
  pending: '🟡',
  completed: '✅',
};

const statusLabels = {
  active: 'В работе',
  pending: 'Ожидание',
  completed: 'Завершено',
};

export default function Objects() {
  const navigate = useNavigate();
  const { user, token, userData, setUserData } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<string>('date');
  const isContractor = user?.role === 'contractor';

  const handleDeleteObject = async (objectId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Удалить объект? Это действие нельзя отменить.')) return;
    try {
      await api.deleteItem(token!, 'object', objectId);
      if (token) {
        const refreshed = await api.getUserData(token);
        setUserData(refreshed);
      }
      toast({ title: 'Объект удалён' });
    } catch (error) {
      toast({ 
        title: 'Ошибка', 
        description: 'Не удалось удалить',
        variant: 'destructive'
      });
    }
  };

  const sites = userData?.sites || [];
  const works = userData?.works || [];
  const projects = userData?.projects || [];

  const siteData = sites.map(site => {
    const project = projects.find(p => p.id === site.project_id);
    const siteWorks = works.filter(w => w.object_id === site.id);
    const completedWorks = siteWorks.filter(w => w.status === 'completed').length;
    const progress = siteWorks.length > 0 
      ? Math.round((completedWorks / siteWorks.length) * 100)
      : 0;
    
    return {
      ...site,
      projectName: project?.title || '',
      worksCount: siteWorks.length,
      works: siteWorks,
      progress,
      completedWorks,
    };
  });

  let filteredSites = siteData.filter((site) => {
    const matchesSearch = site.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.projectName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || site.status === selectedStatus;
    const matchesProject = selectedProject === 'all' || String(site.project_id) === selectedProject;
    return matchesSearch && matchesStatus && matchesProject;
  });

  if (sortBy === 'name') {
    filteredSites = [...filteredSites].sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortBy === 'progress') {
    filteredSites = [...filteredSites].sort((a, b) => b.progress - a.progress);
  } else if (sortBy === 'works') {
    filteredSites = [...filteredSites].sort((a, b) => b.worksCount - a.worksCount);
  }

  const handleSiteClick = (site: typeof siteData[0]) => {
    navigate(`/projects/${site.project_id}/objects/${site.id}`);
  };

  const stats = [
    { label: 'Всего объектов', value: sites.length, icon: 'Building2', color: 'bg-blue-100 text-[#2563EB]' },
    { label: 'В работе', value: sites.filter(s => s.status === 'active').length, icon: 'PlayCircle', color: 'bg-green-100 text-green-600' },
    { label: 'Ожидание', value: sites.filter(s => s.status === 'pending').length, icon: 'Clock', color: 'bg-yellow-100 text-yellow-600' },
    { label: 'Завершено', value: sites.filter(s => s.status === 'completed').length, icon: 'CheckCircle2', color: 'bg-slate-100 text-slate-600' },
  ];

  return (
    <div className="h-full flex flex-col bg-slate-50">
      <div className="bg-white border-b border-slate-200 p-6 md:p-8">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Реестр объектов</h1>
              <p className="text-lg text-slate-600">Управление строительными объектами</p>
            </div>
            {!isContractor && (
              <Button size="lg" onClick={() => navigate('/projects')}>
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

      <div className="flex-1 overflow-y-auto p-6 md:p-8 pb-24 md:pb-8">
        <div className="max-w-[1600px] mx-auto">
          {filteredSites.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96 text-center">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Icon name="Building2" size={48} className="text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Объекты не найдены</h3>
              <p className="text-slate-600 mb-6">Попробуйте изменить параметры поиска</p>
              <Button onClick={() => {
                setSearchQuery('');
                setSelectedStatus('all');
                setSelectedProject('all');
              }}>
                Сбросить фильтры
              </Button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSites.map((site, index) => (
                <Card
                  key={site.id}
                  className="cursor-pointer hover:shadow-xl transition-all animate-fade-in group border-2 border-transparent hover:border-blue-200"
                  style={{ animationDelay: `${index * 0.05}s` }}
                  onClick={() => handleSiteClick(site)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-2 mb-4">
                      <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition-colors flex-1">
                        {site.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Badge className={
                          site.status === 'active' ? 'bg-green-100 text-green-700' :
                          site.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-slate-100 text-slate-700'
                        }>
                          {statusLabels[site.status]}
                        </Badge>
                        {(user?.role === 'client' || user?.role === 'admin') && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Icon name="MoreVertical" size={16} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={(e) => handleDeleteObject(site.id, e)}
                              >
                                <Icon name="Trash2" size={16} className="mr-2" />
                                Удалить
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                      <Icon name="MapPin" size={16} />
                      <span className="truncate">{site.address}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                      <Icon name="Folder" size={16} />
                      <span className="truncate">{site.projectName}</span>
                    </div>

                    {user?.role === 'client' && site.works[0]?.contractor_name && (
                      <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                        <Icon name="User" size={16} />
                        <span>{site.works[0].contractor_name}</span>
                      </div>
                    )}

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Прогресс</span>
                        <span className="font-bold text-blue-600">{site.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${site.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-slate-600 pt-4 border-t border-slate-100">
                      <span className="flex items-center gap-1.5">
                        <Icon name="Wrench" size={16} />
                        {site.worksCount} работ
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Icon name="CheckCircle2" size={16} />
                        {site.completedWorks} завершено
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
                        <th className="text-left p-4 text-sm font-semibold text-slate-700">Объект</th>
                        <th className="text-left p-4 text-sm font-semibold text-slate-700">Адрес</th>
                        <th className="text-left p-4 text-sm font-semibold text-slate-700">Проект</th>
                        <th className="text-left p-4 text-sm font-semibold text-slate-700">Статус</th>
                        <th className="text-left p-4 text-sm font-semibold text-slate-700">Прогресс</th>
                        <th className="text-right p-4 text-sm font-semibold text-slate-700">Работы</th>
                        {(user?.role === 'client' || user?.role === 'admin') && (
                          <th className="text-right p-4 text-sm font-semibold text-slate-700">Действия</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSites.map((site) => (
                        <tr
                          key={site.id}
                          className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                          onClick={() => handleSiteClick(site)}
                        >
                          <td className="p-4">
                            <p className="font-semibold text-slate-900">{site.title}</p>
                          </td>
                          <td className="p-4 text-sm text-slate-600">{site.address}</td>
                          <td className="p-4 text-sm text-slate-600">{site.projectName}</td>
                          <td className="p-4">
                            <Badge className={
                              site.status === 'active' ? 'bg-green-100 text-green-700' :
                              site.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-slate-100 text-slate-700'
                            }>
                              {statusLabels[site.status]}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 bg-slate-100 rounded-full h-2 max-w-[100px]">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${site.progress}%` }}
                                />
                              </div>
                              <span className="text-sm font-semibold text-slate-700 w-12">{site.progress}%</span>
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <span className="text-sm text-slate-700">
                              {site.completedWorks}/{site.worksCount}
                            </span>
                          </td>
                          {(user?.role === 'client' || user?.role === 'admin') && (
                            <td className="p-4 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <Icon name="MoreVertical" size={16} />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={(e) => handleDeleteObject(site.id, e)}
                                  >
                                    <Icon name="Trash2" size={16} className="mr-2" />
                                    Удалить
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          )}
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
    </div>
  );
}