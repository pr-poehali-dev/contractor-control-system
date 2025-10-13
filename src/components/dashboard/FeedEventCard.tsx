import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
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

const FeedEventCard = ({ event, index }: FeedEventCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const photos = event.photoUrls || [];

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-md transition-shadow animate-fade-in"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3 mb-3">
          <Avatar className="w-11 h-11 bg-slate-200 flex-shrink-0">
            <AvatarFallback className="bg-slate-200 text-slate-700 text-sm font-medium">
              {event.author ? getInitials(event.author) : <Icon name={getEventIcon(event.type) as any} size={18} />}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-3 mb-0.5">
              <h3 className="font-semibold text-slate-900 text-base truncate">
                {event.author || event.projectTitle}
              </h3>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full flex-shrink-0">
                <Icon name="MoreHorizontal" size={18} />
              </Button>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-xs text-slate-500">
                {event.scheduledDate 
                  ? new Date(event.scheduledDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
                  : formatTimeAgo(event.timestamp)
                }
              </p>
              {event.type !== 'info_post' && (
                <>
                  <span className="text-slate-300">·</span>
                  <Badge variant="secondary" className="text-[10px] font-normal px-1.5 py-0">
                    {getEventLabel(event.type)}
                  </Badge>
                </>
              )}
            </div>
          </div>
        </div>

        {event.type !== 'info_post' && event.objectTitle && (
          <div className="mb-3 pl-14">
            <Badge variant="outline" className="text-xs px-2.5 py-1 font-normal">
              {event.objectTitle}
            </Badge>
          </div>
        )}

        <div className="mb-3">
          <h4 className="font-medium text-slate-900 mb-2 text-[15px] leading-snug">{event.title}</h4>
          <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
            {event.description}
          </p>
        </div>

        {(event.volume || event.materials) && (
          <div className="flex flex-wrap gap-3 mb-3 p-3 bg-slate-50 rounded-lg">
            {event.volume && (
              <div className="flex items-center gap-2 text-xs text-slate-700">
                <Icon name="Package" size={14} className="text-slate-500" />
                <span className="font-medium">Объём:</span>
                <span>{event.volume}</span>
              </div>
            )}
            {event.materials && (
              <div className="flex items-center gap-2 text-xs text-slate-700">
                <Icon name="Boxes" size={14} className="text-slate-500" />
                <span className="font-medium">Материалы:</span>
                <span>{event.materials}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {photos.length > 0 && (
        <div className="relative bg-black group">
          <div className="relative aspect-[4/3] md:aspect-video">
            <img 
              src={photos[currentImageIndex]} 
              alt={`Фото ${currentImageIndex + 1}`}
              className="w-full h-full object-contain"
            />
            
            {photos.length > 1 && (
              <>
                <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full font-medium">
                  {currentImageIndex + 1}/{photos.length}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 bg-white/90 hover:bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={handlePrevImage}
                >
                  <Icon name="ChevronLeft" size={20} />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 bg-white/90 hover:bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={handleNextImage}
                >
                  <Icon name="ChevronRight" size={20} />
                </Button>

                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {photos.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex(idx);
                      }}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        idx === currentImageIndex 
                          ? 'bg-white w-4' 
                          : 'bg-white/50 hover:bg-white/75'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}


    </Card>
  );
};

export default FeedEventCard;