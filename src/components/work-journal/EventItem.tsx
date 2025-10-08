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
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-200">
                <Icon name="Wrench" size={16} className="text-green-600" />
                <span className="text-xs font-semibold text-green-600">Отчёт о работе</span>
              </div>
            )}
            <p className="text-sm text-slate-800 whitespace-pre-wrap break-words">{event.content}</p>
            
            {event.work_data?.volume && (
              <div className="mt-3 p-2 bg-slate-50 rounded">
                <p className="text-xs text-slate-600">
                  Объём: <span className="font-semibold">{event.work_data.volume} {event.work_data.unit}</span>
                </p>
              </div>
            )}
            
            {event.work_data?.materials && event.work_data.materials.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-slate-600 mb-1">Материалы:</p>
                <div className="flex flex-wrap gap-1">
                  {event.work_data.materials.map((material, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {material}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {event.work_data?.photos && event.work_data.photos.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {event.work_data.photos.map((photo, idx) => (
                  <img 
                    key={idx}
                    src={photo} 
                    alt={`Фото ${idx + 1}`}
                    className="w-full h-32 object-cover rounded"
                  />
                ))}
              </div>
            )}
          </>
        );
        
      case 'inspection_created':
        return (
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Icon name="ClipboardCheck" size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Создана проверка №{event.inspection_data?.inspection_number}
              </p>
              <p className="text-xs text-slate-600 mt-1">{event.content}</p>
            </div>
          </div>
        );
        
      case 'inspection_completed':
        return (
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Icon name="CheckCircle2" size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Проверка №{event.inspection_data?.inspection_number} завершена
              </p>
              {event.inspection_data?.defects_count ? (
                <p className="text-xs text-amber-600 mt-1">
                  Выявлено замечаний: {event.inspection_data.defects_count}
                </p>
              ) : (
                <p className="text-xs text-green-600 mt-1">
                  Замечаний не выявлено
                </p>
              )}
            </div>
          </div>
        );
        
      case 'defect_added':
        return (
          <div className="border-l-4 border-l-amber-500 pl-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Icon name="AlertTriangle" size={20} className="text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800">
                  Добавлено замечание
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  Проверка №{event.defect_data?.inspection_number}
                </p>
                <p className="text-sm text-slate-800 mt-2">{event.defect_data?.description}</p>
                {event.defect_data?.standard_reference && (
                  <p className="text-xs text-blue-600 mt-2">
                    📋 {event.defect_data.standard_reference}
                  </p>
                )}
                {event.defect_data?.photos && event.defect_data.photos.length > 0 && (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {event.defect_data.photos.map((photo, idx) => (
                      <img 
                        key={idx}
                        src={photo} 
                        alt={`Замечание ${idx + 1}`}
                        className="w-full h-24 object-cover rounded"
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
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Icon name="FileCheck" size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Акт №{event.act_data?.act_number} подписан
              </p>
              {event.act_data?.signers && (
                <p className="text-xs text-slate-600 mt-1">
                  Подписали: {event.act_data.signers.join(', ')}
                </p>
              )}
            </div>
          </div>
        );
        
      case 'chat_message':
        return (
          <p className="text-sm text-slate-800 whitespace-pre-wrap break-words">{event.content}</p>
        );
        
      default:
        return (
          <p className="text-sm text-slate-800 whitespace-pre-wrap break-words">{event.content}</p>
        );
    }
  };

  const isSystemEvent = ['inspection_created', 'inspection_completed', 'act_signed'].includes(event.type);

  if (isSystemEvent) {
    return (
      <div className="flex justify-center">
        <Card className="max-w-md border-slate-200 bg-slate-50">
          <CardContent className="p-3">
            {renderEventContent()}
            <p className="text-xs text-slate-400 mt-2 text-right">
              {formatTime(event.created_at)}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn('flex gap-3 group', isOwnEvent && 'flex-row-reverse')}>
      <Avatar className="w-10 h-10 flex-shrink-0">
        <AvatarFallback className={cn(
          'text-xs font-semibold',
          isOwnEvent ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
        )}>
          {getInitials(event.author_name)}
        </AvatarFallback>
      </Avatar>

      <div className={cn('flex-1 max-w-[75%]', isOwnEvent && 'flex flex-col items-end')}>
        <div className={cn('mb-1 flex items-center gap-2', isOwnEvent && 'flex-row-reverse')}>
          <span className="text-sm font-semibold text-slate-900">{event.author_name}</span>
          {userRole === 'customer' && event.type === 'work_entry' && !isOwnEvent && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onCreateInspection?.(event.id)}
            >
              <Icon name="ClipboardCheck" size={14} className="mr-1" />
              Проверка
            </Button>
          )}
        </div>

        <Card className={cn(
          'border-none shadow-sm',
          isOwnEvent ? 'bg-blue-50' : 'bg-white',
          event.type === 'work_entry' && !isOwnEvent && 'border-l-4 border-l-green-500',
          event.type === 'defect_added' && 'border-l-4 border-l-amber-500'
        )}>
          <CardContent className="p-3">
            {renderEventContent()}
            <p className={cn('mt-2 text-xs text-slate-400', isOwnEvent && 'text-right')}>
              {formatTime(event.created_at)}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
