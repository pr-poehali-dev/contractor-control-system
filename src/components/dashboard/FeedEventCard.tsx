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
  type: 'work_log' | 'inspection' | 'inspection_scheduled' | 'inspection_started' | 'inspection_completed' | 'info_post';
  inspectionType?: 'scheduled' | 'unscheduled';
  inspectionNumber?: string;
  inspectionId?: number;
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
  defectsCount?: number;
  scheduledDate?: string;
}

interface FeedEventCardProps {
  event: FeedEvent;
  index: number;
  onClick: (event: FeedEvent) => void;
  onStartInspection?: (event: FeedEvent) => void;
  onTagClick?: (tagId: string, tagType: 'object' | 'work' | 'contractor') => void;
  onInspectionClick?: (event: FeedEvent) => void;
  userRole?: 'client' | 'contractor' | 'admin';
}

const getEventIcon = (type: string) => {
  switch(type) {
    case 'work_log': return 'FileText';
    case 'inspection': return 'ClipboardCheck';
    case 'inspection_scheduled': return 'Calendar';
    case 'inspection_started': return 'PlayCircle';
    case 'inspection_completed': return 'CheckCircle';
    case 'info_post': return 'Bell';
    default: return 'Activity';
  }
};

const getEventLabel = (type: string) => {
  switch(type) {
    case 'work_log': return 'Запись в журнале';
    case 'inspection': return 'Проверка';
    case 'inspection_scheduled': return 'Запланирована проверка';
    case 'inspection_started': return 'Начата проверка';
    case 'inspection_completed': return 'Проверка завершена';
    case 'info_post': return 'Инфо-пост';
    default: return type;
  }
};

const getEventBadgeColor = (type: string) => {
  switch(type) {
    case 'work_log': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'inspection': return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'inspection_scheduled': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'inspection_started': return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'inspection_completed': return 'bg-green-100 text-green-700 border-green-200';
    case 'info_post': return 'bg-orange-100 text-orange-700 border-orange-200';
    default: return 'bg-slate-100 text-slate-700';
  }
};

const formatTimeAgo = (timestamp: string) => {
  const date = new Date(timestamp);
  
  if (isNaN(date.getTime())) return 'Неизвестная дата';
  
  const year = date.getFullYear();
  if (year < 1900 || year > 2100) return 'Некорректная дата';
  
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
    case 'inspection_scheduled': return 'bg-yellow-50/50';
    case 'inspection_started': return 'bg-orange-50/50';
    case 'inspection_completed': return 'bg-green-50/50';
    case 'info_post': return 'bg-orange-50/50';
    default: return 'bg-white';
  }
};

const FeedEventCard = ({ event, index, onStartInspection, onTagClick, onInspectionClick, userRole }: FeedEventCardProps) => {
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
      <div className="p-4 sm:p-5 relative">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide mb-3">
          {event.objectTitle && (
            <Badge 
              variant="outline" 
              className="text-xs font-medium px-2 py-0.5 bg-slate-50 text-slate-700 border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                if (event.objectId && onTagClick) {
                  onTagClick(`object-${event.objectId}`, 'object');
                }
              }}
            >
              <Icon name="Building2" size={13} className="mr-1 flex-shrink-0" />
              <span className="truncate max-w-[140px] sm:max-w-[200px]">{event.objectTitle}</span>
            </Badge>
          )}
          {event.author && (
            <Badge 
              variant="outline" 
              className="text-xs font-medium px-2 py-0.5 bg-blue-50 text-blue-700 border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors whitespace-nowrap flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                if (onTagClick) {
                  onTagClick(`contractor-${event.author}`, 'contractor');
                }
              }}
            >
              <Icon name="User" size={13} className="mr-1 flex-shrink-0" />
              <span className="truncate max-w-[120px] sm:max-w-none">{event.author}</span>
            </Badge>
          )}
        </div>
        
        {((event.scheduledDate || event.inspectionType === 'scheduled' || event.inspectionType === 'unscheduled') || (event.defectsCount && event.defectsCount > 0)) && (
          <div className="flex items-center gap-2 flex-wrap mb-2.5">
            {(event.scheduledDate || event.inspectionType === 'scheduled') && event.type === 'inspection' && (
              <Badge variant="outline" className="text-xs font-normal px-2 py-0.5 bg-blue-50 text-blue-600 border-blue-200">
                <Icon name="Calendar" size={12} className="mr-1" />
                Запланированная
              </Badge>
            )}
            {!event.scheduledDate && event.inspectionType === 'unscheduled' && event.type === 'inspection' && (
              <Badge variant="outline" className="text-xs font-normal px-2 py-0.5 bg-orange-50 text-orange-600 border-orange-200">
                <Icon name="Zap" size={12} className="mr-1" />
                Внеплановая
              </Badge>
            )}
            {event.type === 'inspection' && event.status === 'completed' && event.defectsCount && event.defectsCount > 0 && (
              <Badge variant="outline" className="text-xs font-normal px-2 py-0.5 bg-red-50 text-red-600 border-red-200">
                <Icon name="AlertTriangle" size={12} className="mr-1" />
                {event.defectsCount} замечаний
              </Badge>
            )}
          </div>
        )}

        {event.type !== 'info_post' && event.workTitle && (
          <div className="mb-2 pl-0.5">
            <h3 
              className="font-semibold text-slate-900 text-base leading-snug cursor-pointer hover:text-blue-600 transition-colors break-words px-[18px]"
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
          <div className="mb-2 pl-0.5">
            <h3 className="font-semibold text-slate-900 text-base leading-snug break-words">{event.title}</h3>
          </div>
        )}

        {(event.type === 'inspection' || event.type === 'inspection_scheduled' || event.type === 'inspection_started' || event.type === 'inspection_completed') && event.inspectionNumber && (
          <div className="mb-2 pl-0.5">
            <p className="text-sm text-slate-600 px-[18px]">
              Проверка <span className="font-mono font-medium text-purple-600">№{event.inspectionNumber}</span>
            </p>
          </div>
        )}

        {(event.type === 'work_log' || event.type === 'inspection_scheduled' || event.type === 'inspection_started' || event.type === 'inspection_completed') && event.description && (
          <div className="mb-2 pl-0.5">
            <p className="text-sm text-slate-600 break-words px-[18px]">{event.description}</p>
          </div>
        )}

        {photos.length > 0 && (
        <div className="relative bg-black group mb-2 rounded-lg overflow-hidden">
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

        {(event.volume || event.materials) && (
          <div className="flex flex-wrap gap-3 mt-2 p-2.5 bg-slate-50 rounded-lg">
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

        {(event.type === 'inspection_scheduled' || event.type === 'inspection_started' || event.type === 'inspection_completed') && (
          <div className="mt-2">
            {event.type === 'inspection_completed' && (
              <Button 
                onClick={(e) => {
                  e.stopPropagation();
                  const inspectionId = event.inspectionId || event.id.replace('inspection_event_', '');
                  if (onInspectionClick) {
                    onInspectionClick({ ...event, id: inspectionId.toString() });
                  }
                }}
                className="w-full bg-purple-600 hover:bg-purple-700"
                size="sm"
              >
                <Icon name="Eye" size={16} className="mr-2" />
                Перейти к результатам
              </Button>
            )}
          </div>
        )}
        
        <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100 px-[15px]">
          <Badge variant="outline" className={`text-xs font-medium px-2.5 py-1 ${getEventBadgeColor(event.type)}`}>
            {getEventLabel(event.type)}
          </Badge>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Icon name="Clock" size={12} />
            {formatTimeAgo(event.timestamp)}
          </div>
        </div>
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