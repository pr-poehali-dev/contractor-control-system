import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import OnboardingBanner from '@/components/OnboardingBanner';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

  const projects = userData?.projects || [];

  useEffect(() => {
    if (!user) return;

    if (user.role === 'contractor') {
      navigate('/objects');
      return;
    }

    if (user.id === 3 && projects.length === 0) {
      const hasSeenOnboarding = localStorage.getItem(`onboarding_${user.id}`);
      if (!hasSeenOnboarding) {
        setShowOnboarding(true);
      }
    }
  }, [user, projects.length, navigate]);

  if (showOnboarding && user?.id === 3) {
    return <OnboardingBanner onClose={() => setShowOnboarding(false)} />;
  }

  const activeProjects = projects.filter(p => p.status === 'active').length;
  const sites = userData?.sites || [];
  const works = userData?.works || [];
  const remarks = userData?.remarks?.filter(r => r.status === 'open').length || 0;

  const stats = [
    { label: 'Проектов', value: String(activeProjects), icon: 'Building2', color: 'bg-blue-100 text-[#2563EB]' },
    { label: 'Объектов', value: String(sites.length), icon: 'MapPin', color: 'bg-green-100 text-green-600' },
    { label: 'Работ', value: String(works.length), icon: 'ClipboardCheck', color: 'bg-purple-100 text-purple-600' },
    { label: 'Замечания', value: String(remarks), icon: 'AlertCircle', color: 'bg-red-100 text-red-600' },
  ];

  return (
    <div className="p-4 md:p-8 pb-24 md:pb-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Главная</h1>
        <p className="text-slate-600">Обзор всех проектов</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
        {stats.map((stat, index) => (
          <Card key={stat.label} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
            <CardContent className="p-4 md:p-6">
              <div className={`w-10 h-10 md:w-12 md:h-12 ${stat.color} rounded-lg flex items-center justify-center mb-2 md:mb-3`}>
                <Icon name={stat.icon as any} size={20} className="md:w-6 md:h-6" />
              </div>
              <p className="text-2xl md:text-3xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-xs text-slate-600 font-medium">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-slate-900">Проекты</h2>
        <Button onClick={() => navigate('/projects')} size="sm">
          <Icon name="Plus" size={16} className="mr-1" />
          Создать
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card className="p-12 text-center">
          <Icon name="Folder" size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 mb-4">Нет проектов</p>
          <Button onClick={() => navigate('/projects')}>
            <Icon name="Plus" size={16} className="mr-2" />
            Создать первый проект
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {projects.map((project, index) => {
            const projectSites = sites.filter(s => s.project_id === project.id);
            const projectWorks = works.filter(w => 
              projectSites.some(s => s.id === w.object_id)
            );
            const completedWorks = projectWorks.filter(w => w.status === 'completed').length;
            const progress = projectWorks.length > 0 
              ? Math.round((completedWorks / projectWorks.length) * 100)
              : 0;

            return (
              <Card 
                key={project.id}
                className="cursor-pointer hover:shadow-lg transition-shadow animate-fade-in group"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-slate-900 text-base md:text-lg group-hover:text-blue-600 transition-colors">
                      {project.title}
                    </h3>
                    <div className={`
                      w-2 h-2 rounded-full
                      ${project.status === 'active' ? 'bg-green-500' : ''}
                      ${project.status === 'pending' ? 'bg-yellow-500' : ''}
                      ${project.status === 'completed' ? 'bg-slate-400' : ''}
                    `} />
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <span className="flex items-center gap-1">
                      <Icon name="MapPin" size={14} />
                      {projectSites.length}
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon name="Wrench" size={14} />
                      {projectWorks.length}
                    </span>
                    <span className="text-blue-600 font-medium ml-auto">{progress}%</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dashboard;