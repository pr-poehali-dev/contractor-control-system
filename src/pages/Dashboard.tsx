import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import OnboardingBanner from '@/components/OnboardingBanner';
import FeedFilters from '@/components/dashboard/FeedFilters';
import FeedEventCard from '@/components/dashboard/FeedEventCard';
import CreateActionButton from '@/components/dashboard/CreateActionButton';
import JournalEntryModal from '@/components/dashboard/JournalEntryModal';
import InspectionModal from '@/components/dashboard/InspectionModal';
import InfoPostModal from '@/components/dashboard/InfoPostModal';

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
      <div className="max-w-[680px] mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              Лента событий
            </h1>

            <CreateActionButton
              userRole={user?.role}
              onCreateJournal={() => setShowJournalModal(true)}
              onCreateInspection={() => setShowInspectionModal(true)}
              onCreateInfoPost={() => setShowInfoPostModal(true)}
            />
          </div>
        </div>

        <div className="space-y-4">
            <FeedFilters filter={filter} onFilterChange={setFilter} />

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
                  <FeedEventCard
                    key={event.id}
                    event={event}
                    index={index}
                    onClick={handleEventClick}
                  />
                ))
              )}
            </div>
        </div>
      </div>

      <JournalEntryModal
        open={showJournalModal}
        onOpenChange={setShowJournalModal}
        form={journalForm}
        onFormChange={setJournalForm}
        projects={projects}
        onSubmit={handleCreateJournalEntry}
      />

      <InspectionModal
        open={showInspectionModal}
        onOpenChange={setShowInspectionModal}
        form={inspectionForm}
        onFormChange={setInspectionForm}
        projects={projects}
        onSubmit={handleScheduleInspection}
      />

      <InfoPostModal
        open={showInfoPostModal}
        onOpenChange={setShowInfoPostModal}
        form={infoPostForm}
        onFormChange={setInfoPostForm}
        onSubmit={handleCreateInfoPost}
      />
    </div>
  );
};

export default Dashboard;