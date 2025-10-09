import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import EventItem from '@/components/work-journal/EventItem';
import CreateInspectionModal from '@/components/work-journal/CreateInspectionModal';
import InfoTab from '@/components/work-journal/InfoTab';
import DescriptionTab from '@/components/work-journal/DescriptionTab';
import EstimateTab from '@/components/work-journal/EstimateTab';
import AnalyticsTab from '@/components/work-journal/AnalyticsTab';
import WorksList from '@/components/work-journal/WorksList';
import type { JournalEvent, UserRole } from '@/types/journal';
import { api } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

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
  const [showWorksList, setShowWorksList] = useState(false);

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
        <div className="bg-white border-b border-slate-200 px-4 md:px-6 py-3 md:py-4 flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <Button 
                variant="ghost" 
                size="icon"
                className="flex-shrink-0 mt-1 md:hidden"
                onClick={() => navigate(`/projects/${projectId}/objects/${objectId}`)}
              >
                <Icon name="ChevronLeft" size={24} />
              </Button>
              
              <div className="min-w-0 flex-1">
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 mb-1">{work.title}</h1>
                <p className="text-xs md:text-sm text-slate-500 mb-2">
                  <Icon name="MapPin" size={14} className="inline mr-1" />
                  {site?.title} • {project?.title}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={getStatusColor(work.status)}>
                    {getStatusLabel(work.status)}
                  </Badge>
                  {work.contractor_name && (
                    <span className="text-xs md:text-sm text-slate-600 flex items-center gap-1">
                      <Icon name="User" size={14} />
                      {work.contractor_name}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleEditClick}
            >
              <Icon name="Edit" size={16} className="mr-1" />
              Редактировать
            </Button>
          </div>
        </div>

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
            <div className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-12 bg-slate-50">
              {events.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                    <Icon name="MessageSquare" size={40} className="text-blue-400" />
                  </div>
                  <p className="text-slate-500 text-base mb-2">Записей пока нет</p>
                  <p className="text-slate-400 text-sm">Начните вести журнал работ</p>
                </div>
              ) : (
                <div className="max-w-7xl mx-auto space-y-10">
                  {events.map((event, index) => {
                    const showDateSeparator = index === 0 || 
                      formatDate(events[index - 1].created_at) !== formatDate(event.created_at);

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
                          onCreateInspection={handleCreateInspection}
                          formatTime={formatTime}
                          getInitials={getInitials}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-white border-t border-slate-200 p-4 md:p-5 lg:p-6 flex-shrink-0">
              <div className="max-w-6xl mx-auto space-y-4">
                {userRole === 'contractor' && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Input
                          placeholder="Объём (м², шт, кг...)"
                          value={volume}
                          onChange={(e) => setVolume(e.target.value)}
                          className="text-base h-11"
                        />
                      </div>
                      <div>
                        <Select value={progress} onValueChange={setProgress}>
                          <SelectTrigger className="text-base h-11">
                            <SelectValue placeholder="Прогресс" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">0%</SelectItem>
                            <SelectItem value="25">25%</SelectItem>
                            <SelectItem value="50">50%</SelectItem>
                            <SelectItem value="75">75%</SelectItem>
                            <SelectItem value="100">100%</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Input
                        placeholder="Материалы (через запятую)"
                        value={materials}
                        onChange={(e) => setMaterials(e.target.value)}
                        className="text-base h-11"
                      />
                    </div>
                  </>
                )}

                <div className="flex gap-2">
                  <Textarea
                    placeholder="Написать сообщение..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 min-h-[60px] text-base resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <div className="flex flex-col gap-2">
                    <Button variant="ghost" size="icon" className="h-10 w-10">
                      <Icon name="Paperclip" size={20} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-10 w-10">
                      <Icon name="Camera" size={20} />
                    </Button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleSendMessage}
                    disabled={isSubmitting || !newMessage.trim()}
                    className="flex-1"
                  >
                    <Icon name="Send" size={18} className="mr-2" />
                    Отправить
                  </Button>
                </div>
              </div>
            </div>
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

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать работу</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Название</Label>
              <Input
                id="edit-title"
                value={editFormData.title}
                onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Описание</Label>
              <Textarea
                id="edit-description"
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-contractor">Подрядчик</Label>
              <Select 
                value={editFormData.contractor_id} 
                onValueChange={(value) => setEditFormData({ ...editFormData, contractor_id: value })}
              >
                <SelectTrigger id="edit-contractor">
                  <SelectValue placeholder="Выберите подрядчика" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Без подрядчика</SelectItem>
                  {contractors.map((contractor) => (
                    <SelectItem key={contractor.id} value={contractor.id.toString()}>
                      {contractor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Статус</Label>
              <Select 
                value={editFormData.status} 
                onValueChange={(value) => setEditFormData({ ...editFormData, status: value })}
              >
                <SelectTrigger id="edit-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">В работе</SelectItem>
                  <SelectItem value="pending">Ожидание</SelectItem>
                  <SelectItem value="completed">Завершено</SelectItem>
                  <SelectItem value="on_hold">Приостановлено</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleEditSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                  Сохранение...
                </>
              ) : (
                'Сохранить'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkDetail;
