import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAppSelector } from '@/store/hooks';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { api, InspectionEvent as ApiInspectionEvent } from '@/lib/api';
import Icon from '@/components/ui/icon';
import { apiClient } from '@/api/apiClient';
import { ENDPOINTS } from '@/api/endpoints';
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
  type: 'work_log' | 'inspection' | 'info_post';
  inspectionType?: 'scheduled' | 'unscheduled';
  inspectionNumber?: string;
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

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, userData, loadUserData, token } = useAuth();
  const { toast } = useToast();
  const [feed, setFeed] = useState<FeedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'work_logs' | 'inspections' | 'info_posts'>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [inspectionEvents, setInspectionEvents] = useState<ApiInspectionEvent[]>([]);

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

  const objects = useAppSelector((state) => state.objects.items);
  const works = useAppSelector((state) => state.works.items);
  const unreadCounts = {};
  
  const totalMessages = 0;
  const totalLogs = 0;
  const totalInspections = 0;

  useEffect(() => {
    loadFeed();
    loadInspectionEvents();
  }, [user, userData]);

  const loadInspectionEvents = async () => {
    const authToken = localStorage.getItem('auth_token');
    if (!authToken) return;
    
    try {
      const events = await api.getInspectionEvents(authToken);
      setInspectionEvents(events);
    } catch (error) {
      console.error('Failed to load inspection events:', error);
    }
  };

  const loadFeed = async () => {
    if (!user) {
      console.log('⚠️ loadFeed: No user, skipping');
      return;
    }
    
    console.log('🔄 loadFeed: Starting...', { userId: user.id });
    setLoading(true);
    try {
      const url = `${ENDPOINTS.FEED}?user_id=${user.id}`;
      console.log('📡 loadFeed: Fetching from', url);
      const response = await apiClient.get(url);
      
      console.log('📥 loadFeed: Response received', response);
      
      if (response.success) {
        // Backend возвращает { success: true, events: [...] }
        // apiClient.normalizeResponse возвращает это как есть
        const rawEvents = (response as any).events || [];
        console.log('📦 loadFeed: rawEvents count', rawEvents.length);
        console.log('📦 loadFeed: rawEvents sample', rawEvents.slice(0, 2));
        
        const normalizedEvents = rawEvents.map((event: any) => {
          if (event.photoUrls && typeof event.photoUrls === 'string') {
            try {
              event.photoUrls = JSON.parse(event.photoUrls);
            } catch {
              event.photoUrls = [event.photoUrls];
            }
          }
          return event;
        }) || [];
        console.log('✅ loadFeed: Loaded events', normalizedEvents.length);
        setFeed(normalizedEvents);
      } else {
        console.warn('⚠️ loadFeed: Response not successful', response);
      }
    } catch (error) {
      console.error('❌ loadFeed: Error', error);
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
  
  // Группируем работы по названию (уникальные названия)
  const uniqueWorkTitles = Array.from(new Set(works.map(w => w.title)));
  const worksByTitle = uniqueWorkTitles.map(title => {
    const worksWithTitle = works.filter(w => w.title === title);
    return {
      title,
      workIds: worksWithTitle.map(w => w.id)
    };
  });
  
  const availableTags = [
    ...objects.map(obj => ({ 
      id: `object-${obj.id}`, 
      label: obj.title, 
      type: 'object' as const 
    })),
    ...worksByTitle.map(workGroup => ({ 
      id: `work-${workGroup.title}`, 
      label: workGroup.title,
      workIds: workGroup.workIds,
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
      (filter === 'inspections' && (event.type === 'inspection' || event.type === 'planned_inspection' || event.type === 'inspection_scheduled' || event.type === 'inspection_started' || event.type === 'inspection_completed')) ||
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
      const workTitle = tag.replace('work-', '');
      // Находим группу работ по названию
      const workGroup = worksByTitle.find(g => g.title === workTitle);
      // Проверяем, входит ли workId события в эту группу
      return workGroup?.workIds.includes(event.workId);
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
                      const inspectionId = event.inspectionId || event.id.replace('inspection_event_', '').replace('inspection_', '').replace('planned_inspection_', '');
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