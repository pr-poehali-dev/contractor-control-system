import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import Icon from '@/components/ui/icon';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';
import FeedFilters from '@/components/dashboard/FeedFilters';
import FeedEventCard from '@/components/dashboard/FeedEventCard';
import CreateActionButton from '@/components/dashboard/CreateActionButton';
import JournalEntryModal from '@/components/dashboard/JournalEntryModal';
import CreateInspectionWithWorkSelect from '@/components/dashboard/CreateInspectionWithWorkSelect';
import InfoPostModal from '@/components/dashboard/InfoPostModal';
import NotificationsSummary from '@/components/work-journal/NotificationsSummary';


interface FeedEvent {
  id: string;
  type: 'work_log' | 'inspection' | 'info_post' | 'planned_inspection';
  title: string;
  description: string;
  timestamp: string;
  status?: string;
  workId?: number;
  objectId?: number;
  objectTitle?: string;
  workTitle?: string;
  author?: string;
  photoUrls?: string[];
  materials?: string;
  volume?: string;
  defects?: string;
  defectsCount?: number;
  scheduledDate?: string;
}

interface ObjectData {
  id: number;
  title: string;
}

interface WorkData {
  id: number;
  title: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, userData, loadUserData, token } = useAuth();
  const { toast } = useToast();
  const [feed, setFeed] = useState<FeedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'work_logs' | 'inspections' | 'info_posts'>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const [showJournalModal, setShowJournalModal] = useState(false);
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [showInfoPostModal, setShowInfoPostModal] = useState(false);

  const [journalForm, setJournalForm] = useState({
    objectId: '',
    workId: '',
    description: '',
    volume: '',
    materials: '',
    photoUrls: [] as string[]
  });



  const [infoPostForm, setInfoPostForm] = useState({
    title: '',
    content: '',
    link: ''
  });

  const objects = (userData?.objects && Array.isArray(userData.objects)) ? userData.objects : [];
  const works = (userData?.works && Array.isArray(userData.works)) ? userData.works : [];
  const unreadCounts = userData?.unreadCounts || {};
  
  const totalMessages = Object.values(unreadCounts).reduce((sum, c: any) => sum + (c.messages || 0), 0);
  const totalLogs = Object.values(unreadCounts).reduce((sum, c: any) => sum + (c.logs || 0), 0);
  const totalInspections = Object.values(unreadCounts).reduce((sum, c: any) => sum + (c.inspections || 0), 0);

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
        const normalizedEvents = data.events.map((event: any) => {
          if (event.photoUrls && typeof event.photoUrls === 'string') {
            try {
              event.photoUrls = JSON.parse(event.photoUrls);
            } catch {
              event.photoUrls = [event.photoUrls];
            }
          }
          return event;
        });
        setFeed(normalizedEvents);
      }
    } catch (error) {
      console.error('Failed to load feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (event: FeedEvent) => {
    if (event.type === 'info_post') return;
    
    if (event.objectId && event.workId) {
      navigate(`/objects/${event.objectId}`, {
        state: { scrollToWork: event.workId }
      });
    }
  };

  const uniqueContractors = Array.from(new Set(feed.map(e => e.author).filter(Boolean)));
  
  const availableTags = [
    ...objects.map(obj => ({ 
      id: `object-${obj.id}`, 
      label: obj.title, 
      type: 'object' as const 
    })),
    ...works.map(work => ({ 
      id: `work-${work.id}`, 
      label: work.title, 
      type: 'work' as const 
    })),
    ...uniqueContractors.map(contractor => ({
      id: `contractor-${contractor}`,
      label: contractor!,
      type: 'contractor' as const
    }))
  ];

  const filteredFeed = feed.filter(event => {
    const typeMatch = filter === 'all' || 
      (filter === 'work_logs' && event.type === 'work_log') ||
      (filter === 'inspections' && (event.type === 'inspection' || event.type === 'planned_inspection')) ||
      (filter === 'info_posts' && event.type === 'info_post');

    if (!typeMatch) return false;

    if (selectedTags.length === 0) return true;

    // Группируем теги по типам
    const objectTags = selectedTags.filter(tag => tag.startsWith('object-'));
    const workTags = selectedTags.filter(tag => tag.startsWith('work-'));
    const contractorTags = selectedTags.filter(tag => tag.startsWith('contractor-'));

    // Проверяем каждую группу отдельно - все должны совпадать (логика И)
    const objectMatch = objectTags.length === 0 || objectTags.some(tag => {
      const objectId = parseInt(tag.replace('object-', ''));
      return event.objectId === objectId;
    });

    const workMatch = workTags.length === 0 || workTags.some(tag => {
      const workId = parseInt(tag.replace('work-', ''));
      return event.workId === workId;
    });

    const contractorMatch = contractorTags.length === 0 || contractorTags.some(tag => {
      const contractor = tag.replace('contractor-', '');
      return event.author === contractor;
    });

    // Все условия должны выполняться одновременно
    return objectMatch && workMatch && contractorMatch;
  });

  const handleCreateJournalEntry = async () => {
    if (!journalForm.objectId || !journalForm.workId || !journalForm.description) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все обязательные поля',
        variant: 'destructive'
      });
      return;
    }

    try {
      const photoUrls = journalForm.photoUrls && journalForm.photoUrls.length > 0 
        ? journalForm.photoUrls 
        : [
            'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800',
            'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800'
          ];
      
      await api.createItem(token!, 'work_log', {
        work_id: Number(journalForm.workId),
        description: journalForm.description,
        volume: journalForm.volume || null,
        materials: journalForm.materials || null,
        photo_urls: JSON.stringify(photoUrls)
      });

      toast({
        title: 'Запись создана',
        description: 'Отчет добавлен в журнал работ'
      });

      setShowJournalModal(false);
      setJournalForm({
        objectId: '',
        workId: '',
        description: '',
        volume: '',
        materials: '',
        photoUrls: []
      });
      
      await loadUserData();
      loadFeed();
    } catch (error: any) {
      console.error('Failed to create work log:', error);
      toast({
        title: 'Ошибка',
        description: error?.message || 'Не удалось создать запись',
        variant: 'destructive'
      });
    }
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

    try {
      await api.createItem(token!, 'info_post', {
        title: infoPostForm.title,
        content: infoPostForm.content,
        link: infoPostForm.link || null
      });

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
      
      await loadUserData();
      loadFeed();
    } catch (error: any) {
      console.error('Failed to create info post:', error);
      toast({
        title: 'Ошибка',
        description: error?.message || 'Не удалось создать инфо-пост',
        variant: 'destructive'
      });
    }
  };

  return (
    <>
      {user && (
        <OnboardingFlow 
          userId={user.id} 
          userRole={user.role}
          registrationDate={user.created_at}
        />
      )}
      
      <div className="p-4 md:p-6 lg:p-8 pb-24 md:pb-10 bg-slate-50 min-h-screen">
        <div className="max-w-[680px] lg:max-w-[900px] mx-auto">
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
            <NotificationsSummary
              totalMessages={totalMessages}
              totalLogs={user?.role === 'client' ? totalLogs : undefined}
              totalInspections={user?.role === 'contractor' ? totalInspections : undefined}
              userRole={user?.role || 'contractor'}
              className="mx-0 mt-0"
            />
            
            <FeedFilters 
              filter={filter} 
              onFilterChange={setFilter}
              selectedTags={selectedTags}
              onTagsChange={setSelectedTags}
              availableTags={availableTags}
              feed={feed}
              works={works}
            />

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
                    <p className="text-sm text-slate-500">События появятся, когда начнется работа над объектами</p>
                  </CardContent>
                </Card>
              ) : (
                filteredFeed.map((event, index) => (
                  <FeedEventCard
                    key={event.id}
                    event={event}
                    index={index}
                    onClick={handleEventClick}
                    userRole={user?.role}
                    onTagClick={(tagId, tagType) => {
                      if (!selectedTags.includes(tagId)) {
                        setSelectedTags([...selectedTags, tagId]);
                      }
                    }}
                    onInspectionClick={(event) => {
                      const inspectionId = event.id.replace('inspection_', '').replace('planned_inspection_', '');
                      navigate(`/inspection/${inspectionId}`);
                    }}
                    onStartInspection={(event) => {
                      if (event.workId && event.objectId) {
                        navigate(`/objects/${event.objectId}`, {
                          state: { scrollToWork: event.workId, startInspection: true }
                        });
                      }
                    }}
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
        objects={objects}
        works={works}
        onSubmit={handleCreateJournalEntry}
      />

      <CreateInspectionWithWorkSelect
        isOpen={showInspectionModal}
        onClose={() => setShowInspectionModal(false)}
      />

      <InfoPostModal
        open={showInfoPostModal}
        onOpenChange={setShowInfoPostModal}
        form={infoPostForm}
        onFormChange={setInfoPostForm}
        onSubmit={handleCreateInfoPost}
      />


      </div>
    </>
  );
};

export default Dashboard;