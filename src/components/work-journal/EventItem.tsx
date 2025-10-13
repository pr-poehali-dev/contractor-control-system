import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { JournalEvent } from '@/types/journal';

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
  
  const renderEventContent = () => {
    switch (event.type) {
      case 'work_entry':
        return (
          <>
            {event.work_data && (
              <div className="flex items-center gap-2 mb-2 md:mb-3 pb-1.5 md:pb-2 border-b border-slate-200">
                <Icon name="Wrench" size={14} className="text-green-600 md:w-5 md:h-5" />
                <span className="text-xs md:text-base font-semibold text-green-600">Отчёт о работе</span>
              </div>
            )}
            <p className="text-xs md:text-base leading-relaxed text-slate-800 whitespace-pre-wrap break-words">{event.content}</p>
            
            {event.work_data?.volume && (
              <div className="mt-2 md:mt-4 p-2 md:p-3 bg-slate-50 rounded-lg">
                <p className="text-xs md:text-sm text-slate-600">
                  Объём: <span className="font-semibold text-xs md:text-base">{event.work_data.volume} {event.work_data.unit}</span>
                </p>
              </div>
            )}
            
            {event.work_data?.materials && event.work_data.materials.length > 0 && (
              <div className="mt-2 md:mt-3">
                <p className="text-xs md:text-sm text-slate-600 mb-1 md:mb-2">Материалы:</p>
                <div className="flex flex-wrap gap-1 md:gap-1.5">
                  {event.work_data.materials.map((material, idx) => (
                    <Badge key={idx} variant="outline" className="text-[10px] md:text-xs py-0.5 md:py-1 px-1.5 md:px-2">
                      {material}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {event.work_data?.photos && event.work_data.photos.length > 0 && (
              <div className="mt-2 grid grid-cols-2 gap-1 md:gap-2">
                {event.work_data.photos.map((photo, idx) => (
                  <img 
                    key={idx}
                    src={photo} 
                    alt={`Фото ${idx + 1}`}
                    className="w-full h-20 md:h-32 object-cover rounded cursor-pointer"
                  />
                ))}
              </div>
            )}
          </>
        );
        
      case 'inspection':
        return (
          <>
            <div className="flex items-center gap-2 mb-2 md:mb-3 pb-1.5 md:pb-2 border-b border-slate-200">
              <Icon name="ClipboardCheck" size={16} className="text-blue-600 md:w-5 md:h-5" />
              <span className="text-xs md:text-base font-semibold text-blue-600">Проверка</span>
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
            <p className="text-xs md:text-base leading-relaxed text-slate-800 whitespace-pre-wrap break-words">{event.content}</p>
            
            {event.inspection_data?.defects && event.inspection_data.defects.length > 0 && (
              <div className="mt-2 md:mt-3">
                <p className="text-xs md:text-sm text-slate-600 mb-1.5 md:mb-2">Замечания:</p>
                <div className="space-y-1.5 md:space-y-2">
                  {event.inspection_data.defects.map((defect, idx) => (
                    <div key={idx} className="p-2 md:p-3 bg-amber-50 border-l-2 md:border-l-4 border-l-amber-500 rounded">
                      <div className="flex items-start gap-1.5 md:gap-2">
                        <Badge variant="outline" className="text-[9px] md:text-xs flex-shrink-0">
                          {defect.severity === 'critical' ? 'Критично' : defect.severity === 'major' ? 'Важно' : 'Незначит.'}
                        </Badge>
                        <p className="text-[10px] md:text-sm flex-1 break-words">{defect.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {event.inspection_data?.photos && event.inspection_data.photos.length > 0 && (
              <div className="mt-2 grid grid-cols-2 gap-1 md:gap-2">
                {event.inspection_data.photos.map((photo, idx) => (
                  <img 
                    key={idx}
                    src={photo} 
                    alt={`Проверка ${idx + 1}`}
                    className="w-full h-20 md:h-32 object-cover rounded"
                  />
                ))}
              </div>
            )}
          </>
        );

      case 'inspection_created':
        return (
          <div className="flex items-start gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-12 md:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Icon name="ClipboardCheck" size={16} className="text-blue-600 md:w-5 md:h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs md:text-base font-semibold text-slate-800 break-words">
                Создана проверка №{event.inspection_data?.inspection_number}
              </p>
              <p className="text-[10px] md:text-sm text-slate-600 mt-0.5 md:mt-1 break-words">{event.content}</p>
            </div>
          </div>
        );
        
      case 'inspection_completed':
        return (
          <div className="flex items-start gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-12 md:h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Icon name="CheckCircle2" size={16} className="text-green-600 md:w-5 md:h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs md:text-base font-semibold text-slate-800 break-words">
                Проверка №{event.inspection_data?.inspection_number} завершена
              </p>
              {event.inspection_data?.defects_count ? (
                <p className="text-[10px] md:text-sm text-amber-600 mt-0.5 md:mt-1">
                  Выявлено замечаний: {event.inspection_data.defects_count}
                </p>
              ) : (
                <p className="text-[10px] md:text-sm text-green-600 mt-0.5 md:mt-1">
                  Замечаний не выявлено
                </p>
              )}
            </div>
          </div>
        );
        
      case 'defect_added':
        return (
          <div className="border-l-2 md:border-l-4 border-l-amber-500 pl-2 md:pl-4">
            <div className="flex items-start gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-12 md:h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Icon name="AlertTriangle" size={16} className="text-amber-600 md:w-5 md:h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-base font-semibold text-slate-800">
                  Добавлено замечание
                </p>
                <p className="text-[10px] md:text-sm text-slate-600 mt-0.5 md:mt-1">
                  Проверка №{event.defect_data?.inspection_number}
                </p>
                <p className="text-xs md:text-base leading-relaxed text-slate-800 mt-1.5 md:mt-2 break-words">{event.defect_data?.description}</p>
                {event.defect_data?.standard_reference && (
                  <p className="text-[10px] md:text-sm text-blue-600 mt-1.5 md:mt-2 break-words">
                    📋 {event.defect_data.standard_reference}
                  </p>
                )}
                {event.defect_data?.photos && event.defect_data.photos.length > 0 && (
                  <div className="mt-2 grid grid-cols-2 gap-1 md:gap-2">
                    {event.defect_data.photos.map((photo, idx) => (
                      <img 
                        key={idx}
                        src={photo} 
                        alt={`Замечание ${idx + 1}`}
                        className="w-full h-20 md:h-32 object-cover rounded"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
        
      case 'act_signed':
        return (
          <div className="flex items-start gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-12 md:h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Icon name="FileCheck" size={16} className="text-purple-600 md:w-5 md:h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs md:text-base font-semibold text-slate-800 break-words">
                Акт №{event.act_data?.act_number} подписан
              </p>
              {event.act_data?.signers && (
                <p className="text-[10px] md:text-sm text-slate-600 mt-0.5 md:mt-1 break-words">
                  Подписали: {event.act_data.signers.join(', ')}
                </p>
              )}
            </div>
          </div>
        );
        
      case 'chat_message':
        return (
          <p className="text-xs md:text-base leading-relaxed text-slate-800 whitespace-pre-wrap break-words">{event.content}</p>
        );
        
      default:
        return (
          <p className="text-xs md:text-base leading-relaxed text-slate-800 whitespace-pre-wrap break-words">{event.content}</p>
        );
    }
  };

  const isSystemEvent = ['inspection_created', 'inspection_completed', 'act_signed'].includes(event.type);

  if (isSystemEvent) {
    return (
      <div className="flex justify-center">
        <Card className="max-w-[95%] md:max-w-lg border-slate-200 bg-slate-50">
          <CardContent className="p-2.5 md:p-4">
            {renderEventContent()}
            <p className="text-[10px] md:text-sm text-slate-400 mt-2 md:mt-3 text-right">
              {formatTime(event.created_at)}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn('flex gap-1.5 md:gap-4 group', isOwnEvent && 'flex-row-reverse')}>
      <Avatar className="w-7 h-7 md:w-10 md:h-10 flex-shrink-0">
        <AvatarFallback className={cn(
          'text-[10px] md:text-sm font-semibold',
          isOwnEvent ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
        )}>
          {getInitials(event.author_name)}
        </AvatarFallback>
      </Avatar>

      <div className={cn('flex-1 max-w-[85%] md:max-w-[80%]', isOwnEvent && 'flex flex-col items-end')}>
        <div className={cn('mb-1 md:mb-1.5 flex items-center gap-1.5 md:gap-2', isOwnEvent && 'flex-row-reverse')}>
          <span className="text-xs md:text-base font-semibold text-slate-900">{event.author_name}</span>
        </div>

        <Card className={cn(
          'border-none shadow-sm relative',
          isOwnEvent ? 'bg-blue-50' : 'bg-white',
          event.type === 'work_entry' && !isOwnEvent && 'border-l-2 md:border-l-3 border-l-green-500',
          event.type === 'inspection' && !isOwnEvent && 'border-l-2 md:border-l-3 border-l-blue-500',
          event.type === 'defect_added' && 'border-l-2 md:border-l-3 border-l-amber-500'
        )}>
          <CardContent className="p-2 md:p-4">
            {(userRole === 'customer' || userRole === 'client') && event.type === 'work_entry' && !isOwnEvent && (
              <Button
                variant="outline"
                size="sm"
                className="absolute top-1.5 right-1.5 md:top-2 md:right-2 h-6 md:h-7 text-[10px] md:text-xs z-10 px-1.5 md:px-2"
                onClick={() => onCreateInspection?.(event.id)}
              >
                <Icon name="ClipboardCheck" size={12} className="md:mr-1" />
                <span className="hidden md:inline">Проверка</span>
              </Button>
            )}
            {renderEventContent()}
            <p className={cn('mt-1.5 md:mt-3 text-[9px] md:text-xs text-slate-400', isOwnEvent && 'text-right')}>
              {formatTime(event.created_at)}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}