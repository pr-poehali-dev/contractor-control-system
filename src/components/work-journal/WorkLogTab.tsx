import { useAuthRedux } from '@/hooks/useAuthRedux';
import { api, InspectionEvent as ApiInspectionEvent } from '@/lib/api';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface WorkLogTabProps {
  workId: number;
  objectId: number;
  onCreateInspection?: () => void;
  onCreateReport?: () => void;
  userRole?: string;
}

export default function WorkLogTab({ workId, objectId, onCreateInspection, onCreateReport, userRole }: WorkLogTabProps) {
  const { userData } = useAuthRedux();
  const navigate = useNavigate();
  const [inspectionEvents, setInspectionEvents] = useState<ApiInspectionEvent[]>([]);

  const workLogs = (userData?.workLogs && Array.isArray(userData.workLogs)) ? userData.workLogs : [];
  const inspections = (userData?.inspections && Array.isArray(userData.inspections)) ? userData.inspections : [];

  useEffect(() => {
    const loadInspectionEvents = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) return;
      
      try {
        const events = await api.getInspectionEvents(token);
        setInspectionEvents(events);
      } catch (error) {
        console.error('Failed to load inspection events:', error);
        setInspectionEvents([]);
      }
    };
    
    loadInspectionEvents();
  }, [userData]);

  const workReports = workLogs
    .filter(log => log.work_id === workId && !log.is_inspection_start && !log.is_inspection_completed)
    .map(log => ({ type: 'report' as const, data: log, created_at: log.created_at }));

  const workInspections = inspections
    .filter(i => i.work_id === workId)
    .map(i => ({ type: 'inspection' as const, data: i, created_at: i.created_at }));

  const allEvents = [...workReports, ...workInspections]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge className="bg-amber-100 text-amber-700 border-amber-200">Запланирована</Badge>;
      case 'started':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200">В процессе</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-700 border-green-200">Завершена</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 w-full overflow-x-hidden">
      <div className="px-3 py-4 md:p-6 max-w-5xl mx-auto w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Журнал работ</h3>
          {userRole === 'client' || userRole === 'admin' ? (
            <Button onClick={onCreateInspection} size="sm" className="flex-shrink-0">
              <Icon name="ClipboardCheck" size={16} className="mr-2" />
              <span className="hidden sm:inline">Создать проверку</span>
              <span className="sm:hidden">Проверка</span>
            </Button>
          ) : (
            <Button onClick={onCreateReport} size="sm" className="flex-shrink-0">
              <Icon name="FileText" size={16} className="mr-2" />
              <span className="hidden sm:inline">Создать отчёт</span>
              <span className="sm:hidden">Отчёт</span>
            </Button>
          )}
        </div>
        
        <div className="space-y-4">
        
        {allEvents.map((event) => event.type === 'report' ? (
          <div key={event.data.id} className="bg-white rounded-lg shadow-sm border border-slate-200 p-3 md:p-4 relative">
            <div className="flex items-start gap-2.5 pb-6">
              <div className="w-9 h-9 md:w-10 md:h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Icon name="ClipboardCheck" size={18} className="text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 text-sm md:text-base mb-1">Отчёт о работе</h3>
                <div className="text-xs md:text-sm text-slate-500 mb-2">
                  {event.data.author_name}
                </div>

                {event.data.description && (
                  <p className="text-xs md:text-sm text-slate-700 mb-2 line-clamp-2">{event.data.description}</p>
                )}

                <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-xs md:text-sm">
                  {event.data.completion_percentage !== undefined && event.data.completion_percentage !== null && (
                    <div className="flex items-center gap-1.5 text-green-600 font-medium">
                      <Icon name="TrendingUp" size={14} />
                      <span>{event.data.completion_percentage}%</span>
                    </div>
                  )}
                  {event.data.volume && (
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Icon name="Box" size={14} />
                      <span>{event.data.volume}</span>
                    </div>
                  )}
                </div>

                {event.data.photo_urls && event.data.photo_urls.split(',').filter(url => url.trim()).length > 0 && (
                  <div className="grid grid-cols-3 gap-1.5 md:gap-2 mt-2.5">
                    {event.data.photo_urls.split(',').filter(url => url.trim()).slice(0, 3).map((url, idx) => (
                      <img
                        key={idx}
                        src={url.trim()}
                        alt={`Фото ${idx + 1}`}
                        className="w-full h-16 md:h-20 object-cover rounded border border-slate-200"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="absolute bottom-2 right-3 text-xs text-slate-400">
              {formatDate(event.data.created_at)} в {formatTime(event.data.created_at)}
            </div>
          </div>
        ) : (
          (() => {
            const inspection = event.data;
            const defectsArray = inspection.defects ? JSON.parse(inspection.defects) : [];
            
            return (
              <div 
                key={inspection.id} 
                className="bg-white rounded-lg shadow-sm border border-slate-200 p-3 md:p-4 cursor-pointer hover:shadow-md transition-shadow relative"
                onClick={() => navigate(`/inspection/${inspection.id}`)}
              >
                <div className="flex items-start gap-2.5 pb-6">
                  <div className="w-9 h-9 md:w-10 md:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon name="ClipboardCheck" size={18} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-slate-900 text-sm md:text-base">
                        Проверка №{inspection.inspection_number}
                      </h3>
                      {getStatusBadge(inspection.status)}
                    </div>
                    <div className="text-xs md:text-sm text-slate-500 mb-2">
                      {inspection.author_name}
                    </div>

                    <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-xs md:text-sm">
                      <div className="flex items-center gap-1.5">
                        <Icon name="AlertCircle" size={14} className="text-amber-500" />
                        <span className="text-slate-600">Замечаний: <strong>{defectsArray.length}</strong></span>
                      </div>
                      {inspection.scheduled_date && (
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Icon name="Calendar" size={14} />
                          <span>Запланирована на {new Date(inspection.scheduled_date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-2 right-3 text-xs text-slate-400">
                  {formatDate(inspection.created_at)}
                </div>
              </div>
            );
          })()
        ))}

        {allEvents.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="FileText" size={32} className="text-slate-400" />
            </div>
            <p className="text-slate-500">Пока нет записей в журнале работ</p>
            <p className="text-sm text-slate-400 mt-1">Отчёты и проверки появятся здесь</p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}