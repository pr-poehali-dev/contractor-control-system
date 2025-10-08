import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const WorkDetail = () => {
  const { projectId, objectId, workId } = useParams();
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const { toast } = useToast();
  const [newMessage, setNewMessage] = useState('');

  const works = userData?.works || [];
  const workLogs = userData?.workLogs || [];
  const sites = userData?.sites || [];
  const projects = userData?.projects || [];

  const work = works.find(w => w.id === Number(workId));
  const site = sites.find(s => s.id === Number(objectId));
  const project = projects.find(p => p.id === Number(projectId));

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

  const workEntries = workLogs
    .filter(log => log.work_id === work.id)
    .map(log => ({
      id: log.id,
      authorId: log.created_by,
      authorName: log.author_name,
      content: log.description,
      timestamp: log.created_at,
      type: log.author_role === 'contractor' ? 'work' : 'message',
      materials: log.materials ? log.materials.split(',').map(m => m.trim()) : [],
      volume: log.volume,
      photos: log.photo_urls ? log.photo_urls.split(',') : [],
    }));

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

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    toast({
      title: 'Запись добавлена',
      description: 'Новая запись в журнале создана',
    });
    setNewMessage('');
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

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 p-4 md:p-6 flex-shrink-0">
        <Button 
          variant="ghost" 
          className="mb-4"
          onClick={() => navigate(`/projects/${projectId}/objects/${objectId}`)}
        >
          <Icon name="ChevronLeft" size={20} className="mr-2" />
          К работам объекта
        </Button>

        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">{work.title}</h1>
          <p className="text-sm text-slate-600 mb-3">
            {site?.title} • {project?.title}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={getStatusColor(work.status)}>
              {getStatusLabel(work.status)}
            </Badge>
            {work.contractor_name && (
              <span className="text-sm text-slate-600 flex items-center gap-1">
                <Icon name="User" size={14} />
                {work.contractor_name}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {workEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Icon name="MessageSquare" size={32} className="text-slate-300" />
            </div>
            <p className="text-slate-500 text-lg mb-2">Записей пока нет</p>
            <p className="text-slate-400 text-sm">Добавьте первую запись в журнал работ</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            {workEntries.map((entry, index) => {
              const isOwnMessage = entry.authorId === user?.id;
              const showDateSeparator = index === 0 || 
                formatDate(workEntries[index - 1].timestamp) !== formatDate(entry.timestamp);

              return (
                <div key={entry.id}>
                  {showDateSeparator && (
                    <div className="flex items-center justify-center my-4">
                      <div className="bg-slate-200 text-slate-600 text-xs font-medium px-3 py-1 rounded-full">
                        {formatDate(entry.timestamp)}
                      </div>
                    </div>
                  )}

                  <div className={cn('flex gap-3', isOwnMessage && 'flex-row-reverse')}>
                    <Avatar className="w-10 h-10 flex-shrink-0">
                      <AvatarFallback className={cn(
                        'text-xs font-semibold',
                        isOwnMessage ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                      )}>
                        {getInitials(entry.authorName)}
                      </AvatarFallback>
                    </Avatar>

                    <div className={cn('flex-1 max-w-[75%]', isOwnMessage && 'flex flex-col items-end')}>
                      <div className={cn('mb-1', isOwnMessage && 'text-right')}>
                        <span className="text-sm font-semibold text-slate-900">{entry.authorName}</span>
                      </div>

                      <Card className={cn(
                        'border-none shadow-sm',
                        isOwnMessage ? 'bg-blue-50' : 'bg-white',
                        entry.type === 'work' && !isOwnMessage && 'border-l-4 border-l-green-500'
                      )}>
                        <CardContent className="p-3 md:p-4">
                          {entry.type === 'work' && (
                            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-200">
                              <Icon name="Wrench" size={16} className="text-green-600" />
                              <span className="text-xs font-semibold text-green-600">Отчёт о работе</span>
                            </div>
                          )}

                          <p className="text-sm md:text-base text-slate-900 whitespace-pre-wrap break-words leading-relaxed">
                            {entry.content}
                          </p>

                          {entry.volume && (
                            <div className="mt-3 pt-3 border-t border-slate-200">
                              <div className="flex items-center gap-2 text-sm text-slate-700">
                                <Icon name="Package" size={14} className="text-slate-400" />
                                <span className="font-medium">Объём:</span>
                                <span>{entry.volume}</span>
                              </div>
                            </div>
                          )}

                          {entry.materials && entry.materials.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-slate-200">
                              <div className="flex items-start gap-2 text-sm">
                                <Icon name="Box" size={14} className="text-slate-400 mt-0.5" />
                                <div className="flex-1">
                                  <p className="font-medium text-slate-700 mb-1">Материалы:</p>
                                  <ul className="space-y-1">
                                    {entry.materials.map((material, idx) => (
                                      <li key={idx} className="text-slate-600 text-xs md:text-sm pl-2">
                                        • {material}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          )}

                          {entry.photos && entry.photos.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-slate-200">
                              <div className="flex items-center gap-2 text-sm text-blue-600 cursor-pointer hover:text-blue-700">
                                <Icon name="Camera" size={14} />
                                <span>{entry.photos.length} {entry.photos.length === 1 ? 'фото' : 'фото'}</span>
                              </div>
                            </div>
                          )}

                          <div className={cn(
                            'mt-2 text-xs text-slate-400',
                            isOwnMessage && 'text-right'
                          )}>
                            {formatTime(entry.timestamp)}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-white border-t border-slate-200 p-4 md:p-6 flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <Textarea
              placeholder="Написать в журнал работ..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="min-h-[60px] md:min-h-[80px] resize-none text-sm md:text-base"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="self-end"
              size="icon"
              data-tour="add-log-btn"
            >
              <Icon name="Send" size={20} />
            </Button>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Enter — отправить, Shift+Enter — новая строка
          </p>
        </div>
      </div>
    </div>
  );
};

export default WorkDetail;
