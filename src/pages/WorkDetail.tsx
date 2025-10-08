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
import type { JournalEvent, UserRole } from '@/types/journal';

const WorkDetail = () => {
  const { projectId, objectId, workId } = useParams();
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const { toast } = useToast();
  
  const [newMessage, setNewMessage] = useState('');
  const [progress, setProgress] = useState('0');
  const [volume, setVolume] = useState('');
  const [materials, setMaterials] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInspectionModalOpen, setIsInspectionModalOpen] = useState(false);
  const [selectedEntryForInspection, setSelectedEntryForInspection] = useState<number | undefined>();

  const works = userData?.works || [];
  const workLogs = userData?.workLogs || [];
  const sites = userData?.sites || [];
  const projects = userData?.projects || [];

  const work = works.find(w => w.id === Number(workId));
  const site = sites.find(s => s.id === Number(objectId));
  const project = projects.find(p => p.id === Number(projectId));

  const userRole: UserRole = user?.role || 'contractor';

  const mockEvents: JournalEvent[] = [
    {
      id: 1,
      type: 'work_entry',
      work_id: Number(workId),
      created_by: 1,
      author_name: 'Иван Петров',
      author_role: 'contractor',
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      content: 'Выполнена кирпичная кладка первого этажа. Уложено 500 кирпичей.',
      work_data: {
        volume: 50,
        unit: 'м²',
        materials: ['Кирпич керамический М150', 'Раствор цементный М100'],
        photos: [],
        progress: 25,
      }
    },
    {
      id: 2,
      type: 'inspection_created',
      work_id: Number(workId),
      created_by: 2,
      author_name: 'Система',
      author_role: 'customer',
      created_at: new Date(Date.now() - 86400000 * 1.5).toISOString(),
      content: 'Проверка кирпичной кладки первого этажа',
      inspection_data: {
        inspection_id: 1,
        inspection_number: '001',
        status: 'completed',
      }
    },
    {
      id: 3,
      type: 'defect_added',
      work_id: Number(workId),
      created_by: 2,
      author_name: 'Алексей Смирнов',
      author_role: 'customer',
      created_at: new Date(Date.now() - 86400000 * 1.4).toISOString(),
      defect_data: {
        defect_id: 1,
        inspection_id: 1,
        inspection_number: '001',
        description: 'Толщина горизонтальных швов превышает норму. Обнаружены участки с толщиной 15-18 мм.',
        standard_reference: 'СНиП 3.03.01-87, п. 4.5 (допустимо 12 мм)',
        photos: [],
        status: 'open',
      }
    },
    {
      id: 4,
      type: 'chat_message',
      work_id: Number(workId),
      created_by: 1,
      author_name: 'Иван Петров',
      author_role: 'contractor',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      content: 'Принято к сведению. Исправим в течение 2 дней.',
    },
    {
      id: 5,
      type: 'inspection_completed',
      work_id: Number(workId),
      created_by: 2,
      author_name: 'Система',
      author_role: 'customer',
      created_at: new Date(Date.now() - 86400000 * 0.5).toISOString(),
      content: 'Повторная проверка после устранения замечаний',
      inspection_data: {
        inspection_id: 2,
        inspection_number: '002',
        status: 'completed',
        defects_count: 0,
      }
    },
  ];

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

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-4 md:px-6 py-3 md:py-4 flex-shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <Button 
              variant="ghost" 
              size="icon"
              className="flex-shrink-0 mt-1"
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
          <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-10 bg-slate-50">
            {mockEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                  <Icon name="MessageSquare" size={40} className="text-blue-400" />
                </div>
                <p className="text-slate-500 text-base mb-2">Записей пока нет</p>
                <p className="text-slate-400 text-sm">Начните вести журнал работ</p>
              </div>
            ) : (
              <div className="max-w-6xl mx-auto space-y-8">
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
                          <SelectItem value="0">0% - Не начато</SelectItem>
                          <SelectItem value="25">25%</SelectItem>
                          <SelectItem value="50">50%</SelectItem>
                          <SelectItem value="75">75%</SelectItem>
                          <SelectItem value="100">100% - Завершено</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Input
                    placeholder="Материалы (через запятую)"
                    value={materials}
                    onChange={(e) => setMaterials(e.target.value)}
                    className="text-base h-11"
                  />
                </>
              )}
              
              <div className="flex gap-3">
                <Textarea
                  placeholder={userRole === 'contractor' ? 'Описание выполненных работ...' : 'Написать сообщение...'}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="resize-none text-base flex-1"
                  rows={3}
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
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || isSubmitting}
                    size="icon"
                    className="h-10 w-10"
                  >
                    {isSubmitting ? (
                      <Icon name="Loader2" size={20} className="animate-spin" />
                    ) : (
                      <Icon name="Send" size={20} />
                    )}
                  </Button>
                </div>
              </div>
              <p className="text-sm text-slate-400">
                Enter — отправить, Shift+Enter — новая строка
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="info" className="flex-1 overflow-hidden mt-0">
          <InfoTab selectedWorkData={work} />
        </TabsContent>

        <TabsContent value="description" className="flex-1 overflow-hidden mt-0">
          <DescriptionTab selectedWorkData={work} />
        </TabsContent>

        <TabsContent value="estimate" className="flex-1 overflow-hidden mt-0">
          <EstimateTab handleCreateEstimate={() => {
            toast({
              title: 'Функция в разработке',
              description: 'Импорт сметы будет доступен в ноябре',
            });
          }} />
        </TabsContent>

        <TabsContent value="analytics" className="flex-1 overflow-hidden mt-0">
          <AnalyticsTab workId={Number(workId)} />
        </TabsContent>
      </Tabs>

      <CreateInspectionModal
        isOpen={isInspectionModalOpen}
        onClose={() => {
          setIsInspectionModalOpen(false);
          setSelectedEntryForInspection(undefined);
        }}
        onSubmit={handleInspectionSubmit}
        journalEntryId={selectedEntryForInspection}
        workType={work.title}
      />
    </div>
  );
};

export default WorkDetail;