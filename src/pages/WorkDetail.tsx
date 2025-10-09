import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import CreateInspectionModal from '@/components/work-journal/CreateInspectionModal';
import InfoTab from '@/components/work-journal/InfoTab';
import DescriptionTab from '@/components/work-journal/DescriptionTab';
import EstimateTab from '@/components/work-journal/EstimateTab';
import AnalyticsTab from '@/components/work-journal/AnalyticsTab';
import WorksList from '@/components/work-journal/WorksList';
import WorkDetailHeader from '@/components/work-detail/WorkDetailHeader';
import WorkDetailJournal from '@/components/work-detail/WorkDetailJournal';
import WorkEditDialog from '@/components/work-detail/WorkEditDialog';
import type { JournalEvent, UserRole } from '@/types/journal';
import { api } from '@/lib/api';

const WorkDetail = () => {
  const { projectId, objectId, workId } = useParams();
  const navigate = useNavigate();
  const { user, userData, setUserData } = useAuth();
  const { toast } = useToast();
  
  const [newMessage, setNewMessage] = useState('');
  const [progress, setProgress] = useState('0');
  const [volume, setVolume] = useState('');
  const [materials, setMaterials] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInspectionModalOpen, setIsInspectionModalOpen] = useState(false);
  const [selectedEntryForInspection, setSelectedEntryForInspection] = useState<number | undefined>();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    contractor_id: '',
    status: 'active',
  });

  const works = userData?.works?.filter(w => w.object_id === Number(objectId)) || [];
  const workLogs = userData?.workLogs || [];
  const sites = userData?.sites || [];
  const projects = userData?.projects || [];
  const contractors = userData?.contractors || [];

  const work = works.find(w => w.id === Number(workId));
  const site = sites.find(s => s.id === Number(objectId));
  const project = projects.find(p => p.id === Number(projectId));

  const userRole: UserRole = user?.role || 'contractor';

  const events: JournalEvent[] = workLogs
    .filter(log => log.work_id === Number(workId))
    .map(log => ({
      id: log.id,
      type: 'work_entry' as const,
      work_id: log.work_id,
      created_by: log.created_by,
      author_name: log.author_name,
      author_role: log.author_role,
      created_at: log.created_at,
      content: log.description,
      work_data: {
        volume: log.volume ? parseFloat(log.volume) : undefined,
        unit: 'м²',
        materials: log.materials ? log.materials.split(',').map(m => m.trim()) : [],
        photos: log.photo_urls ? log.photo_urls.split(',') : [],
        progress: 0,
      }
    }))
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  if (!work) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <Button variant="ghost" onClick={() => navigate(`/projects/${projectId}/objects/${objectId}`)}>
          <Icon name="ChevronLeft" size={20} className="mr-2" />
          К работам объекта
        </Button>
        <div className="mt-8 text-center">
          <p className="text-slate-500">Работа не найдена</p>
        </div>
      </div>
    );
  }

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

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    setIsSubmitting(true);
    
    setTimeout(() => {
      toast({
        title: 'Запись добавлена',
        description: 'Новая запись в журнале создана',
      });
      setNewMessage('');
      setVolume('');
      setMaterials('');
      setProgress('0');
      setIsSubmitting(false);
    }, 500);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'В работе';
      case 'pending': return 'Ожидание';
      case 'completed': return 'Завершено';
      case 'on_hold': return 'Приостановлено';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'on_hold': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const handleCreateInspection = (eventId: number) => {
    setSelectedEntryForInspection(eventId);
    setIsInspectionModalOpen(true);
  };

  const handleInspectionSubmit = (data: any) => {
    console.log('Создание проверки:', data);
    toast({
      title: 'Проверка создана',
      description: 'Проверка успешно добавлена в журнал',
    });
  };

  const handleEditClick = () => {
    setEditFormData({
      title: work.title,
      description: work.description || '',
      contractor_id: work.contractor_id?.toString() || '',
      status: work.status,
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!user || !work) return;
    
    try {
      setIsSubmitting(true);
      await api.updateItem(user.id, 'work', work.id, {
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

  return (
    <div className="flex h-screen bg-slate-50">
      <WorksList
        works={works}
        workLogs={workLogs}
        selectedWork={Number(workId)}
        setSelectedWork={(id) => navigate(`/projects/${projectId}/objects/${objectId}/works/${id}`)}
        getInitials={getInitials}
        formatTime={formatTime}
        objectId={Number(objectId)}
      />

      <div className="flex flex-col flex-1 overflow-hidden">
        <WorkDetailHeader
          work={work}
          site={site}
          project={project}
          onBack={() => navigate(`/projects/${projectId}/objects/${objectId}`)}
          onEdit={handleEditClick}
          getStatusLabel={getStatusLabel}
          getStatusColor={getStatusColor}
          userRole={userRole}
        />

        <Tabs defaultValue="journal" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mx-4 md:mx-6 lg:mx-8 mt-3 md:mt-4">
            <TabsTrigger value="journal">
              <Icon name="MessageSquare" size={16} className="mr-2" />
              Журнал
            </TabsTrigger>
            <TabsTrigger value="info">
              <Icon name="Info" size={16} className="mr-2" />
              Информация
            </TabsTrigger>
            <TabsTrigger value="description">
              <Icon name="FileText" size={16} className="mr-2" />
              Описание
            </TabsTrigger>
            <TabsTrigger value="estimate">
              <Icon name="Calculator" size={16} className="mr-2" />
              Смета
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <Icon name="BarChart3" size={16} className="mr-2" />
              Аналитика
            </TabsTrigger>
          </TabsList>

          <TabsContent value="journal" className="flex-1 flex flex-col overflow-hidden mt-0">
            <WorkDetailJournal
              events={events}
              userRole={userRole}
              userId={user?.id}
              onCreateInspection={handleCreateInspection}
              onSendMessage={handleSendMessage}
              formatTime={formatTime}
              formatDate={formatDate}
              getInitials={getInitials}
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              progress={progress}
              setProgress={setProgress}
              volume={volume}
              setVolume={setVolume}
              materials={materials}
              setMaterials={setMaterials}
              isSubmitting={isSubmitting}
            />
          </TabsContent>

          <TabsContent value="info" className="flex-1 overflow-hidden mt-0">
            <InfoTab work={work} />
          </TabsContent>

          <TabsContent value="description" className="flex-1 overflow-hidden mt-0">
            <DescriptionTab work={work} />
          </TabsContent>

          <TabsContent value="estimate" className="flex-1 overflow-hidden mt-0">
            <EstimateTab work={work} />
          </TabsContent>

          <TabsContent value="analytics" className="flex-1 overflow-hidden mt-0">
            <AnalyticsTab work={work} workLogs={workLogs.filter(log => log.work_id === work.id)} />
          </TabsContent>
        </Tabs>
      </div>

      <CreateInspectionModal
        isOpen={isInspectionModalOpen}
        onClose={() => setIsInspectionModalOpen(false)}
        onSubmit={handleInspectionSubmit}
        workEntryId={selectedEntryForInspection}
      />

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
};

export default WorkDetail;