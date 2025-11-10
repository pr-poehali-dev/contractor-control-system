import { useState } from 'react';
import { useAuthRedux } from '@/hooks/useAuthRedux';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import styles from './WorkLog.module.css';

const WorkLog = () => {
  const { user, userData } = useAuthRedux();
  const { toast } = useToast();
  const [newMessage, setNewMessage] = useState('');

  const logEntries = ((userData?.workLogs && Array.isArray(userData.workLogs)) ? userData.workLogs : []).map(log => ({
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
    <div className={cn(styles.messageWrapper, isOwn && styles.messageWrapperOwn)}>
      <Avatar className={styles.avatar}>
        <AvatarFallback className={cn(
          'text-xs font-semibold',
          isOwn ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
        )}>
          {getInitials(entry.authorName)}
        </AvatarFallback>
      </Avatar>

      <div className={cn(styles.messageContent, isOwn && styles.messageContentOwn)}>
        <div className={cn(styles.messageHeader, isOwn && styles.messageHeaderOwn)}>
          <span className={styles.authorName}>{entry.authorName}</span>
          <span className={styles.timestamp}>{formatTime(entry.timestamp)}</span>
        </div>

        <Card className={cn(
          styles.messageCard,
          isOwn && styles.messageCardOwn,
          entry.type === 'work' && styles.messageCardWork
        )}>
          <CardContent className={styles.messageBody}>
            {entry.type === 'work' && (
              <div className={styles.workBadge}>
                <Icon name="Wrench" size={16} className="text-blue-600" />
                <span className={styles.workBadgeText}>Запись о работе</span>
              </div>
            )}

            <p className={styles.messageText}>
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
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Журнал работ</h1>
        <p className={styles.subtitle}>Все записи и события по проектам</p>
      </div>

      <div className={styles.content}>
        {logEntries.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              <Icon name="FileText" size={32} className="text-slate-300" />
            </div>
            <p className={styles.emptyTitle}>Записей пока нет</p>
            <p className={styles.emptyDescription}>Добавьте первую запись в журнал</p>
          </div>
        ) : (
          <div className={styles.messages}>
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

      <div className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.inputWrapper}>
            <Textarea
              placeholder="Добавить запись в журнал..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className={styles.textarea}
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
              className={styles.sendButton}
              size="icon"
            >
              <Icon name="Send" size={20} />
            </Button>
          </div>
          <p className={styles.hint}>
            Enter — отправить, Shift+Enter — новая строка
          </p>
        </div>
      </div>
    </div>
  );
};

export default WorkLog;