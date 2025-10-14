import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';

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
  onStartInspection?: (event: FeedEvent) => void;
  onTagClick?: (tagId: string, tagType: 'object' | 'work') => void;
  userRole?: 'client' | 'contractor' | 'admin';
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

const getEventBadgeColor = (type: string) => {
  switch(type) {
    case 'work_log': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'inspection': return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'planned_inspection': return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'info_post': return 'bg-orange-100 text-orange-700 border-orange-200';
    default: return 'bg-slate-100 text-slate-700';
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

const getEventBgColor = (type: string) => {
  switch(type) {
    case 'work_log': return 'bg-blue-50/50';
    case 'inspection': return 'bg-purple-50/50';
    case 'planned_inspection': return 'bg-purple-50/50';
    case 'info_post': return 'bg-orange-50/50';
    default: return 'bg-white';
  }
};

const FeedEventCard = ({ event, index, onStartInspection, onTagClick, userRole }: FeedEventCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const photos = event.photoUrls || [];

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsImageDialogOpen(true);
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
    <>
    <Card 
      className={`overflow-hidden hover:shadow-md transition-shadow animate-fade-in ${getEventBgColor(event.type)}`}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-xs text-slate-500">
              {event.scheduledDate 
                ? new Date(event.scheduledDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
                : formatTimeAgo(event.timestamp)
              }
            </p>
            <span className="text-slate-300">·</span>
            <Badge variant="outline" className={`text-[10px] font-normal px-1.5 py-0 ${getEventBadgeColor(event.type)}`}>
              {getEventLabel(event.type)}
            </Badge>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full flex-shrink-0">
            <Icon name="MoreHorizontal" size={18} />
          </Button>
        </div>

        {event.type !== 'info_post' && event.workTitle && (
          <div className="mb-2">
            <h3 
              className="font-semibold text-slate-900 text-lg leading-snug cursor-pointer hover:text-blue-600 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                if (event.workId && onTagClick) {
                  onTagClick(`work-${event.workId}`, 'work');
                }
              }}
            >
              {event.workTitle}
            </h3>
          </div>
        )}

        {event.type === 'info_post' && (
          <div className="mb-2">
            <h3 className="font-semibold text-slate-900 text-lg leading-snug">{event.title}</h3>
          </div>
        )}

        {event.type !== 'info_post' && (event.objectTitle || event.author) && (
          <div className="flex gap-2 flex-wrap mb-3">
            {event.objectTitle && (
              <Badge 
                variant="outline" 
                className="text-xs px-2.5 py-1 font-normal cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  if (event.objectId && onTagClick) {
                    onTagClick(`object-${event.objectId}`, 'object');
                  }
                }}
              >
                <Icon name="Building2" size={12} className="mr-1" />
                {event.objectTitle}
              </Badge>
            )}
            {event.author && (
              <Badge 
                variant="outline" 
                className="text-xs px-2.5 py-1 font-normal"
              >
                <Icon name="User" size={12} className="mr-1" />
                {event.author}
              </Badge>
            )}
          </div>
        )}

        {photos.length > 0 && (
        <div className="relative bg-black group mb-3 rounded-lg overflow-hidden">
          <div className="relative aspect-[4/3] md:aspect-video cursor-pointer" onClick={handleImageClick}>
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

        <div>
          <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
            {event.description}
          </p>
        </div>

        {(event.volume || event.materials) && (
          <div className="flex flex-wrap gap-3 mt-3 p-3 bg-slate-50 rounded-lg">
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

        {event.type === 'planned_inspection' && event.status === 'draft' && userRole === 'client' && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <Button 
              onClick={(e) => {
                e.stopPropagation();
                onStartInspection?.(event);
              }}
              className="w-full"
              variant="default"
            >
              <Icon name="ClipboardCheck" size={16} className="mr-2" />
              Начать проверку
            </Button>
          </div>
        )}
      </div>
    </Card>

    <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-auto h-auto p-0 bg-black/95 border-0">
        <div className="relative w-full h-full flex items-center justify-center">
          <img 
            src={photos[currentImageIndex]} 
            alt={`Фото ${currentImageIndex + 1}`}
            className="max-w-full max-h-[95vh] object-contain"
          />
          
          {photos.length > 1 && (
            <>
              <div className="absolute top-4 right-4 bg-black/60 text-white text-sm px-3 py-1.5 rounded-full font-medium">
                {currentImageIndex + 1}/{photos.length}
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 bg-white/90 hover:bg-white rounded-full shadow-lg"
                onClick={handlePrevImage}
              >
                <Icon name="ChevronLeft" size={24} />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 bg-white/90 hover:bg-white rounded-full shadow-lg"
                onClick={handleNextImage}
              >
                <Icon name="ChevronRight" size={24} />
              </Button>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {photos.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(idx);
                    }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentImageIndex 
                        ? 'bg-white w-6' 
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default FeedEventCard;