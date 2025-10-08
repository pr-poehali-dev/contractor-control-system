import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface WorkJournalProps {
  objectId: number;
}

export default function WorkJournal({ objectId }: WorkJournalProps) {
  const { user, userData, setUserData } = useAuth();
  const { toast } = useToast();

  const works = (userData?.works || []).filter(w => w.object_id === objectId);
  const workLogs = userData?.workLogs || [];

  const [selectedWork, setSelectedWork] = useState(works[0]?.id || null);
  const [newMessage, setNewMessage] = useState('');
  const [progress, setProgress] = useState('0');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [workFilter, setWorkFilter] = useState<string>('all');

  const filteredWorks = works.filter(w => {
    if (workFilter === 'all') return true;
    return w.status === workFilter;
  });

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

  return (
    <div className="flex h-[calc(100vh-200px)] bg-slate-50 rounded-lg overflow-hidden border border-slate-200">
      {/* Левая панель - список работ */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-200">
          <h3 className="font-bold text-lg mb-3">Работы</h3>
          <Select value={workFilter} onValueChange={setWorkFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все ({works.length})</SelectItem>
              <SelectItem value="active">В работе ({works.filter(w => w.status === 'active').length})</SelectItem>
              <SelectItem value="completed">Завершено ({works.filter(w => w.status === 'completed').length})</SelectItem>
              <SelectItem value="pending">Ожидание ({works.filter(w => w.status === 'pending').length})</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredWorks.length === 0 ? (
            <div className="p-4 text-center text-slate-500">
              <p className="text-sm">Нет работ</p>
            </div>
          ) : (
            <div className="p-2">
              {filteredWorks.map((work) => {
                const logs = workLogs.filter(log => log.work_id === work.id);
                const lastLog = logs[0];
                
                return (
                  <button
                    key={work.id}
                    onClick={() => setSelectedWork(work.id)}
                    className={cn(
                      'w-full text-left p-3 rounded-lg mb-2 transition-colors',
                      selectedWork === work.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'hover:bg-slate-50'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="w-10 h-10 flex-shrink-0">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs font-semibold">
                          {getInitials(work.title)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-sm truncate">{work.title}</h4>
                          {lastLog && (
                            <span className="text-xs text-slate-400 ml-2">{formatTime(lastLog.created_at)}</span>
                          )}
                        </div>
                        {lastLog && (
                          <p className="text-xs text-slate-600 truncate">{lastLog.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {work.status === 'active' ? 'В работе' : work.status === 'completed' ? 'Завершено' : 'Ожидание'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Правая панель - чат */}
      <div className="flex-1 flex flex-col bg-slate-50">
        {selectedWorkData ? (
          <>
            <div className="bg-white border-b border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">{selectedWorkData.title}</h2>
                  {selectedWorkData.contractor_name && (
                    <p className="text-sm text-slate-600">{selectedWorkData.contractor_name}</p>
                  )}
                </div>
                <Badge>
                  {selectedWorkData.status === 'active' ? 'В работе' : selectedWorkData.status === 'completed' ? 'Завершено' : 'Ожидание'}
                </Badge>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {workEntries.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <Icon name="MessageSquare" size={48} className="text-slate-300 mb-4" />
                  <p className="text-slate-500">Записей пока нет</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {workEntries.map((entry, index) => {
                    const isOwn = entry.created_by === user?.id;
                    const showDate = index === workEntries.length - 1 || 
                      formatDate(workEntries[index + 1].created_at) !== formatDate(entry.created_at);

                    return (
                      <div key={entry.id}>
                        {showDate && (
                          <div className="flex justify-center my-4">
                            <div className="bg-slate-200 text-slate-600 text-xs px-3 py-1 rounded-full">
                              {formatDate(entry.created_at)}
                            </div>
                          </div>
                        )}

                        <div className={cn('flex gap-3', isOwn && 'flex-row-reverse')}>
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className={isOwn ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}>
                              {getInitials(entry.author_name)}
                            </AvatarFallback>
                          </Avatar>

                          <div className={cn('max-w-[70%]', isOwn && 'items-end')}>
                            <div className={cn('mb-1', isOwn && 'text-right')}>
                              <span className="text-sm font-semibold">{entry.author_name}</span>
                            </div>

                            <Card className={cn('border-none shadow-sm', isOwn ? 'bg-blue-50' : 'bg-white')}>
                              <CardContent className="p-3">
                                <p className="text-sm whitespace-pre-wrap">{entry.description}</p>
                                <div className={cn('mt-2 text-xs text-slate-400', isOwn && 'text-right')}>
                                  {formatTime(entry.created_at)}
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

            <div className="bg-white border-t border-slate-200 p-4">
              <div className="mb-3">
                <Select value={progress} onValueChange={setProgress}>
                  <SelectTrigger>
                    <SelectValue placeholder="Прогресс работ" />
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
              <div className="flex gap-3">
                <Textarea
                  placeholder="Написать в журнал..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="resize-none"
                  rows={3}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isSubmitting}
                  size="icon"
                  className="self-end"
                >
                  {isSubmitting ? (
                    <Icon name="Loader2" size={20} className="animate-spin" />
                  ) : (
                    <Icon name="Send" size={20} />
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Icon name="MessageSquare" size={64} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500">Выберите работу</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
