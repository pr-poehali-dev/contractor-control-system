import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
    
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
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

  const MessageCard = ({ entry, isOwn }: { entry: typeof logEntries[0]; isOwn: boolean }) => (
    <div className={cn('flex gap-3 mb-4', isOwn && 'flex-row-reverse')}>
      <Avatar className="w-9 h-9 md:w-10 md:h-10 flex-shrink-0">
        <AvatarFallback className={cn(
          'text-xs font-semibold',
          isOwn ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
        )}>
          {getInitials(entry.authorName)}
        </AvatarFallback>
      </Avatar>

      <div className={cn('flex-1 max-w-[85%] md:max-w-[70%]', isOwn && 'flex flex-col items-end')}>
        <div className={cn('mb-1 flex items-baseline gap-2', isOwn && 'flex-row-reverse')}>
          <span className="text-sm font-semibold text-slate-900">{entry.authorName}</span>
          <span className="text-xs text-slate-400">{formatTime(entry.timestamp)}</span>
        </div>

        <Card className={cn(
          'border-none shadow-sm',
          isOwn ? 'bg-blue-50' : 'bg-white',
          entry.type === 'work' && 'border-l-4 border-l-blue-500'
        )}>
          <CardContent className="p-3 md:p-4">
            {entry.type === 'work' && (
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-200">
                <Icon name="Wrench" size={16} className="text-blue-600" />
                <span className="text-xs font-semibold text-blue-600">Запись о работе</span>
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
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <Icon name="Camera" size={14} />
                  <span>{entry.photos.length} {entry.photos.length === 1 ? 'фото' : 'фото'}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 p-4 md:p-6 flex-shrink-0">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">Журнал работ</h1>
        <p className="text-sm text-slate-500">Все записи и события по проектам</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {logEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Icon name="FileText" size={32} className="text-slate-300" />
            </div>
            <p className="text-slate-500 text-lg mb-2">Записей пока нет</p>
            <p className="text-slate-400 text-sm">Добавьте первую запись в журнал</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {logEntries.map((entry) => {
              const isOwnMessage = entry.authorId === user?.id;
              return (
                <MessageCard 
                  key={entry.id} 
                  entry={entry} 
                  isOwn={isOwnMessage}
                />
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-white border-t border-slate-200 p-4 md:p-6 flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <Textarea
              placeholder="Добавить запись в журнал..."
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

export default WorkLog;
