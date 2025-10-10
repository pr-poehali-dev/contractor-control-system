import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';
import OnboardingBanner from '@/components/OnboardingBanner';
import { Skeleton } from '@/components/ui/skeleton';

interface FeedEvent {
  id: string;
  type: 'work_log' | 'inspection' | 'remark' | 'work_start' | 'work_complete';
  title: string;
  description: string;
  timestamp: string;
  status?: string;
  workId?: number;
  objectId?: number;
  projectId?: number;
  objectTitle?: string;
  projectTitle?: string;
  author?: string;
  photoUrls?: string[];
  materials?: string;
  volume?: string;
  defects?: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [feed, setFeed] = useState<FeedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'work_logs' | 'inspections' | 'remarks'>('all');

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

  useEffect(() => {
    loadFeed();
  }, [user]);

  const loadFeed = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await fetch(`https://functions.poehali.dev/f38edb91-216d-4887-b091-ef224db01905?user_id=${user.id}`);
      const data = await response.json();
      
      if (data.success) {
        setFeed(data.events);
      }
    } catch (error) {
      console.error('Failed to load feed:', error);
    } finally {
      setLoading(false);
    }
  };

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
    },
    { 
      label: 'Объектов в работе', 
      value: String(sites.filter(s => s.status === 'active').length), 
      icon: 'MapPin', 
      color: 'bg-green-100 text-green-600',
    },
    { 
      label: 'Работ выполняется', 
      value: String(works.filter(w => w.status === 'in_progress').length), 
      icon: 'Wrench', 
      color: 'bg-purple-100 text-purple-600',
    },
    { 
      label: 'Открытых замечаний', 
      value: String(openRemarks), 
      icon: 'AlertCircle', 
      color: 'bg-red-100 text-red-600',
    },
  ];

  const getEventIcon = (type: string) => {
    switch(type) {
      case 'work_log': return 'FileText';
      case 'inspection': return 'ClipboardCheck';
      case 'remark': return 'AlertTriangle';
      case 'work_start': return 'Play';
      case 'work_complete': return 'CheckCircle2';
      default: return 'Activity';
    }
  };

  const getEventColor = (type: string) => {
    switch(type) {
      case 'work_log': return 'bg-blue-100 text-blue-600';
      case 'inspection': return 'bg-purple-100 text-purple-600';
      case 'remark': return 'bg-red-100 text-red-600';
      case 'work_start': return 'bg-green-100 text-green-600';
      case 'work_complete': return 'bg-emerald-100 text-emerald-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const getEventLabel = (type: string) => {
    switch(type) {
      case 'work_log': return 'Запись в журнале';
      case 'inspection': return 'Проверка';
      case 'remark': return 'Замечание';
      case 'work_start': return 'Начало работы';
      case 'work_complete': return 'Работа завершена';
      default: return type;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 7) {
      return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
    } else if (diffDays > 0) {
      return `${diffDays} ${diffDays === 1 ? 'день' : diffDays < 5 ? 'дня' : 'дней'} назад`;
    } else if (diffHours > 0) {
      return `${diffHours} ${diffHours === 1 ? 'час' : diffHours < 5 ? 'часа' : 'часов'} назад`;
    } else {
      return 'Только что';
    }
  };

  const handleEventClick = (event: FeedEvent) => {
    if (event.projectId && event.objectId && event.workId) {
      navigate(`/projects/${event.projectId}/objects/${event.objectId}`, {
        state: { scrollToWork: event.workId }
      });
    }
  };

  const filteredFeed = filter === 'all' 
    ? feed 
    : feed.filter(event => {
        if (filter === 'work_logs') return event.type === 'work_log' || event.type === 'work_start' || event.type === 'work_complete';
        if (filter === 'inspections') return event.type === 'inspection';
        if (filter === 'remarks') return event.type === 'remark';
        return true;
      });

  return (
    <div className="p-4 md:p-6 lg:p-8 pb-24 md:pb-10 bg-slate-50 min-h-screen">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">
            {user?.name || 'Пользователь'}
          </h1>
          <p className="text-slate-600">Лента событий по вашим проектам</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => (
            <Card key={stat.label} className="animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon name={stat.icon as any} size={20} />
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                </div>
                <p className="text-xs text-slate-600 font-medium">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <Card className="mb-4">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  <Button
                    variant={filter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('all')}
                    className="flex-shrink-0"
                  >
                    <Icon name="Sparkles" size={16} className="mr-2" />
                    Все события
                  </Button>
                  <Button
                    variant={filter === 'work_logs' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('work_logs')}
                    className="flex-shrink-0"
                  >
                    <Icon name="FileText" size={16} className="mr-2" />
                    Журнал работ
                  </Button>
                  <Button
                    variant={filter === 'inspections' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('inspections')}
                    className="flex-shrink-0"
                  >
                    <Icon name="ClipboardCheck" size={16} className="mr-2" />
                    Проверки
                  </Button>
                  <Button
                    variant={filter === 'remarks' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('remarks')}
                    className="flex-shrink-0"
                  >
                    <Icon name="AlertTriangle" size={16} className="mr-2" />
                    Замечания
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                          <Skeleton className="h-3 w-full" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : filteredFeed.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon name="Inbox" size={32} className="text-slate-400" />
                    </div>
                    <p className="text-slate-600 mb-2">Пока нет событий</p>
                    <p className="text-sm text-slate-500">События появятся, когда начнется работа над проектами</p>
                  </CardContent>
                </Card>
              ) : (
                filteredFeed.map((event, index) => (
                  <Card 
                    key={event.id}
                    className="hover:shadow-md transition-shadow cursor-pointer animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                    onClick={() => handleEventClick(event)}
                  >
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0">
                          <Avatar className={`w-12 h-12 ${getEventColor(event.type)}`}>
                            <AvatarFallback className="bg-transparent">
                              <Icon name={getEventIcon(event.type) as any} size={24} />
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2 gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <Badge variant="outline" className="text-xs">
                                  {getEventLabel(event.type)}
                                </Badge>
                                <span className="text-xs text-slate-500">
                                  {formatTimeAgo(event.timestamp)}
                                </span>
                              </div>
                              <h3 className="font-semibold text-slate-900 mb-1">
                                {event.title}
                              </h3>
                            </div>
                          </div>

                          <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                            {event.description}
                          </p>

                          {(event.volume || event.materials) && (
                            <div className="flex flex-wrap gap-4 mb-3 text-xs">
                              {event.volume && (
                                <div className="flex items-center gap-1.5 text-slate-600">
                                  <Icon name="Package" size={14} />
                                  <span>Объём: {event.volume}</span>
                                </div>
                              )}
                              {event.materials && (
                                <div className="flex items-center gap-1.5 text-slate-600">
                                  <Icon name="Boxes" size={14} />
                                  <span>Материалы: {event.materials}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {event.photoUrls && event.photoUrls.length > 0 && (
                            <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-hide">
                              {event.photoUrls.slice(0, 4).map((url, i) => (
                                <div key={i} className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-slate-100">
                                  <img 
                                    src={url} 
                                    alt={`Фото ${i + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ))}
                              {event.photoUrls.length > 4 && (
                                <div className="w-20 h-20 flex-shrink-0 rounded-lg bg-slate-100 flex items-center justify-center text-sm text-slate-600 font-medium">
                                  +{event.photoUrls.length - 4}
                                </div>
                              )}
                            </div>
                          )}

                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Icon name="FolderOpen" size={14} />
                            <span className="truncate">{event.projectTitle}</span>
                            <Icon name="ChevronRight" size={12} />
                            <Icon name="MapPin" size={14} />
                            <span className="truncate">{event.objectTitle}</span>
                          </div>

                          {event.author && (
                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100">
                              <Icon name="User" size={14} />
                              <span>{event.author}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          <div className="lg:w-80 flex-shrink-0">
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4 text-slate-900">Быстрые действия</h3>
                <div className="space-y-2">
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => navigate('/projects')}
                  >
                    <Icon name="FolderPlus" size={18} className="mr-3" />
                    Создать проект
                  </Button>

                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => navigate('/create-inspection')}
                  >
                    <Icon name="ClipboardCheck" size={18} className="mr-3" />
                    Создать проверку
                  </Button>

                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => navigate('/analytics')}
                  >
                    <Icon name="BarChart3" size={18} className="mr-3" />
                    Аналитика
                  </Button>

                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => navigate('/work-templates')}
                  >
                    <Icon name="FileText" size={18} className="mr-3" />
                    Шаблоны
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;