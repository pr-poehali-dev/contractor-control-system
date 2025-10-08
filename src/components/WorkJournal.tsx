import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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

  const mockEstimate = [
    { name: 'Материалы', quantity: '100 кг', price: '50 000 ₽', total: '50 000 ₽' },
    { name: 'Работа', quantity: '20 часов', price: '2 000 ₽/час', total: '40 000 ₽' },
    { name: 'Доставка', quantity: '1', price: '10 000 ₽', total: '10 000 ₽' },
  ];

  const mockSubtasks = [
    { id: 1, title: 'Подготовка основания', status: 'completed', assignee: 'Иван П.' },
    { id: 2, title: 'Укладка материала', status: 'active', assignee: 'Петр И.' },
    { id: 3, title: 'Финишная отделка', status: 'pending', assignee: 'Сергей М.' },
  ];

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
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {work.status === 'active' ? '🟢 В работе' : work.status === 'completed' ? '✅ Готово' : '🟡 Ожидание'}
                            </Badge>
                            <span className="flex items-center gap-1 text-xs text-slate-500">
                              <Icon name="MessageSquare" size={12} />
                              {logs.length}
                            </span>
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

        {/* Правая панель - вкладки с чатом и прочим */}
        <div className="flex-1 flex flex-col bg-slate-50">
          {selectedWorkData ? (
            <>
              {/* Хедер работы */}
              <div className="bg-white border-b border-slate-200 px-3 md:px-6 pt-3 md:pt-4 pb-0">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1 min-w-0 mr-3">
                    <h2 className="text-base md:text-xl font-bold truncate">{selectedWorkData.title}</h2>
                    {selectedWorkData.contractor_name && (
                      <p className="text-xs md:text-sm text-slate-600 truncate flex items-center gap-1 mt-1">
                        <Icon name="User" size={14} />
                        {selectedWorkData.contractor_name}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <Icon name="Search" size={18} />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Icon name="Star" size={18} />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Icon name="Bell" size={18} />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Icon name="MoreVertical" size={18} />
                    </Button>
                  </div>
                </div>

                {/* Вкладки */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="w-full justify-start bg-transparent border-b-0 h-auto p-0 gap-4">
                    <TabsTrigger 
                      value="chat" 
                      className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none pb-2"
                    >
                      Chat
                    </TabsTrigger>
                    <TabsTrigger 
                      value="info" 
                      className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none pb-2"
                    >
                      Info / Log
                    </TabsTrigger>
                    <TabsTrigger 
                      value="description" 
                      className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none pb-2"
                    >
                      Description
                    </TabsTrigger>
                    <TabsTrigger 
                      value="subtasks" 
                      className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none pb-2"
                    >
                      Subtasks
                    </TabsTrigger>
                    <TabsTrigger 
                      value="estimate" 
                      className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none pb-2"
                    >
                      Estimate
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Контент вкладок */}
              <div className="flex-1 overflow-hidden">
                <Tabs value={activeTab} className="h-full flex flex-col">
                  {/* Вкладка Chat */}
                  <TabsContent value="chat" className="flex-1 flex flex-col mt-0 overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-3 md:p-6">
                      {workEntries.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full">
                          <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                            <Icon name="MessageSquare" size={40} className="text-blue-400" />
                          </div>
                          <p className="text-slate-500 text-sm mb-2">No messages in this chat yet</p>
                          <p className="text-slate-400 text-xs">Start conversation</p>
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
                                    <div className="bg-slate-200 text-slate-600 text-xs px-3 py-1 rounded-full font-medium">
                                      {formatDate(entry.created_at)}
                                    </div>
                                  </div>
                                )}

                                <div className={cn('flex gap-3', isOwn && 'flex-row-reverse')}>
                                  <Avatar className="w-10 h-10 flex-shrink-0">
                                    <AvatarFallback className={isOwn ? 'bg-blue-500 text-white text-xs' : 'bg-slate-300 text-slate-700 text-xs'}>
                                      {getInitials(entry.author_name)}
                                    </AvatarFallback>
                                  </Avatar>

                                  <div className={cn('max-w-[70%]', isOwn && 'items-end')}>
                                    <div className={cn('mb-1', isOwn && 'text-right')}>
                                      <span className="text-sm font-semibold text-slate-900">{entry.author_name}</span>
                                    </div>

                                    <Card className={cn('border-none shadow-sm', isOwn ? 'bg-blue-50' : 'bg-white')}>
                                      <CardContent className="p-3">
                                        <p className="text-sm text-slate-800 whitespace-pre-wrap break-words">{entry.description}</p>
                                        {entry.progress !== null && (
                                          <div className="mt-3">
                                            <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                                              <span>Прогресс</span>
                                              <span className="font-semibold">{entry.progress}%</span>
                                            </div>
                                            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                              <div 
                                                className="h-full bg-blue-500 transition-all"
                                                style={{ width: `${entry.progress}%` }}
                                              />
                                            </div>
                                          </div>
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
                      <div className="mb-2">
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
                        <Button variant="ghost" size="icon" className="flex-shrink-0">
                          <Icon name="Paperclip" size={18} />
                        </Button>
                        <Textarea
                          placeholder="Write message"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          className="resize-none text-sm flex-1"
                          rows={1}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                        />
                        <Button variant="ghost" size="icon" className="flex-shrink-0">
                          <Icon name="Smile" size={18} />
                        </Button>
                        <Button variant="ghost" size="icon" className="flex-shrink-0">
                          <Icon name="Image" size={18} />
                        </Button>
                        <Button variant="ghost" size="icon" className="flex-shrink-0">
                          <Icon name="Video" size={18} />
                        </Button>
                        <Button 
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim() || isSubmitting}
                          size="icon"
                          className="flex-shrink-0"
                        >
                          {isSubmitting ? (
                            <Icon name="Loader2" size={18} className="animate-spin" />
                          ) : (
                            <Icon name="Send" size={18} />
                          )}
                        </Button>
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                        <span>Chat participants:</span>
                        <div className="flex items-center gap-1">
                          <Avatar className="w-5 h-5">
                            <AvatarFallback className="bg-blue-500 text-white text-[10px]">
                              {user ? getInitials(user.name) : 'U'}
                            </AvatarFallback>
                          </Avatar>
                          {selectedWorkData.contractor_name && (
                            <Avatar className="w-5 h-5">
                              <AvatarFallback className="bg-green-500 text-white text-[10px]">
                                {getInitials(selectedWorkData.contractor_name)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                        <Button variant="link" className="text-blue-600 h-auto p-0 text-xs">
                          Unsubscribe
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Вкладка Info / Log */}
                  <TabsContent value="info" className="flex-1 overflow-y-auto p-3 md:p-6 mt-0">
                    <div className="max-w-3xl">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold">Информация и история</h3>
                        <Button size="sm" onClick={handleCreateInspection}>
                          <Icon name="Plus" size={16} className="mr-1" />
                          Создать проверку
                        </Button>
                      </div>

                      <div className="space-y-4">
                        <Card>
                          <CardContent className="p-4">
                            <h4 className="font-semibold mb-3">Детали работы</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-slate-600">Статус:</span>
                                <Badge>
                                  {selectedWorkData.status === 'active' ? '🟢 В работе' : selectedWorkData.status === 'completed' ? '✅ Готово' : '🟡 Ожидание'}
                                </Badge>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-600">Подрядчик:</span>
                                <span className="font-medium">{selectedWorkData.contractor_name || 'Не назначен'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-600">Создано:</span>
                                <span className="font-medium">{formatDate(selectedWorkData.created_at)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-600">Записей в журнале:</span>
                                <span className="font-medium">{workEntries.length}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="p-4">
                            <h4 className="font-semibold mb-3">История изменений</h4>
                            <div className="space-y-3">
                              <div className="flex gap-3 pb-3 border-b border-slate-100 last:border-b-0">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5" />
                                <div className="flex-1">
                                  <p className="text-sm font-medium">Работа создана</p>
                                  <p className="text-xs text-slate-500">{formatDate(selectedWorkData.created_at)} в {formatTime(selectedWorkData.created_at)}</p>
                                </div>
                              </div>
                              {workEntries.slice(0, 5).map((entry) => (
                                <div key={entry.id} className="flex gap-3 pb-3 border-b border-slate-100 last:border-b-0">
                                  <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5" />
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">{entry.author_name} добавил запись</p>
                                    <p className="text-xs text-slate-600 mt-1">{entry.description.slice(0, 80)}...</p>
                                    <p className="text-xs text-slate-500 mt-1">{formatDate(entry.created_at)} в {formatTime(entry.created_at)}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Вкладка Description */}
                  <TabsContent value="description" className="flex-1 overflow-y-auto p-3 md:p-6 mt-0">
                    <div className="max-w-3xl">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold">Описание работы</h3>
                        <Button size="sm" variant="outline">
                          <Icon name="Edit" size={16} className="mr-1" />
                          Редактировать
                        </Button>
                      </div>

                      <Card>
                        <CardContent className="p-6">
                          <div className="prose prose-sm max-w-none">
                            <h4 className="font-semibold mb-2">{selectedWorkData.title}</h4>
                            <p className="text-slate-600 mb-4">
                              Полное техническое описание работы, требования к выполнению, стандарты качества и прочая важная информация.
                            </p>
                            
                            <h5 className="font-semibold mt-4 mb-2">Требования:</h5>
                            <ul className="list-disc list-inside text-slate-600 space-y-1">
                              <li>Соблюдение технологических норм</li>
                              <li>Использование сертифицированных материалов</li>
                              <li>Ежедневная отчетность в журнале</li>
                              <li>Фото-фиксация этапов работы</li>
                            </ul>

                            <h5 className="font-semibold mt-4 mb-2">Сроки выполнения:</h5>
                            <p className="text-slate-600">
                              Работа должна быть завершена в течение 14 рабочих дней с момента начала.
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  {/* Вкладка Subtasks */}
                  <TabsContent value="subtasks" className="flex-1 overflow-y-auto p-3 md:p-6 mt-0">
                    <div className="max-w-3xl">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold">Подзадачи ({mockSubtasks.length})</h3>
                        <Button size="sm" onClick={handleAddSubtask}>
                          <Icon name="Plus" size={16} className="mr-1" />
                          Добавить подзадачу
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {mockSubtasks.map((subtask) => (
                          <Card key={subtask.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <div className="pt-1">
                                  {subtask.status === 'completed' ? (
                                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                                      <Icon name="Check" size={14} className="text-green-600" />
                                    </div>
                                  ) : subtask.status === 'active' ? (
                                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                                      <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />
                                    </div>
                                  ) : (
                                    <div className="w-5 h-5 bg-slate-200 rounded-full" />
                                  )}
                                </div>
                                
                                <div className="flex-1">
                                  <div className="flex items-start justify-between gap-2">
                                    <h4 className={cn(
                                      'font-medium text-sm',
                                      subtask.status === 'completed' && 'line-through text-slate-500'
                                    )}>
                                      {subtask.title}
                                    </h4>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 -mt-1">
                                      <Icon name="MoreVertical" size={14} />
                                    </Button>
                                  </div>
                                  
                                  <div className="flex items-center gap-3 mt-2">
                                    <Badge variant="outline" className="text-xs">
                                      {subtask.status === 'completed' ? '✅ Готово' : subtask.status === 'active' ? '🟢 В работе' : '🟡 Ожидание'}
                                    </Badge>
                                    <div className="flex items-center gap-1 text-xs text-slate-600">
                                      <Icon name="User" size={12} />
                                      {subtask.assignee}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-900">
                          💡 <strong>Подсказка:</strong> Разбивайте большие работы на подзадачи для лучшего контроля прогресса
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Вкладка Estimate */}
                  <TabsContent value="estimate" className="flex-1 overflow-y-auto p-3 md:p-6 mt-0">
                    <div className="max-w-4xl">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold">Смета</h3>
                        <Button size="sm" onClick={handleCreateEstimate}>
                          <Icon name="Plus" size={16} className="mr-1" />
                          Создать смету
                        </Button>
                      </div>

                      <Card>
                        <CardContent className="p-0">
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                  <th className="text-left p-3 text-sm font-semibold text-slate-700">Наименование</th>
                                  <th className="text-left p-3 text-sm font-semibold text-slate-700">Количество</th>
                                  <th className="text-left p-3 text-sm font-semibold text-slate-700">Цена</th>
                                  <th className="text-right p-3 text-sm font-semibold text-slate-700">Итого</th>
                                  <th className="w-10"></th>
                                </tr>
                              </thead>
                              <tbody>
                                {mockEstimate.map((item, index) => (
                                  <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                                    <td className="p-3 text-sm">{item.name}</td>
                                    <td className="p-3 text-sm text-slate-600">{item.quantity}</td>
                                    <td className="p-3 text-sm text-slate-600">{item.price}</td>
                                    <td className="p-3 text-sm font-semibold text-right">{item.total}</td>
                                    <td className="p-3">
                                      <Button variant="ghost" size="icon" className="h-6 w-6">
                                        <Icon name="MoreVertical" size={14} />
                                      </Button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot className="bg-slate-50 border-t-2 border-slate-300">
                                <tr>
                                  <td colSpan={3} className="p-3 text-sm font-semibold">Итого:</td>
                                  <td className="p-3 text-base font-bold text-right">100 000 ₽</td>
                                  <td></td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        </CardContent>
                      </Card>

                      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Icon name="Calculator" size={20} className="text-blue-600" />
                              </div>
                              <div>
                                <p className="text-xs text-slate-600">Бюджет</p>
                                <p className="text-lg font-bold">100 000 ₽</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <Icon name="TrendingDown" size={20} className="text-green-600" />
                              </div>
                              <div>
                                <p className="text-xs text-slate-600">Потрачено</p>
                                <p className="text-lg font-bold">45 000 ₽</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Icon name="Wallet" size={20} className="text-purple-600" />
                              </div>
                              <div>
                                <p className="text-xs text-slate-600">Остаток</p>
                                <p className="text-lg font-bold">55 000 ₽</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
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
