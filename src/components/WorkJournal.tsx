import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
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
import EventItem from '@/components/work-journal/EventItem';
import CreateInspectionModal from '@/components/work-journal/CreateInspectionModal';
import WorkEditDialog from '@/components/work-detail/WorkEditDialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { JournalEvent, UserRole } from '@/types/journal';

interface WorkJournalProps {
  objectId: number;
  selectedWorkId?: number;
}

export default function WorkJournal({ objectId, selectedWorkId }: WorkJournalProps) {
  const { user, userData, setUserData } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { projectId } = useParams();

  const works = (userData?.works || []).filter(w => w.object_id === objectId);
  const workLogs = userData?.workLogs || [];
  const sites = userData?.sites || [];
  const projects = userData?.projects || [];
  
  const currentSite = sites.find(s => s.id === objectId);
  const currentProject = currentSite ? projects.find(p => p.id === currentSite.project_id) : null;

  const selectedWork = selectedWorkId || works[0]?.id || null;
  
  const handleWorkSelect = (workId: number) => {
    if (projectId) {
      navigate(`/projects/${projectId}/objects/${objectId}/works/${workId}`);
    }
  };

  // If no works, show empty state
  if (works.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Icon name="Briefcase" size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Пока нет работ</h3>
          <p className="text-slate-600 mb-6">Создайте первую работу для этого объекта</p>
          <Button onClick={() => projectId && navigate(`/projects/${projectId}/objects/${objectId}/works/create`)}>
            <Icon name="Plus" size={18} className="mr-2" />
            Создать работу
          </Button>
        </div>
      </div>
    );
  }

  if (!selectedWork) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">Работа не выбрана</p>
      </div>
    );
  }
  const [newMessage, setNewMessage] = useState('');
  const [progress, setProgress] = useState('0');
  const [volume, setVolume] = useState('');
  const [materials, setMaterials] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWorksList, setShowWorksList] = useState(false);
  const [activeTab, setActiveTab] = useState('journal');
  const [isInspectionModalOpen, setIsInspectionModalOpen] = useState(false);
  const [selectedEntryForInspection, setSelectedEntryForInspection] = useState<number | undefined>();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    contractor_id: '',
    status: 'active',
  });

  const userRole: UserRole = user?.role || 'contractor';
  const contractors = userData?.contractors || [];

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

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !selectedWork) return;
    
    setIsSubmitting(true);

    try {
      await api.createItem(user.id, 'work_log', {
        work_id: selectedWork,
        description: newMessage,
        progress: parseInt(progress),
        volume: volume || null,
        materials: materials || null,
      });

      const refreshedData = await api.getUserData(user.id);
      setUserData(refreshedData);
      localStorage.setItem('userData', JSON.stringify(refreshedData));

      toast({
        title: 'Запись добавлена',
        description: 'Новая запись в журнале создана',
      });

      setNewMessage('');
      setProgress('0');
      setVolume('');
      setMaterials('');
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить запись',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateInspectionClick = (eventId: number) => {
    setSelectedEntryForInspection(eventId);
    setIsInspectionModalOpen(true);
  };

  const handleInspectionSubmit = (data: any) => {
    console.log('Создание проверки:', data);
    toast({
      title: 'Проверка создана',
      description: 'Проверка успешно добавлена в журнал',
    });
    setIsInspectionModalOpen(false);
    setSelectedEntryForInspection(undefined);
  };

  const handleCreateEstimate = () => {
    toast({ title: 'Создание сметы', description: 'Функция в разработке' });
  };

  const handleEditClick = () => {
    if (!selectedWorkData) return;
    
    setEditFormData({
      title: selectedWorkData.title || '',
      description: selectedWorkData.description || '',
      contractor_id: selectedWorkData.contractor_id?.toString() || '',
      status: selectedWorkData.status || 'active',
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!user || !selectedWorkData) return;
    
    try {
      setIsSubmitting(true);
      await api.updateItem(user.id, 'work', selectedWorkData.id, {
        title: editFormData.title,
        description: editFormData.description,
        contractor_id: editFormData.contractor_id ? Number(editFormData.contractor_id) : null,
        status: editFormData.status,
      });

      const refreshedData = await api.getUserData(user.id);
      setUserData(refreshedData);
      localStorage.setItem('userData', JSON.stringify(refreshedData));

      toast({
        title: 'Работа обновлена',
        description: 'Изменения успешно сохранены',
      });
      setIsEditDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось обновить работу',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const mockEvents: JournalEvent[] = workEntries.map(log => ({
    id: log.id,
    type: 'work_entry' as const,
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
      photos: log.photo_urls ? log.photo_urls.split(',') : [],
      progress: log.progress,
    },
  }));



  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-white overflow-hidden border-t border-slate-200">
      <div className="md:hidden border-b border-slate-200 p-3">
        <Button 
          variant="outline" 
          className="w-full justify-between"
          onClick={() => setShowWorksList(!showWorksList)}
        >
          <span className="truncate">{selectedWorkData?.title || 'Выберите работу'}</span>
          <Icon name={showWorksList ? 'ChevronUp' : 'ChevronDown'} size={16} />
        </Button>

        {showWorksList && (
          <div className="mt-2 max-h-64 overflow-y-auto border rounded-lg">
            {works.map((work) => (
              <button
                key={work.id}
                onClick={() => {
                  handleWorkSelect(work.id);
                  setShowWorksList(false);
                }}
                className={cn(
                  'w-full text-left p-3 border-b last:border-b-0',
                  selectedWork === work.id ? 'bg-blue-50' : 'hover:bg-slate-50'
                )}
              >
                <div className="font-medium text-sm">{work.title}</div>
                <Badge variant="outline" className="mt-1 text-xs">
                  {work.status === 'active' ? 'В работе' : work.status === 'completed' ? 'Готово' : 'Ожидание'}
                </Badge>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        <WorksList
          works={works}
          workLogs={workLogs}
          selectedWork={selectedWork}
          setSelectedWork={handleWorkSelect}
          getInitials={getInitials}
          formatTime={formatTime}
          objectId={objectId}
        />

        <div className="flex-1 flex flex-col bg-slate-50">
          {selectedWorkData ? (
            <>
              <WorkHeader
                selectedWorkData={selectedWorkData}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                organizationName={currentProject?.client_name}
                userRole={userRole}
                onEdit={handleEditClick}
              />

              <div className="flex-1 flex flex-col overflow-hidden">
                {activeTab === 'journal' && (
                  <>
                    <div className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-12 bg-slate-50">
                      {mockEvents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full">
                          <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                            <Icon name="MessageSquare" size={40} className="text-blue-400" />
                          </div>
                          <p className="text-slate-500 text-base mb-2">Записей пока нет</p>
                          <p className="text-slate-400 text-sm">Начните вести журнал работ</p>
                        </div>
                      ) : (
                        <div className="max-w-7xl mx-auto space-y-10">
                          {mockEvents.map((event, index) => {
                            const showDateSeparator = index === 0 || 
                              formatDate(mockEvents[index - 1].created_at) !== formatDate(event.created_at);

                            return (
                              <div key={event.id}>
                                {showDateSeparator && (
                                  <div className="flex justify-center my-4">
                                    <div className="bg-slate-200 text-slate-600 text-xs px-3 py-1 rounded-full font-medium">
                                      {formatDate(event.created_at)}
                                    </div>
                                  </div>
                                )}

                                <EventItem
                                  event={event}
                                  isOwnEvent={event.created_by === user?.id}
                                  userRole={userRole}
                                  onCreateInspection={handleCreateInspectionClick}
                                  formatTime={formatTime}
                                  getInitials={getInitials}
                                />
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="bg-white border-t border-slate-200 p-4 flex-shrink-0">
                      <div className="max-w-4xl mx-auto">
                        <div className="flex gap-2 items-end">
                          <Textarea
                            placeholder="Написать сообщение..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            className="resize-none flex-1"
                            rows={2}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                              }
                            }}
                          />
                          <div className="flex gap-2">
                            <Button 
                              variant="outline"
                              onClick={() => setIsInspectionModalOpen(true)}
                              className="h-10"
                            >
                              <Icon name="FileText" size={18} className="mr-2" />
                              Отчёт
                            </Button>
                            <Button 
                              onClick={handleSendMessage}
                              disabled={!newMessage.trim() || isSubmitting}
                              className="h-10"
                            >
                              {isSubmitting ? (
                                <Icon name="Loader2" size={18} className="animate-spin" />
                              ) : (
                                <Icon name="Send" size={18} />
                              )}
                            </Button>
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 mt-2">
                          Enter — отправить, Shift+Enter — новая строка
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'info' && (
                  <InfoTab
                    selectedWorkData={selectedWorkData}
                    workEntries={workEntries}
                    formatDate={formatDate}
                    formatTime={formatTime}
                    handleCreateInspection={() => setIsInspectionModalOpen(true)}
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

              <CreateInspectionModal
                isOpen={isInspectionModalOpen}
                onClose={() => {
                  setIsInspectionModalOpen(false);
                  setSelectedEntryForInspection(undefined);
                }}
                onSubmit={handleInspectionSubmit}
                journalEntryId={selectedEntryForInspection}
                workType={selectedWorkData?.title}
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

      <WorkEditDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSubmit={handleEditSubmit}
        formData={editFormData}
        setFormData={setEditFormData}
        contractors={contractors}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}