import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import OnboardingBanner from '@/components/OnboardingBanner';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

  const projects = userData?.projects || [];

  useEffect(() => {
    if (!user) return;

    const checkContractorRedirect = async () => {
      if (user.role === 'contractor') {
        try {
          const response = await fetch(`https://functions.poehali.dev/354c1d24-5775-4678-ba82-bb1acd986337?contractor_id=${user.id}`);
          const data = await response.json();
          const objects = data.objects || [];

          if (objects.length === 1) {
            navigate(`/projects/${objects[0].project_id}/objects/${objects[0].id}`);
          } else {
            navigate('/objects');
          }
        } catch (error) {
          navigate('/objects');
        }
        return;
      }

      if (user.id === 3 && projects.length === 0) {
        const hasSeenOnboarding = localStorage.getItem(`onboarding_${user.id}`);
        if (!hasSeenOnboarding) {
          setShowOnboarding(true);
        }
      }
    };

    checkContractorRedirect();
  }, [user, projects.length, navigate]);

  if (showOnboarding && user?.id === 3) {
    return <OnboardingBanner onClose={() => setShowOnboarding(false)} />;
  }

  const activeProjects = projects.filter(p => p.status === 'active').length;
  const sites = userData?.sites || [];
  const works = userData?.works || [];
  const remarks = userData?.remarks || [];
  const openRemarks = remarks.filter(r => r.status === 'open').length;

  const stats = [
    { 
      label: 'Активных проектов', 
      value: String(activeProjects), 
      icon: 'Building2', 
      color: 'bg-blue-100 text-[#2563EB]',
      trend: '+12%',
      trendUp: true
    },
    { 
      label: 'Объектов в работе', 
      value: String(sites.filter(s => s.status === 'active').length), 
      icon: 'MapPin', 
      color: 'bg-green-100 text-green-600',
      total: sites.length,
      trend: '+8%',
      trendUp: true
    },
    { 
      label: 'Работ выполняется', 
      value: String(works.filter(w => w.status === 'in_progress').length), 
      icon: 'Wrench', 
      color: 'bg-purple-100 text-purple-600',
      total: works.length,
      trend: '+5%',
      trendUp: true
    },
    { 
      label: 'Открытых замечаний', 
      value: String(openRemarks), 
      icon: 'AlertCircle', 
      color: 'bg-red-100 text-red-600',
      total: remarks.length,
      trend: '-15%',
      trendUp: false
    },
  ];

  const recentActivity = [
    { id: 1, type: 'work', title: 'Бетонирование фундамента', object: 'ЖК Солнечный', time: '2 часа назад', status: 'completed' },
    { id: 2, type: 'inspection', title: 'Проверка качества кирпичной кладки', object: 'ТЦ Европейский', time: '4 часа назад', status: 'pending' },
    { id: 3, type: 'remark', title: 'Обнаружены отклонения в штукатурке', object: 'ЖК Солнечный', time: '1 день назад', status: 'open' },
    { id: 4, type: 'work', title: 'Установка окон', object: 'Офисное здание А1', time: '2 дня назад', status: 'in_progress' },
  ];

  const getActivityIcon = (type: string) => {
    switch(type) {
      case 'work': return 'Wrench';
      case 'inspection': return 'ClipboardCheck';
      case 'remark': return 'AlertTriangle';
      default: return 'Activity';
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'in_progress': return 'bg-blue-100 text-blue-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'open': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'completed': return 'Завершено';
      case 'in_progress': return 'В работе';
      case 'pending': return 'Ожидает';
      case 'open': return 'Открыто';
      default: return status;
    }
  };

  return (
    <div className="p-6 md:p-8 lg:p-10 pb-24 md:pb-10 bg-slate-50 min-h-screen">
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            Добро пожаловать, {user?.name || 'Пользователь'}
          </h1>
          <p className="text-lg text-slate-600">Обзор активности и статистика проектов</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={stat.label} className="animate-fade-in hover:shadow-lg transition-shadow" style={{ animationDelay: `${index * 0.1}s` }}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 ${stat.color} rounded-xl flex items-center justify-center`}>
                    <Icon name={stat.icon as any} size={28} />
                  </div>
                  {stat.trend && (
                    <Badge variant="outline" className={`${stat.trendUp ? 'text-green-600 border-green-200' : 'text-red-600 border-red-200'}`}>
                      {stat.trend}
                    </Badge>
                  )}
                </div>
                <div className="flex items-baseline gap-2 mb-1">
                  <p className="text-4xl font-bold text-slate-900">{stat.value}</p>
                  {stat.total && <p className="text-lg text-slate-400">/ {stat.total}</p>}
                </div>
                <p className="text-sm text-slate-600 font-medium">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold">Последняя активность</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/activity')}>
                  Все события
                  <Icon name="ArrowRight" size={16} className="ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                      <Icon name={getActivityIcon(activity.type) as any} size={20} className="text-slate-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 mb-1">{activity.title}</p>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Icon name="MapPin" size={14} />
                        <span>{activity.object}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={getStatusColor(activity.status)}>
                        {getStatusLabel(activity.status)}
                      </Badge>
                      <span className="text-xs text-slate-400">{activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold">Быстрые действия</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button 
                  className="w-full justify-start h-auto py-4" 
                  variant="outline"
                  onClick={() => navigate('/projects')}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 text-[#2563EB] rounded-lg flex items-center justify-center">
                      <Icon name="FolderPlus" size={20} />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-slate-900">Создать проект</p>
                      <p className="text-xs text-slate-500">Новый строительный проект</p>
                    </div>
                  </div>
                </Button>

                <Button 
                  className="w-full justify-start h-auto py-4" 
                  variant="outline"
                  onClick={() => navigate('/create-inspection')}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                      <Icon name="ClipboardCheck" size={20} />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-slate-900">Создать проверку</p>
                      <p className="text-xs text-slate-500">Инспекция объекта</p>
                    </div>
                  </div>
                </Button>

                <Button 
                  className="w-full justify-start h-auto py-4" 
                  variant="outline"
                  onClick={() => navigate('/analytics')}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                      <Icon name="BarChart3" size={20} />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-slate-900">Аналитика смет</p>
                      <p className="text-xs text-slate-500">План vs Факт</p>
                    </div>
                  </div>
                </Button>

                <Button 
                  className="w-full justify-start h-auto py-4" 
                  variant="outline"
                  onClick={() => navigate('/work-templates')}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center">
                      <Icon name="FileText" size={20} />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-slate-900">Шаблоны документов</p>
                      <p className="text-xs text-slate-500">Акты и отчёты</p>
                    </div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold">Активные проекты</CardTitle>
              <Button onClick={() => navigate('/projects')} size="sm">
                <Icon name="Plus" size={16} className="mr-1" />
                Создать проект
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="Folder" size={40} className="text-slate-300" />
                </div>
                <p className="text-lg text-slate-500 mb-4">Нет проектов</p>
                <Button onClick={() => navigate('/projects')}>
                  <Icon name="Plus" size={16} className="mr-2" />
                  Создать первый проект
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.slice(0, 6).map((project, index) => {
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
                      className="cursor-pointer hover:shadow-lg transition-all animate-fade-in group border-2 border-transparent hover:border-blue-200"
                      style={{ animationDelay: `${index * 0.1}s` }}
                      onClick={() => navigate(`/projects/${project.id}`)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition-colors">
                            {project.title}
                          </h3>
                          <div className={`
                            w-3 h-3 rounded-full
                            ${project.status === 'active' ? 'bg-green-500' : ''}
                            ${project.status === 'pending' ? 'bg-yellow-500' : ''}
                            ${project.status === 'completed' ? 'bg-slate-400' : ''}
                          `} />
                        </div>
                        
                        <div className="space-y-3 mb-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600">Прогресс</span>
                            <span className="font-bold text-blue-600">{progress}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <span className="flex items-center gap-1.5">
                            <Icon name="MapPin" size={16} />
                            {projectSites.length} объектов
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Icon name="Wrench" size={16} />
                            {projectWorks.length} работ
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;