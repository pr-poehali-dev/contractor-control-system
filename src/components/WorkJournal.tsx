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
  const [showWorksList, setShowWorksList] = useState(false);

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

  const handleEditWork = () => {
    toast({ title: 'Редактирование работы', description: 'Функция в разработке' });
  };

  const handleDeleteWork = () => {
    if (!confirm('Удалить работу?')) return;
    toast({ title: 'Работа удалена' });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-280px)] md:h-[calc(100vh-200px)] bg-white rounded-lg overflow-hidden border border-slate-200">
      {/* Мобильный селектор работ */}
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
        {/* Десктоп: Левая панель - список работ */}
        <div className="hidden md:block w-80 bg-white border-r border-slate-200 flex-col">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-bold text-lg">Работы ({works.length})</h3>
          </div>

          <div className="flex-1 overflow-y-auto">
            {works.length === 0 ? (
              <div className="p-4 text-center text-slate-500">
                <p className="text-sm">Нет работ</p>
              </div>
            ) : (
              <div className="p-2">
                {works.map((work) => {
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
                          <Badge variant="outline" className="mt-1 text-xs">
                            {work.status === 'active' ? 'В работе' : work.status === 'completed' ? 'Готово' : 'Ожидание'}
                          </Badge>
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
              {/* Хедер работы */}
              <div className="bg-white border-b border-slate-200 p-3 md:p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0 mr-3">
                    <h2 className="text-base md:text-lg font-bold truncate">{selectedWorkData.title}</h2>
                    {selectedWorkData.contractor_name && (
                      <p className="text-xs md:text-sm text-slate-600 truncate">{selectedWorkData.contractor_name}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="text-xs">
                      {selectedWorkData.status === 'active' ? 'В работе' : selectedWorkData.status === 'completed' ? 'Готово' : 'Ожидание'}
                    </Badge>
                    {user?.role === 'client' && (
                      <Button variant="ghost" size="sm" onClick={handleEditWork}>
                        <Icon name="MoreVertical" size={16} />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Чат */}
              <div className="flex-1 overflow-y-auto p-3 md:p-4">
                {workEntries.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <Icon name="MessageSquare" size={48} className="text-slate-300 mb-4" />
                    <p className="text-slate-500 text-sm">Записей пока нет</p>
                  </div>
                ) : (
                  <div className="space-y-3 md:space-y-4">
                    {workEntries.map((entry, index) => {
                      const isOwn = entry.created_by === user?.id;
                      const showDate = index === workEntries.length - 1 || 
                        formatDate(workEntries[index + 1].created_at) !== formatDate(entry.created_at);

                      return (
                        <div key={entry.id}>
                          {showDate && (
                            <div className="flex justify-center my-3">
                              <div className="bg-slate-200 text-slate-600 text-xs px-3 py-1 rounded-full">
                                {formatDate(entry.created_at)}
                              </div>
                            </div>
                          )}

                          <div className={cn('flex gap-2 md:gap-3', isOwn && 'flex-row-reverse')}>
                            <Avatar className="w-8 h-8 md:w-10 md:h-10 flex-shrink-0">
                              <AvatarFallback className={isOwn ? 'bg-blue-100 text-blue-700 text-xs' : 'bg-slate-100 text-slate-700 text-xs'}>
                                {getInitials(entry.author_name)}
                              </AvatarFallback>
                            </Avatar>

                            <div className={cn('max-w-[75%] md:max-w-[70%]', isOwn && 'items-end')}>
                              <div className={cn('mb-1', isOwn && 'text-right')}>
                                <span className="text-xs md:text-sm font-semibold">{entry.author_name}</span>
                              </div>

                              <Card className={cn('border-none shadow-sm', isOwn ? 'bg-blue-50' : 'bg-white')}>
                                <CardContent className="p-2 md:p-3">
                                  <p className="text-xs md:text-sm whitespace-pre-wrap break-words">{entry.description}</p>
                                  {entry.progress !== null && (
                                    <Badge variant="outline" className="mt-2 text-xs">
                                      Прогресс: {entry.progress}%
                                    </Badge>
                                  )}
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

              {/* Форма ввода */}
              <div className="bg-white border-t border-slate-200 p-3 md:p-4">
                <div className="mb-2 md:mb-3">
                  <Select value={progress} onValueChange={setProgress}>
                    <SelectTrigger className="h-9 text-sm">
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
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Написать..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="resize-none text-sm"
                    rows={2}
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
                    className="self-end h-9 w-9 flex-shrink-0"
                  >
                    {isSubmitting ? (
                      <Icon name="Loader2" size={18} className="animate-spin" />
                    ) : (
                      <Icon name="Send" size={18} />
                    )}
                  </Button>
                </div>
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
