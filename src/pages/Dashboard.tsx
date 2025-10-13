import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Icon from '@/components/ui/icon';
import OnboardingBanner from '@/components/OnboardingBanner';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface FeedEvent {
  id: string;
  type: 'work_log' | 'inspection' | 'info_post' | 'planned_inspection';
  title: string;
  description: string;
  timestamp: string;
  status?: string;
  workId?: number;
  objectId?: number;
  projectId?: number;
  objectTitle?: string;
  projectTitle?: string;
  workTitle?: string;
  author?: string;
  photoUrls?: string[];
  materials?: string;
  volume?: string;
  defects?: string;
  scheduledDate?: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const { toast } = useToast();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [feed, setFeed] = useState<FeedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'work_logs' | 'inspections' | 'info_posts'>('all');

  const [showJournalModal, setShowJournalModal] = useState(false);
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [showInfoPostModal, setShowInfoPostModal] = useState(false);

  const [journalForm, setJournalForm] = useState({
    projectId: '',
    objectId: '',
    workId: '',
    description: '',
    volume: '',
    materials: '',
    photos: [] as File[]
  });

  const [inspectionForm, setInspectionForm] = useState({
    projectId: '',
    objectId: '',
    workId: '',
    scheduledDate: '',
    notes: ''
  });

  const [infoPostForm, setInfoPostForm] = useState({
    title: '',
    content: '',
    link: ''
  });

  const projects = userData?.projects || [];

  useEffect(() => {
    if (!user) return;

    const checkOnboarding = () => {
      if (user.id === 3 && projects.length === 0) {
        const hasSeenOnboarding = localStorage.getItem(`onboarding_${user.id}`);
        if (!hasSeenOnboarding) {
          setShowOnboarding(true);
        }
      }
    };

    checkOnboarding();
  }, [user, projects.length]);

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
      case 'info_post': return 'Bell';
      case 'planned_inspection': return 'Calendar';
      default: return 'Activity';
    }
  };

  const getEventColor = (type: string) => {
    switch(type) {
      case 'work_log': return 'bg-blue-100 text-blue-600';
      case 'inspection': return 'bg-purple-100 text-purple-600';
      case 'info_post': return 'bg-amber-100 text-amber-600';
      case 'planned_inspection': return 'bg-slate-100 text-slate-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const getEventLabel = (type: string) => {
    switch(type) {
      case 'work_log': return 'Запись в журнале';
      case 'inspection': return 'Проверка';
      case 'info_post': return 'Инфо-пост';
      case 'planned_inspection': return 'Запланирована проверка';
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
    if (event.type === 'info_post') return;
    
    if (event.projectId && event.objectId && event.workId) {
      navigate(`/projects/${event.projectId}/objects/${event.objectId}`, {
        state: { scrollToWork: event.workId }
      });
    }
  };

  const filteredFeed = filter === 'all' 
    ? feed 
    : feed.filter(event => {
        if (filter === 'work_logs') return event.type === 'work_log';
        if (filter === 'inspections') return event.type === 'inspection' || event.type === 'planned_inspection';
        if (filter === 'info_posts') return event.type === 'info_post';
        return true;
      });

  const selectedProject = projects.find(p => p.id === Number(journalForm.projectId));
  const selectedObject = selectedProject?.objects?.find((o: any) => o.id === Number(journalForm.objectId));
  const availableWorks = selectedObject?.works || [];

  const inspSelectedProject = projects.find(p => p.id === Number(inspectionForm.projectId));
  const inspSelectedObject = inspSelectedProject?.objects?.find((o: any) => o.id === Number(inspectionForm.objectId));
  const inspAvailableWorks = inspSelectedObject?.works || [];

  const handleCreateJournalEntry = async () => {
    if (!journalForm.projectId || !journalForm.objectId || !journalForm.workId || !journalForm.description) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все обязательные поля',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Запись создана',
      description: 'Отчет добавлен в журнал работ'
    });

    setShowJournalModal(false);
    setJournalForm({
      projectId: '',
      objectId: '',
      workId: '',
      description: '',
      volume: '',
      materials: '',
      photos: []
    });
    
    loadFeed();
  };

  const handleScheduleInspection = async () => {
    if (!inspectionForm.projectId || !inspectionForm.objectId || !inspectionForm.workId || !inspectionForm.scheduledDate) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все обязательные поля',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Проверка запланирована',
      description: `Проверка назначена на ${new Date(inspectionForm.scheduledDate).toLocaleDateString('ru-RU')}`
    });

    setShowInspectionModal(false);
    setInspectionForm({
      projectId: '',
      objectId: '',
      workId: '',
      scheduledDate: '',
      notes: ''
    });
    
    loadFeed();
  };

  const handleCreateInfoPost = async () => {
    if (!infoPostForm.title || !infoPostForm.content) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все обязательные поля',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Инфо-пост создан',
      description: 'Уведомление отправлено всем пользователям'
    });

    setShowInfoPostModal(false);
    setInfoPostForm({
      title: '',
      content: '',
      link: ''
    });
    
    loadFeed();
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 pb-24 md:pb-10 bg-slate-50 min-h-screen">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-4 md:mb-6">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-3">
              <div className="hidden md:flex w-12 h-12 bg-blue-100 rounded-full items-center justify-center flex-shrink-0">
                <Icon name="Building2" size={24} className="text-blue-600" />
              </div>
              <h1 className="text-xl md:text-3xl font-bold text-slate-900">
                Лента событий
              </h1>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" className="rounded-full h-12 w-12 shadow-lg">
                  <Icon name="Plus" size={24} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {user?.role === 'contractor' && (
                  <DropdownMenuItem onClick={() => setShowJournalModal(true)}>
                    <Icon name="FileText" size={18} className="mr-2" />
                    Запись в журнал
                  </DropdownMenuItem>
                )}
                {user?.role === 'client' && (
                  <DropdownMenuItem onClick={() => setShowInspectionModal(true)}>
                    <Icon name="Calendar" size={18} className="mr-2" />
                    Проверку
                  </DropdownMenuItem>
                )}
                {user?.role === 'admin' && (
                  <DropdownMenuItem onClick={() => setShowInfoPostModal(true)}>
                    <Icon name="Bell" size={18} className="mr-2" />
                    Инфо-пост
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <p className="text-sm md:text-base text-slate-600">События по вашим проектам</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
          {stats.map((stat, index) => (
            <Card key={stat.label} className="animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                  <div className={`w-8 h-8 md:w-10 md:h-10 ${stat.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon name={stat.icon as any} size={16} className="md:w-5 md:h-5" />
                  </div>
                  <p className="text-xl md:text-2xl font-bold text-slate-900">{stat.value}</p>
                </div>
                <p className="text-[11px] md:text-xs text-slate-600 font-medium leading-tight">{stat.label}</p>
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
                    variant={filter === 'info_posts' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('info_posts')}
                    className="flex-shrink-0"
                  >
                    <Icon name="Bell" size={16} className="mr-2" />
                    Инфо-посты
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
                    className={`hover:shadow-md transition-shadow animate-fade-in ${event.type === 'info_post' ? '' : 'cursor-pointer'}`}
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
                                  {event.scheduledDate 
                                    ? new Date(event.scheduledDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
                                    : formatTimeAgo(event.timestamp)
                                  }
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

                          {event.type !== 'info_post' && event.projectTitle && (
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <Icon name="FolderOpen" size={14} />
                              <span className="truncate">{event.projectTitle}</span>
                              {event.objectTitle && (
                                <>
                                  <Icon name="ChevronRight" size={12} />
                                  <Icon name="MapPin" size={14} />
                                  <span className="truncate">{event.objectTitle}</span>
                                </>
                              )}
                              {event.workTitle && (
                                <>
                                  <Icon name="ChevronRight" size={12} />
                                  <Icon name="Wrench" size={14} />
                                  <span className="truncate">{event.workTitle}</span>
                                </>
                              )}
                            </div>
                          )}

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
        </div>
      </div>

      <Dialog open={showJournalModal} onOpenChange={setShowJournalModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Создать запись в журнал</DialogTitle>
            <DialogDescription>Добавьте отчет о выполненных работах</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Проект</Label>
              <Select value={journalForm.projectId} onValueChange={(val) => setJournalForm({...journalForm, projectId: val, objectId: '', workId: ''})}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите проект" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p: any) => (
                    <SelectItem key={p.id} value={String(p.id)}>{p.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {journalForm.projectId && (
              <div>
                <Label>Объект</Label>
                <Select value={journalForm.objectId} onValueChange={(val) => setJournalForm({...journalForm, objectId: val, workId: ''})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите объект" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedProject?.objects?.map((o: any) => (
                      <SelectItem key={o.id} value={String(o.id)}>{o.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {journalForm.objectId && (
              <div>
                <Label>Работа</Label>
                <Select value={journalForm.workId} onValueChange={(val) => setJournalForm({...journalForm, workId: val})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите работу" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableWorks.map((w: any) => (
                      <SelectItem key={w.id} value={String(w.id)}>{w.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label>Описание работ</Label>
              <Textarea 
                placeholder="Опишите выполненные работы..."
                value={journalForm.description}
                onChange={(e) => setJournalForm({...journalForm, description: e.target.value})}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Объём</Label>
                <Input 
                  placeholder="Например: 50 м²"
                  value={journalForm.volume}
                  onChange={(e) => setJournalForm({...journalForm, volume: e.target.value})}
                />
              </div>
              <div>
                <Label>Материалы</Label>
                <Input 
                  placeholder="Например: Кирпич"
                  value={journalForm.materials}
                  onChange={(e) => setJournalForm({...journalForm, materials: e.target.value})}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowJournalModal(false)}>
              Отмена
            </Button>
            <Button onClick={handleCreateJournalEntry}>
              Создать запись
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showInspectionModal} onOpenChange={setShowInspectionModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Запланировать проверку</DialogTitle>
            <DialogDescription>Выберите дату и объект для проверки</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Дата проверки</Label>
              <Input 
                type="date"
                value={inspectionForm.scheduledDate}
                onChange={(e) => setInspectionForm({...inspectionForm, scheduledDate: e.target.value})}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <Label>Проект</Label>
              <Select value={inspectionForm.projectId} onValueChange={(val) => setInspectionForm({...inspectionForm, projectId: val, objectId: '', workId: ''})}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите проект" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p: any) => (
                    <SelectItem key={p.id} value={String(p.id)}>{p.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {inspectionForm.projectId && (
              <div>
                <Label>Объект</Label>
                <Select value={inspectionForm.objectId} onValueChange={(val) => setInspectionForm({...inspectionForm, objectId: val, workId: ''})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите объект" />
                  </SelectTrigger>
                  <SelectContent>
                    {inspSelectedProject?.objects?.map((o: any) => (
                      <SelectItem key={o.id} value={String(o.id)}>{o.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {inspectionForm.objectId && (
              <div>
                <Label>Работа</Label>
                <Select value={inspectionForm.workId} onValueChange={(val) => setInspectionForm({...inspectionForm, workId: val})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите работу" />
                  </SelectTrigger>
                  <SelectContent>
                    {inspAvailableWorks.map((w: any) => (
                      <SelectItem key={w.id} value={String(w.id)}>{w.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label>Примечания (необязательно)</Label>
              <Textarea 
                placeholder="Дополнительная информация..."
                value={inspectionForm.notes}
                onChange={(e) => setInspectionForm({...inspectionForm, notes: e.target.value})}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInspectionModal(false)}>
              Отмена
            </Button>
            <Button onClick={handleScheduleInspection}>
              Запланировать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showInfoPostModal} onOpenChange={setShowInfoPostModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Создать инфо-пост</DialogTitle>
            <DialogDescription>Уведомление увидят все пользователи системы</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Заголовок</Label>
              <Input 
                placeholder="Новый регламент приемки работ"
                value={infoPostForm.title}
                onChange={(e) => setInfoPostForm({...infoPostForm, title: e.target.value})}
              />
            </div>

            <div>
              <Label>Содержание</Label>
              <Textarea 
                placeholder="С 2025 года вводится новый регламент..."
                value={infoPostForm.content}
                onChange={(e) => setInfoPostForm({...infoPostForm, content: e.target.value})}
                rows={6}
              />
            </div>

            <div>
              <Label>Ссылка (необязательно)</Label>
              <Input 
                placeholder="https://example.com/document.pdf"
                value={infoPostForm.link}
                onChange={(e) => setInfoPostForm({...infoPostForm, link: e.target.value})}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInfoPostModal(false)}>
              Отмена
            </Button>
            <Button onClick={handleCreateInfoPost}>
              Опубликовать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
