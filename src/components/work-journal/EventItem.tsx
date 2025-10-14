import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { JournalEvent } from '@/types/journal';
import { PhotoGallery, PhotoViewer, usePhotoGallery } from '@/components/ui/photo-gallery';

interface EventItemProps {
  event: JournalEvent;
  isOwnEvent: boolean;
  userRole: 'contractor' | 'customer' | 'supervisor';
  onCreateInspection?: (eventId: number) => void;
  formatTime: (timestamp: string) => string;
  getInitials: (name: string) => string;
}

export default function EventItem({ 
  event, 
  isOwnEvent, 
  userRole,
  onCreateInspection,
  formatTime, 
  getInitials 
}: EventItemProps) {
  const workPhotosGallery = usePhotoGallery();
  const inspectionPhotosGallery = usePhotoGallery();
  const defectPhotosGallery = usePhotoGallery();
  
  const renderEventContent = () => {
    switch (event.type) {
      case 'work_entry':
        return (
          <>
            {event.work_data && (
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Icon name="Wrench" size={16} className="text-green-600" />
                </div>
                <span className="text-sm sm:text-base font-semibold text-green-700">Отчёт о работе</span>
              </div>
            )}
            <p className="text-[13px] sm:text-[15px] leading-relaxed text-slate-700 whitespace-pre-wrap break-words">{event.content}</p>
            
            {event.work_data?.volume && (
              <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                <p className="text-[13px] sm:text-sm text-slate-700">
                  Объём: <span className="font-bold text-blue-700">{event.work_data.volume} {event.work_data.unit}</span>
                </p>
              </div>
            )}
            
            {event.work_data?.materials && event.work_data.materials.length > 0 && (
              <div className="mt-3">
                <p className="text-[12px] sm:text-sm text-slate-600 mb-2 font-medium">Материалы:</p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {event.work_data.materials.map((material, idx) => (
                    <Badge key={idx} variant="outline" className="text-[11px] sm:text-xs py-1 px-2.5 bg-white">
                      {material}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {event.work_data?.photos && event.work_data.photos.length > 0 && (
              <div className="mt-3">
                <PhotoGallery 
                  photos={event.work_data.photos} 
                  onPhotoClick={workPhotosGallery.openGallery}
                />
              </div>
            )}
          </>
        );
        
      case 'inspection':
        return (
          <>
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Icon name="ClipboardCheck" size={16} className="text-blue-600" />
              </div>
              <span className="text-sm sm:text-base font-semibold text-blue-700">Проверка</span>
              {event.inspection_data?.status && (
                <Badge 
                  variant={
                    event.inspection_data.status === 'approved' ? 'default' : 
                    event.inspection_data.status === 'rejected' ? 'destructive' : 
                    'outline'
                  }
                  className="text-[10px] md:text-xs"
                >
                  {event.inspection_data.status === 'approved' ? 'Одобрено' : 
                   event.inspection_data.status === 'rejected' ? 'Не одобрено' : 
                   'На проверке'}
                </Badge>
              )}
            </div>
            <p className="text-base leading-relaxed text-slate-800 whitespace-pre-wrap break-words">{event.content}</p>
            
            {event.inspection_data?.defects && event.inspection_data.defects.length > 0 && (
              <div className="mt-3">
                <p className="text-[12px] sm:text-sm text-slate-600 mb-2 font-medium">Замечания:</p>
                <div className="space-y-2">
                  {event.inspection_data.defects.map((defect, idx) => (
                    <div key={idx} className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-l-amber-500 rounded-lg shadow-sm">
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="text-[10px] sm:text-xs flex-shrink-0 bg-white">
                          {defect.severity === 'critical' ? 'Критично' : defect.severity === 'major' ? 'Важно' : 'Незначит.'}
                        </Badge>
                        <p className="text-[12px] sm:text-sm flex-1 break-words text-slate-700">{defect.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {event.inspection_data?.photos && event.inspection_data.photos.length > 0 && (
              <div className="mt-3">
                <PhotoGallery 
                  photos={event.inspection_data.photos} 
                  onPhotoClick={inspectionPhotosGallery.openGallery}
                />
              </div>
            )}
          </>
        );

      case 'inspection_created':
        return (
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
              <Icon name="ClipboardCheck" size={18} className="text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] sm:text-base font-bold text-slate-800 break-words">
                Создана проверка №{event.inspection_data?.inspection_number}
              </p>
              <p className="text-[11px] sm:text-sm text-slate-600 mt-1 break-words">{event.content}</p>
            </div>
          </div>
        );
        
      case 'inspection_completed':
        return (
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
              <Icon name="CheckCircle2" size={18} className="text-green-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] sm:text-base font-bold text-slate-800 break-words">
                Проверка №{event.inspection_data?.inspection_number} завершена
              </p>
              {event.inspection_data?.defects_count ? (
                <p className="text-[11px] sm:text-sm text-amber-600 mt-1 font-medium">
                  Выявлено замечаний: {event.inspection_data.defects_count}
                </p>
              ) : (
                <p className="text-[11px] sm:text-sm text-green-600 mt-1 font-medium">
                  Замечаний не выявлено
                </p>
              )}
            </div>
          </div>
        );
        
      case 'defect_added':
        return (
          <div className="border-l-4 border-l-amber-500 pl-3 sm:pl-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                <Icon name="AlertTriangle" size={18} className="text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] sm:text-base font-bold text-slate-800">
                  Добавлено замечание
                </p>
                <p className="text-[11px] sm:text-sm text-slate-600 mt-1">
                  Проверка №{event.defect_data?.inspection_number}
                </p>
                <p className="text-[12px] sm:text-[15px] leading-relaxed text-slate-700 mt-2 break-words">{event.defect_data?.description}</p>
                {event.defect_data?.standard_reference && (
                  <p className="text-[11px] sm:text-sm text-blue-600 mt-2 break-words font-medium">
                    📋 {event.defect_data.standard_reference}
                  </p>
                )}
                {event.defect_data?.photos && event.defect_data.photos.length > 0 && (
                  <div className="mt-3">
                    <PhotoGallery 
                      photos={event.defect_data.photos} 
                      onPhotoClick={defectPhotosGallery.openGallery}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        );
        
      case 'act_signed':
        return (
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
              <Icon name="FileCheck" size={18} className="text-purple-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] sm:text-base font-bold text-slate-800 break-words">
                Акт №{event.act_data?.act_number} подписан
              </p>
              {event.act_data?.signers && (
                <p className="text-[11px] sm:text-sm text-slate-600 mt-1 break-words">
                  Подписали: {event.act_data.signers.join(', ')}
                </p>
              )}
            </div>
          </div>
        );
        
      case 'chat_message':
        return (
          <p className="text-base leading-relaxed text-slate-800 whitespace-pre-wrap break-words">{event.content}</p>
        );
        
      default:
        return (
          <p className="text-base leading-relaxed text-slate-800 whitespace-pre-wrap break-words">{event.content}</p>
        );
    }
  };

  const isSystemEvent = ['inspection_created', 'inspection_completed', 'act_signed'].includes(event.type);

  if (isSystemEvent) {
    return (
      <div className="flex justify-center">
        <Card className="max-w-[96%] sm:max-w-md border border-slate-200 bg-gradient-to-br from-slate-50 to-white shadow-sm">
          <CardContent className="p-3 sm:p-4">
            {renderEventContent()}
            <p className="text-[10px] sm:text-xs text-slate-400 mt-3 text-right">
              {formatTime(event.created_at)}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex gap-2.5 sm:gap-3 md:gap-4 group">
      <Avatar className="w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0 shadow-sm">
        <AvatarFallback className={cn(
          'text-[11px] sm:text-sm font-bold',
          isOwnEvent ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
        )}>
          {getInitials(event.author_name)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0 max-w-full">
        <div className="mb-1.5 flex items-center gap-2">
          <span className="text-[13px] sm:text-base font-bold text-slate-900 truncate">{event.author_name}</span>
        </div>

        <Card className={cn(
          'border shadow-sm relative w-full transition-shadow hover:shadow-md',
          isOwnEvent ? 'bg-gradient-to-br from-blue-50 to-white border-blue-100' : 'bg-white border-slate-200',
          event.type === 'work_entry' && !isOwnEvent && 'border-l-4 border-l-green-500',
          event.type === 'inspection' && !isOwnEvent && 'border-l-4 border-l-blue-500',
          event.type === 'defect_added' && 'border-l-4 border-l-amber-500'
        )}>
          <CardContent className="p-3 sm:p-4 w-full overflow-hidden">
            {(userRole === 'customer' || userRole === 'client') && event.type === 'work_entry' && !isOwnEvent && (
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2 h-8 text-[11px] sm:text-xs z-10 px-2 sm:px-3 shadow-sm"
                onClick={() => onCreateInspection?.(event.id)}
              >
                <Icon name="ClipboardCheck" size={14} className="sm:mr-1.5" />
                <span className="hidden sm:inline">Проверка</span>
              </Button>
            )}
            {renderEventContent()}
            <p className="mt-3 text-[10px] sm:text-xs text-slate-400">
              {formatTime(event.created_at)}
            </p>
          </CardContent>
        </Card>
      </div>

      {event.work_data?.photos && event.work_data.photos.length > 0 && (
        <PhotoViewer
          photos={event.work_data.photos}
          currentIndex={workPhotosGallery.currentIndex}
          isOpen={workPhotosGallery.isOpen}
          onClose={workPhotosGallery.closeGallery}
          onNavigate={workPhotosGallery.navigateToPhoto}
        />
      )}

      {event.inspection_data?.photos && event.inspection_data.photos.length > 0 && (
        <PhotoViewer
          photos={event.inspection_data.photos}
          currentIndex={inspectionPhotosGallery.currentIndex}
          isOpen={inspectionPhotosGallery.isOpen}
          onClose={inspectionPhotosGallery.closeGallery}
          onNavigate={inspectionPhotosGallery.navigateToPhoto}
        />
      )}

      {event.defect_data?.photos && event.defect_data.photos.length > 0 && (
        <PhotoViewer
          photos={event.defect_data.photos}
          currentIndex={defectPhotosGallery.currentIndex}
          isOpen={defectPhotosGallery.isOpen}
          onClose={defectPhotosGallery.closeGallery}
          onNavigate={defectPhotosGallery.navigateToPhoto}
        />
      )}
    </div>
  );
}