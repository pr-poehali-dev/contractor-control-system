import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

import WorksList from '@/components/work-journal/WorksList';
import WorkHeader from '@/components/work-journal/WorkHeader';
import InfoTab from '@/components/work-journal/InfoTab';
import DescriptionTab from '@/components/work-journal/DescriptionTab';
import EstimateTab from '@/components/work-journal/EstimateTab';
import AnalyticsTab from '@/components/work-journal/AnalyticsTab';
import CreateInspectionSimple from '@/components/work-journal/CreateInspectionSimple';
import WorkReportModal from '@/components/work-journal/WorkReportModal';
import WorkEditDialog from '@/components/work-detail/WorkEditDialog';
import JournalTabContent from '@/components/work-journal/JournalTabContent';
import { NoWorksEmptyState, NoWorkSelectedEmptyState } from '@/components/work-journal/WorkJournalEmptyStates';
import { useWorkJournalHandlers } from '@/components/work-journal/useWorkJournalHandlers';
import type { JournalEvent, UserRole } from '@/types/journal';

interface WorkJournalProps {
  objectId: number;
  selectedWorkId?: number;
}

export default function WorkJournal({ objectId, selectedWorkId }: WorkJournalProps) {
  const { user, userData } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const works = ((userData?.works && Array.isArray(userData.works)) ? userData.works : []).filter(w => w.object_id === objectId);
  const workLogs = (userData?.workLogs && Array.isArray(userData.workLogs)) ? userData.workLogs : [];
  const inspections = (userData?.inspections && Array.isArray(userData.inspections)) ? userData.inspections : [];
  const objects = (userData?.objects && Array.isArray(userData.objects)) ? userData.objects : [];
  const chatMessages = (userData?.chatMessages && Array.isArray(userData.chatMessages)) ? userData.chatMessages : [];
  const unreadCounts = userData?.unreadCounts || {};
  
  const currentObject = objects.find(o => o.id === objectId);

  const selectedWork = selectedWorkId || works[0]?.id || null;
  
  useEffect(() => {
    if (selectedWork) {
      const markAsSeen = async () => {
        try {
          const token = localStorage.getItem('auth_token');
          await fetch('https://functions.poehali.dev/e9dd5b4f-67a6-44f8-9e1a-9108341f41df', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Auth-Token': token || ''
            },
            body: JSON.stringify({ work_id: selectedWork })
          });
        } catch (error) {
          console.error('Failed to mark work as seen:', error);
        }
      };
      markAsSeen();
    }
  }, [selectedWork]);
  
  const handlers = useWorkJournalHandlers(selectedWork);

  const [showWorksList, setShowWorksList] = useState(false);
  const [activeTab, setActiveTab] = useState('journal');
  const [workTemplates, setWorkTemplates] = useState<any[]>([]);

  useEffect(() => {
    const loadWorkTemplates = async () => {
      try {
        const response = await fetch('https://functions.poehali.dev/f7c65aa6-e261-44c6-a6cb-65fd7bac3fdf');
        const data = await response.json();
        setWorkTemplates(data.work_types || []);
      } catch (error) {
        console.error('Failed to load work templates:', error);
      }
    };
    loadWorkTemplates();
  }, []);

  const handleWorkSelect = (workId: number) => {
    navigate(`/objects/${objectId}/works/${workId}`);
  };

  const handleCreateEstimate = () => {
    toast({ title: 'Создание сметы', description: 'Функция в разработке' });
  };

  if (works.length === 0) {
    return <NoWorksEmptyState objectId={objectId} />;
  }

  if (!selectedWork) {
    return <NoWorkSelectedEmptyState />;
  }

  const userRole: UserRole = user?.role || 'contractor';
  const contractors = (userData?.contractors && Array.isArray(userData.contractors)) ? userData.contractors : [];

  const selectedWorkData = works.find(w => w.id === selectedWork);
  const workEntries = workLogs
    .filter(log => log.work_id === selectedWork)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Сегодня';
    if (diffDays === 1) return 'Вчера';
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const workEntryEvents: JournalEvent[] = workEntries.map(log => {
    const isWorkStart = log.is_work_start === true;
    const isInspectionStart = log.is_inspection_start === true;
    const isInspectionCompleted = log.is_inspection_completed === true;
    
    let eventType: EventType = 'work_entry';
    if (isWorkStart) eventType = 'work_start';
    else if (isInspectionStart) eventType = 'inspection_started';
    else if (isInspectionCompleted) eventType = 'inspection_completed';
    
    return {
      id: log.id,
      type: eventType,
      work_id: log.work_id,
      created_by: log.created_by,
      author_name: log.author_name,
      author_role: (log.author_role || 'contractor') as UserRole,
      created_at: log.created_at,
      content: log.description,
      work_data: {
        volume: log.volume,
        unit: log.unit,
        materials: log.materials ? log.materials.split(',').map(m => m.trim()) : [],
        photos: log.photo_urls ? log.photo_urls.split(',').filter(url => url.trim()) : [],
        progress: log.progress,
        completion_percentage: log.completion_percentage,
      },
      inspection_data: (isInspectionStart || isInspectionCompleted) ? {
        inspection_id: log.inspection_id,
        inspection_number: log.inspection_number,
        defects_count: log.defects_count
      } : undefined,
    };
  });

  const chatEvents: JournalEvent[] = chatMessages
    .filter(msg => msg.work_id === selectedWork)
    .map(msg => ({
      id: `chat-${msg.id}`,
      type: 'chat_message' as const,
      work_id: msg.work_id,
      created_by: msg.created_by,
      author_name: msg.author_name,
      author_role: (msg.author_role || 'contractor') as UserRole,
      created_at: msg.created_at,
      content: msg.message,
    }));

  const inspectionEvents: JournalEvent[] = inspections
    .filter(insp => insp.work_id === selectedWork)
    .map(insp => {
      const isCreatedStatus = insp.status === 'draft' || insp.status === 'active';
      const defectsArray = insp.defects ? JSON.parse(insp.defects) : [];
      return {
        id: insp.id,
        type: (isCreatedStatus ? 'inspection_created' : 'inspection') as const,
        work_id: insp.work_id,
        created_by: insp.created_by,
        author_name: insp.author_name,
        author_role: (insp.author_role || 'client') as UserRole,
        created_at: insp.created_at,
        content: insp.description || (insp.title ? `${insp.title}` : 'Проверка создана'),
        inspection_data: {
          inspection_id: insp.id,
          inspection_number: insp.inspection_number,
          status: insp.status,
          scheduled_date: insp.scheduled_date,
          defects: defectsArray,
          defects_count: defectsArray.length,
          photos: insp.photo_urls ? insp.photo_urls.split(',').filter(url => url.trim()) : [],
          work_log_id: insp.work_log_id,
        },
      };
    });

  const mockEvents: JournalEvent[] = [...workEntryEvents, ...chatEvents, ...inspectionEvents]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  
  console.log('DEBUG WorkJournal:', {
    selectedWork,
    chatMessages: chatMessages.length,
    chatEvents: chatEvents.length,
    workEntryEvents: workEntryEvents.length,
    inspectionEvents: inspectionEvents.length,
    mockEvents: mockEvents.length
  });

  return (
    <div className="flex flex-col h-full bg-white overflow-x-hidden">


      <div className="flex flex-1 min-h-0">
        <WorksList
          works={works}
          workLogs={workLogs}
          selectedWork={selectedWork}
          setSelectedWork={handleWorkSelect}
          getInitials={getInitials}
          formatTime={formatTime}
          objectId={objectId}
        />

        <div className="flex-1 flex flex-col bg-slate-50 min-w-0">
          {selectedWorkData ? (
            <>
              <WorkHeader
                selectedWorkData={selectedWorkData}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                organizationName={currentObject?.title}
                userRole={userRole}
                onEdit={() => handlers.handleEditClick(selectedWorkData)}
                unreadMessages={unreadCounts[selectedWork]?.messages}
                unreadLogs={unreadCounts[selectedWork]?.logs}
                unreadInspections={unreadCounts[selectedWork]?.inspections}
              />

              <div className="flex-1 flex flex-col min-h-0 w-full overflow-x-hidden">
                {activeTab === 'journal' && (
                  <>
                    <JournalTabContent
                      mockEvents={mockEvents}
                      userId={user?.id}
                      userRole={userRole}
                      newMessage={handlers.newMessage}
                      setNewMessage={handlers.setNewMessage}
                      isSubmitting={handlers.isSubmitting}
                      handleSendMessage={handlers.handleSendMessage}
                      handleCreateInspectionClick={handlers.handleCreateInspectionClick}
                      setIsWorkReportModalOpen={handlers.setIsWorkReportModalOpen}
                      setIsInspectionModalOpen={handlers.setIsInspectionModalOpen}
                      formatDate={formatDate}
                      formatTime={formatTime}
                      getInitials={getInitials}
                      selectedWorkData={selectedWorkData}
                      onWorkStartNotified={() => {
                        toast({ title: 'Успешно', description: 'Уведомление о начале работ отправлено' });
                      }}
                    />
                  </>
                )}

                {activeTab === 'info' && (
                  <InfoTab
                    selectedWorkData={selectedWorkData}
                    workEntries={workEntries}
                    formatDate={formatDate}
                    formatTime={formatTime}
                    handleCreateInspection={() => handlers.setIsInspectionModalOpen(true)}
                  />
                )}

                {activeTab === 'description' && (
                  <DescriptionTab selectedWorkData={selectedWorkData} />
                )}

                {activeTab === 'estimate' && (
                  <EstimateTab handleCreateEstimate={handleCreateEstimate} />
                )}

                {activeTab === 'analytics' && (
                  <AnalyticsTab workId={selectedWork || 0} />
                )}
              </div>

              <CreateInspectionSimple
                isOpen={handlers.isInspectionModalOpen}
                onClose={() => handlers.setIsInspectionModalOpen(false)}
                workId={selectedWork}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center px-4">
                <Icon name="MessageSquare" size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500 text-sm">Выберите работу для просмотра журнала</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <WorkReportModal
        isOpen={handlers.isWorkReportModalOpen}
        onClose={() => handlers.setIsWorkReportModalOpen(false)}
        onSubmit={handlers.handleWorkReportSubmit}
        isSubmitting={handlers.isSubmitting}
        currentCompletion={selectedWorkData?.completion_percentage || 0}
      />

      <WorkEditDialog
        isOpen={handlers.isEditDialogOpen}
        onClose={() => handlers.setIsEditDialogOpen(false)}
        onSubmit={() => handlers.handleEditSubmit(selectedWorkData)}
        onDelete={() => handlers.handleDeleteWork(selectedWorkData, () => {
          const isMobile = window.innerWidth < 768;
          
          if (isMobile) {
            navigate(`/objects/${objectId}`);
          } else {
            const remainingWorks = works.filter(w => w.id !== selectedWork);
            if (remainingWorks.length > 0) {
              navigate(`/objects/${objectId}/works/${remainingWorks[0].id}`);
            } else {
              navigate(`/objects/${objectId}`);
            }
          }
        })}
        formData={handlers.editFormData}
        setFormData={handlers.setEditFormData}
        contractors={contractors}
        isSubmitting={handlers.isSubmitting}
        canDelete={user?.role === 'admin' || user?.role === 'client'}
      />
    </div>
  );
}