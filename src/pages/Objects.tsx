import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import ObjectsMobileHeader from '@/components/objects/ObjectsMobileHeader';
import ObjectsDesktopHeader from '@/components/objects/ObjectsDesktopHeader';
import ObjectsMobileList from '@/components/objects/ObjectsMobileList';
import ObjectsGridView from '@/components/objects/ObjectsGridView';
import ObjectsTableView from '@/components/objects/ObjectsTableView';
import ObjectsEmptyState from '@/components/objects/ObjectsEmptyState';

type ViewMode = 'grid' | 'table';

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

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedStatus('all');
    setSelectedProject('all');
  };

  return (
    <div className="h-full flex flex-col bg-slate-50">
      <ObjectsMobileHeader
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
        sortBy={sortBy}
        setSortBy={setSortBy}
        projects={projects}
        onNavigateProfile={() => navigate('/profile')}
      />

      <ObjectsDesktopHeader
        stats={stats}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortBy={sortBy}
        setSortBy={setSortBy}
        viewMode={viewMode}
        setViewMode={setViewMode}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
        projects={projects}
        sites={sites}
        isContractor={isContractor}
        onNavigateProjects={() => navigate('/projects')}
      />

      <div className="md:hidden flex-1 overflow-y-auto pb-20 bg-white">
        <ObjectsMobileList
          sites={filteredSites}
          onSiteClick={handleSiteClick}
        />
      </div>

      <div className="hidden md:block flex-1 overflow-y-auto p-6 md:p-8 pb-24 md:pb-8">
        <div className="max-w-[1600px] mx-auto">
          {filteredSites.length === 0 ? (
            <ObjectsEmptyState
              onResetFilters={handleResetFilters}
            />
          ) : viewMode === 'grid' ? (
            <ObjectsGridView
              sites={filteredSites}
              userRole={user?.role}
              onSiteClick={handleSiteClick}
              onDeleteObject={handleDeleteObject}
            />
          ) : (
            <ObjectsTableView
              sites={filteredSites}
              userRole={user?.role}
              onSiteClick={handleSiteClick}
              onDeleteObject={handleDeleteObject}
            />
          )}
        </div>
      </div>
    </div>
  );
}
