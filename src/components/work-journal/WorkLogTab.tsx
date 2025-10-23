import { useAuth } from '@/contexts/AuthContext';
import { api, InspectionEvent as ApiInspectionEvent } from '@/lib/api';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';

interface WorkLogTabProps {
  workId: number;
  objectId: number;
}

export default function WorkLogTab({ workId, objectId }: WorkLogTabProps) {
  const { userData } = useAuth();
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
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const workInspections = inspections
    .filter(i => i.work_id === workId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
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
      <div className="px-3 py-4 md:p-6 max-w-5xl mx-auto w-full space-y-4">
        
        {workReports.map((report) => (
          <div key={report.id} className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Icon name="ClipboardCheck" size={20} className="text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900">Отчёт о работе</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-slate-500">
                    {report.author_name}
                  </span>
                  <span className="text-xs text-slate-400">
                    {formatDate(report.created_at)} в {formatTime(report.created_at)}
                  </span>
                </div>
              </div>
            </div>

            {report.description && (
              <p className="text-sm text-slate-700 mb-3">{report.description}</p>
            )}

            {report.volume && (
              <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                <Icon name="Box" size={16} />
                <span>Объём: <strong>{report.volume}</strong></span>
              </div>
            )}

            {report.materials && (
              <div className="flex items-start gap-2 text-sm text-slate-600 mb-2">
                <Icon name="Package" size={16} className="mt-0.5" />
                <span>Материалы: <strong>{report.materials}</strong></span>
              </div>
            )}

            {report.completion_percentage !== undefined && report.completion_percentage !== null && (
              <div className="flex items-center gap-2 text-sm mb-3">
                <Icon name="TrendingUp" size={16} className="text-green-600" />
                <span className="text-green-600 font-semibold">
                  Выполнено: {report.completion_percentage}%
                </span>
              </div>
            )}

            {report.photo_urls && report.photo_urls.split(',').filter(url => url.trim()).length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                {report.photo_urls.split(',').filter(url => url.trim()).map((url, idx) => (
                  <img
                    key={idx}
                    src={url.trim()}
                    alt={`Фото ${idx + 1}`}
                    className="w-full h-20 object-cover rounded-lg border border-slate-200"
                  />
                ))}
              </div>
            )}
          </div>
        ))}

        {workInspections.map((inspection) => {
          const defectsArray = inspection.defects ? JSON.parse(inspection.defects) : [];
          
          return (
            <div 
              key={inspection.id} 
              className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/inspection/${inspection.id}`)}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Icon name="ClipboardCheck" size={20} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-slate-900">
                      Проверка №{inspection.inspection_number}
                    </h3>
                    {getStatusBadge(inspection.status)}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-slate-500">
                      {inspection.author_name}
                    </span>
                    <span className="text-xs text-slate-400">
                      {formatDate(inspection.created_at)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <Icon name="Wrench" size={16} className="text-slate-400" />
                  <span className="text-slate-600">{inspection.work_type_name || 'Работа'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Icon name="AlertCircle" size={16} className="text-amber-500" />
                  <span className="text-slate-600">Замечаний: <strong>{defectsArray.length}</strong></span>
                </div>
              </div>

              {inspection.scheduled_date && (
                <div className="flex items-center gap-2 text-sm text-slate-500 mt-2">
                  <Icon name="Calendar" size={16} />
                  <span>Запланирована на {new Date(inspection.scheduled_date).toLocaleDateString('ru-RU')}</span>
                </div>
              )}
            </div>
          );
        })}

        {workReports.length === 0 && workInspections.length === 0 && (
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
  );
}
