import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import EditProjectDialog from '@/components/EditProjectDialog';
import ProjectsMobileHeader from '@/components/projects/ProjectsMobileHeader';
import ProjectsDesktopHeader from '@/components/projects/ProjectsDesktopHeader';
import ProjectsMobileList from '@/components/projects/ProjectsMobileList';
import ProjectsGridView from '@/components/projects/ProjectsGridView';
import ProjectsTableView from '@/components/projects/ProjectsTableView';
import ProjectsEmptyState from '@/components/projects/ProjectsEmptyState';

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

  const handleDeleteProject = async (projectId: number) => {
    try {
      await api.deleteItem(token!, 'project', projectId);
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
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedStatus('all');
  };

  return (
    <div className="h-full flex flex-col bg-slate-50">
      <ProjectsMobileHeader
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        sortBy={sortBy}
        setSortBy={setSortBy}
        onNavigateProfile={() => navigate('/profile')}
      />

      <ProjectsDesktopHeader
        stats={stats}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortBy={sortBy}
        setSortBy={setSortBy}
        viewMode={viewMode}
        setViewMode={setViewMode}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        projects={projects}
        onNavigateCreate={() => navigate('/projects/create')}
      />

      <div className="md:hidden flex-1 overflow-y-auto pb-20 bg-white">
        <ProjectsMobileList
          projects={filteredProjects}
          getStatusLabel={getStatusLabel}
          getStatusColor={getStatusColor}
          onProjectClick={(id) => navigate(`/projects/${id}`)}
        />
      </div>

      <div className="hidden md:block flex-1 overflow-y-auto p-6 md:p-8 pb-24 md:pb-8">
        <div className="max-w-[1600px] mx-auto">
          {filteredProjects.length === 0 ? (
            <ProjectsEmptyState
              hasProjects={projects.length > 0}
              onCreateProject={() => navigate('/projects/create')}
              onResetFilters={handleResetFilters}
            />
          ) : viewMode === 'grid' ? (
            <ProjectsGridView
              projects={filteredProjects}
              userRole={user?.role}
              getStatusLabel={getStatusLabel}
              getStatusColor={getStatusColor}
              onProjectClick={(id) => navigate(`/projects/${id}`)}
              onEditProject={setEditProject}
              onDeleteProject={handleDeleteProject}
            />
          ) : (
            <ProjectsTableView
              projects={filteredProjects}
              userRole={user?.role}
              getStatusLabel={getStatusLabel}
              getStatusColor={getStatusColor}
              onProjectClick={(id) => navigate(`/projects/${id}`)}
              onEditProject={setEditProject}
              onDeleteProject={handleDeleteProject}
            />
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
