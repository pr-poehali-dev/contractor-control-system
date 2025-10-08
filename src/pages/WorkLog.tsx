import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const WorkLog = () => {
  const { user, userData } = useAuth();
  const { toast } = useToast();
  const [newMessage, setNewMessage] = useState('');

  const logEntries = (userData?.workLogs || []).map(log => ({
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
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'только что';
    if (diffHours < 24) return `${diffHours} ч назад`;
    if (diffDays === 1) return 'вчера';
    if (diffDays < 7) return `${diffDays} д назад`;
    
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    toast({
      title: 'Запись добавлена',
      description: 'Новая запись в журнале создана',
    });
    setNewMessage('');
  };

  const handleMenuAction = (action: string) => {
    toast({
      title: action,
      description: 'Функция в разработке',
    });
  };

  const getMenuForEntry = (entry: typeof logEntries[0]) => {
    if (user?.role === 'client' && entry.type === 'work') {
      return [
        { label: 'Создать проверку', icon: 'ClipboardCheck' },
        { label: 'Добавить замечание', icon: 'MessageCircle' },
        { label: 'Просмотреть материалы', icon: 'Package' },
      ];
    }

    if (user?.role === 'contractor' && entry.authorId === user.id) {
      return [
        { label: 'Редактировать запись', icon: 'Edit' },
        { label: 'Добавить фото', icon: 'Camera' },
      ];
    }

    return [];
  };

  const MessageCard = ({ entry, isOwn }: { entry: typeof logEntries[0]; isOwn: boolean }) => (
    <CardContent className="p-3">
      <div className="flex items-start justify-between gap-2 mb-1">
        <p className="text-xs font-medium text-slate-600">
          {entry.authorName}
        </p>
        {entry.type === 'inspection' && (
          <Icon name="ClipboardCheck" size={14} className="text-green-600" />
        )}
        {entry.type === 'remark' && (
          <Icon name="AlertCircle" size={14} className="text-red-600" />
        )}
      </div>

      <p className="text-sm text-slate-900 whitespace-pre-wrap break-words">
        {entry.content}
      </p>

      {entry.materials && entry.materials.length > 0 && (
        <div className="mt-2 pt-2 border-t border-slate-200">
          <p className="text-xs text-slate-500 mb-1">Материалы:</p>
          {entry.materials.map((material, idx) => (
            <p key={idx} className="text-xs text-slate-600">• {material}</p>
          ))}
        </div>
      )}

      <p className="text-xs text-slate-400 mt-2">
        {formatTime(entry.timestamp)}
      </p>
    </CardContent>
  );

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-white border-b border-slate-200 p-4 md:p-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">Журнал</h1>
        <p className="text-sm text-slate-500">Все записи и проверки</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-32 md:pb-6">
        {logEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Icon name="FileText" size={48} className="text-slate-300 mb-4" />
            <p className="text-slate-500">Записей пока нет</p>
          </div>
        ) : (
          logEntries.map((entry) => {
            const menu = getMenuForEntry(entry);
            const isOwnMessage = entry.authorId === user?.id;

            return (
              <div
                key={entry.id}
                className={cn(
                  'flex gap-2',
                  isOwnMessage ? 'flex-row-reverse' : 'flex-row'
                )}
              >
                {menu.length > 0 ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div className={cn('max-w-[85%] md:max-w-[70%]', isOwnMessage ? 'ml-auto' : 'mr-auto')}>
                        <Card
                          className={cn(
                            'cursor-pointer transition-shadow hover:shadow-md',
                            isOwnMessage ? 'bg-blue-50' : 'bg-white',
                            entry.type === 'system' && 'bg-yellow-50 border-yellow-200',
                            entry.type === 'remark' && 'bg-red-50 border-red-200'
                          )}
                        >
                          <MessageCard entry={entry} isOwn={isOwnMessage} />
                        </Card>
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align={isOwnMessage ? 'end' : 'start'}>
                      {menu.map((item) => (
                        <DropdownMenuItem
                          key={item.label}
                          onClick={() => handleMenuAction(item.label)}
                        >
                          <Icon name={item.icon as any} size={16} className="mr-2" />
                          {item.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className={cn('max-w-[85%] md:max-w-[70%]', isOwnMessage ? 'ml-auto' : 'mr-auto')}>
                    <Card
                      className={cn(
                        isOwnMessage ? 'bg-blue-50' : 'bg-white',
                        entry.type === 'system' && 'bg-yellow-50 border-yellow-200',
                        entry.type === 'remark' && 'bg-red-50 border-red-200'
                      )}
                    >
                      <MessageCard entry={entry} isOwn={isOwnMessage} />
                    </Card>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="bg-white border-t border-slate-200 p-3 md:p-4 fixed bottom-16 md:bottom-0 left-0 right-0 md:left-auto md:right-0">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Добавить запись..."
            className="resize-none"
            rows={1}
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
            size="icon"
            className="h-10 w-10"
          >
            <Icon name="Send" size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WorkLog;