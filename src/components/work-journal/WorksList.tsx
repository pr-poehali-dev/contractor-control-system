import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { NotificationGroup } from '@/components/ui/notification-badge';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { getWorkStatusInfo, formatDateRange } from '@/utils/workStatus';
import { useAuth } from '@/contexts/AuthContext';
import type { Work } from '@/contexts/AuthContext';

interface WorksListProps {
  works: Work[];
  workLogs: any[];
  selectedWork: number | null;
  setSelectedWork: (id: number) => void;
  getInitials: (name: string) => string;
  formatTime: (timestamp: string) => string;
  objectId: number;
}

export default function WorksList({
  works,
  workLogs,
  selectedWork,
  setSelectedWork,
  getInitials,
  formatTime,
  objectId,
}: WorksListProps) {
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const unreadCounts = userData?.unreadCounts || {};
  const isContractor = user?.role === 'contractor';
  return (
    <div className="hidden md:block w-80 bg-white border-r border-slate-200 flex-col">
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-lg">Работы ({works.length})</h3>
          <Button
            size="sm"
            onClick={() => navigate(`/objects/${objectId}/works/create`)}
          >Управление +</Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {works.length === 0 ? (
          <div className="p-8 text-center">
            <Icon name="Briefcase" size={48} className="text-slate-300 mx-auto mb-4" />
            <p className="text-sm text-slate-600 mb-4">Нет работ на этом объекте</p>
            <Button
              size="sm"
              onClick={() => navigate(`/objects/${objectId}/works/create`)}
            >
              <Icon name="Plus" size={16} className="mr-2" />
              Добавить первую работу
            </Button>
          </div>
        ) : (
          <div className="p-2">
            {works.map((work) => {
              const logs = workLogs.filter(log => log.work_id === work.id);
              const lastLog = logs[0];
              
              return (
                <button
                  key={work.id}
                  onClick={() => setSelectedWork(work.id)}
                  className={cn(
                    'w-full text-left p-3 rounded-lg mb-2 transition-colors',
                    selectedWork === work.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'hover:bg-slate-50'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10 flex-shrink-0">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs font-semibold">
                        {getInitials(work.title)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-sm truncate">{work.title}</h4>
                        {lastLog && selectedWork !== work.id && (
                          <span className="text-xs text-slate-400 ml-2">{formatTime(lastLog.created_at)}</span>
                        )}
                      </div>
                      {selectedWork !== work.id && (
                        <>
                          {work.planned_start_date && (
                            <div className="flex items-center gap-1 text-xs text-slate-500 mb-1.5">
                              <Icon name="Calendar" size={11} />
                              <span>{formatDateRange(work.planned_start_date, work.planned_end_date)}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <Badge 
                              variant="outline" 
                              className={cn("text-xs font-medium px-2 py-0.5", getWorkStatusInfo(work).color)}
                            >
                              {getWorkStatusInfo(work).icon} {getWorkStatusInfo(work).message}
                            </Badge>
                            <NotificationGroup
                              messages={unreadCounts[work.id]?.messages}
                              logs={!isContractor ? unreadCounts[work.id]?.logs : undefined}
                              inspections={isContractor ? unreadCounts[work.id]?.inspections : undefined}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}