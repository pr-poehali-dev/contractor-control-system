import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';

interface FeedEvent {
  id: string;
  type: 'work_log' | 'inspection' | 'info_post' | 'planned_inspection';
  title: string;
  description: string;
  timestamp: string;
  status?: string;
  workId?: number;
  objectId?: number;
  projectId?: number;
  objectTitle?: string;
  projectTitle?: string;
  workTitle?: string;
  author?: string;
  photoUrls?: string[];
  materials?: string;
  volume?: string;
  defects?: string;
  scheduledDate?: string;
}

interface FeedEventCardProps {
  event: FeedEvent;
  index: number;
  onClick: (event: FeedEvent) => void;
}

const getEventIcon = (type: string) => {
  switch(type) {
    case 'work_log': return 'FileText';
    case 'inspection': return 'ClipboardCheck';
    case 'info_post': return 'Bell';
    case 'planned_inspection': return 'Calendar';
    default: return 'Activity';
  }
};

const getEventColor = (type: string) => {
  switch(type) {
    case 'work_log': return 'bg-blue-100 text-blue-600';
    case 'inspection': return 'bg-purple-100 text-purple-600';
    case 'info_post': return 'bg-amber-100 text-amber-600';
    case 'planned_inspection': return 'bg-slate-100 text-slate-600';
    default: return 'bg-slate-100 text-slate-600';
  }
};

const getEventLabel = (type: string) => {
  switch(type) {
    case 'work_log': return 'Запись в журнале';
    case 'inspection': return 'Проверка';
    case 'info_post': return 'Инфо-пост';
    case 'planned_inspection': return 'Запланирована проверка';
    default: return type;
  }
};

const formatTimeAgo = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 7) {
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  } else if (diffDays > 0) {
    return `${diffDays} ${diffDays === 1 ? 'день' : diffDays < 5 ? 'дня' : 'дней'} назад`;
  } else if (diffHours > 0) {
    return `${diffHours} ${diffHours === 1 ? 'час' : diffHours < 5 ? 'часа' : 'часов'} назад`;
  } else {
    return 'Только что';
  }
};

const FeedEventCard = ({ event, index, onClick }: FeedEventCardProps) => {
  return (
    <Card 
      className={`hover:shadow-md transition-shadow animate-fade-in ${event.type === 'info_post' ? '' : 'cursor-pointer'}`}
      style={{ animationDelay: `${index * 0.05}s` }}
      onClick={() => onClick(event)}
    >
      <CardContent className="p-6">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <Avatar className={`w-12 h-12 ${getEventColor(event.type)}`}>
              <AvatarFallback className="bg-transparent">
                <Icon name={getEventIcon(event.type) as any} size={24} />
              </AvatarFallback>
            </Avatar>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2 gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Badge variant="outline" className="text-xs">
                    {getEventLabel(event.type)}
                  </Badge>
                  <span className="text-xs text-slate-500">
                    {event.scheduledDate 
                      ? new Date(event.scheduledDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
                      : formatTimeAgo(event.timestamp)
                    }
                  </span>
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">
                  {event.title}
                </h3>
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-3 line-clamp-2">
              {event.description}
            </p>

            {(event.volume || event.materials) && (
              <div className="flex flex-wrap gap-4 mb-3 text-xs">
                {event.volume && (
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Icon name="Package" size={14} />
                    <span>Объём: {event.volume}</span>
                  </div>
                )}
                {event.materials && (
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Icon name="Boxes" size={14} />
                    <span>Материалы: {event.materials}</span>
                  </div>
                )}
              </div>
            )}

            {event.photoUrls && event.photoUrls.length > 0 && (
              <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-hide">
                {event.photoUrls.slice(0, 4).map((url, i) => (
                  <div key={i} className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-slate-100">
                    <img 
                      src={url} 
                      alt={`Фото ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                {event.photoUrls.length > 4 && (
                  <div className="w-20 h-20 flex-shrink-0 rounded-lg bg-slate-100 flex items-center justify-center text-sm text-slate-600 font-medium">
                    +{event.photoUrls.length - 4}
                  </div>
                )}
              </div>
            )}

            {event.type !== 'info_post' && event.projectTitle && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Icon name="FolderOpen" size={14} />
                <span className="truncate">{event.projectTitle}</span>
                {event.objectTitle && (
                  <>
                    <Icon name="ChevronRight" size={12} />
                    <Icon name="MapPin" size={14} />
                    <span className="truncate">{event.objectTitle}</span>
                  </>
                )}
                {event.workTitle && (
                  <>
                    <Icon name="ChevronRight" size={12} />
                    <Icon name="Wrench" size={14} />
                    <span className="truncate">{event.workTitle}</span>
                  </>
                )}
              </div>
            )}

            {event.author && (
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100">
                <Icon name="User" size={14} />
                <span>{event.author}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeedEventCard;
