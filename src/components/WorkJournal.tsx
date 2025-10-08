import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

import WorksList from '@/components/work-journal/WorksList';
import WorkHeader from '@/components/work-journal/WorkHeader';
import ChatTab from '@/components/work-journal/ChatTab';
import InfoTab from '@/components/work-journal/InfoTab';
import DescriptionTab from '@/components/work-journal/DescriptionTab';
import SubtasksTab from '@/components/work-journal/SubtasksTab';
import EstimateTab from '@/components/work-journal/EstimateTab';

interface WorkJournalProps {
  objectId: number;
}

export default function WorkJournal({ objectId }: WorkJournalProps) {
  const { user, userData, setUserData } = useAuth();
  const { toast } = useToast();

  const works = (userData?.works || []).filter(w => w.object_id === objectId);
  const workLogs = userData?.workLogs || [];
  const sites = userData?.sites || [];
  const projects = userData?.projects || [];
  
  const currentSite = sites.find(s => s.id === objectId);
  const currentProject = currentSite ? projects.find(p => p.id === currentSite.project_id) : null;

  const [selectedWork, setSelectedWork] = useState(works[0]?.id || null);
  const [newMessage, setNewMessage] = useState('');
  const [progress, setProgress] = useState('0');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWorksList, setShowWorksList] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');

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

  const handleCreateEstimate = () => {
    toast({ title: 'Создание сметы', description: 'Функция в разработке' });
  };

  const handleCreateInspection = () => {
    toast({ title: 'Создание проверки', description: 'Функция в разработке' });
  };

  const handleAddSubtask = () => {
    toast({ title: 'Добавление подзадачи', description: 'Функция в разработке' });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-280px)] md:h-[calc(100vh-200px)] bg-white rounded-lg overflow-hidden border border-slate-200">
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
                  setSelectedWork(work.id);
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
          setSelectedWork={setSelectedWork}
          getInitials={getInitials}
          formatTime={formatTime}
        />

        <div className="flex-1 flex flex-col bg-slate-50">
          {selectedWorkData ? (
            <>
              <WorkHeader
                selectedWorkData={selectedWorkData}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                organizationName={currentProject?.client_name}
              />

              <div className="flex-1 overflow-hidden">
                {activeTab === 'chat' && (
                  <ChatTab
                    workEntries={workEntries}
                    user={user}
                    selectedWorkData={selectedWorkData}
                    newMessage={newMessage}
                    setNewMessage={setNewMessage}
                    progress={progress}
                    setProgress={setProgress}
                    isSubmitting={isSubmitting}
                    handleSendMessage={handleSendMessage}
                    getInitials={getInitials}
                    formatTime={formatTime}
                    formatDate={formatDate}
                  />
                )}

                {activeTab === 'info' && (
                  <InfoTab
                    selectedWorkData={selectedWorkData}
                    workEntries={workEntries}
                    formatDate={formatDate}
                    formatTime={formatTime}
                    handleCreateInspection={handleCreateInspection}
                  />
                )}

                {activeTab === 'description' && (
                  <DescriptionTab selectedWorkData={selectedWorkData} />
                )}

                {activeTab === 'subtasks' && (
                  <SubtasksTab handleAddSubtask={handleAddSubtask} />
                )}

                {activeTab === 'estimate' && (
                  <EstimateTab handleCreateEstimate={handleCreateEstimate} />
                )}
              </div>
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
    </div>
  );
}