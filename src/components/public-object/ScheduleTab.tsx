import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Work } from './types';
import GanttChart from './GanttChart';

interface ScheduleTabProps {
  works: Work[];
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const ScheduleTab = ({ works, onRefresh, isRefreshing }: ScheduleTabProps) => {
  const [scheduleView, setScheduleView] = useState<'list' | 'gantt'>('list');
  const worksWithDates = works.filter(w => w.start_date && w.end_date);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">График работ</h2>
        <div className="flex gap-2 items-center">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
              title="Обновить данные"
            >
              <Icon name={isRefreshing ? "Loader2" : "RefreshCw"} size={18} className={isRefreshing ? "animate-spin" : ""} />
            </button>
          )}
          <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
          <button
            onClick={() => setScheduleView('list')}
            className={`px-3 py-1.5 text-xs md:text-sm rounded-md transition-colors ${
              scheduleView === 'list' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Icon name="List" size={16} className="inline mr-1" />
            Список
          </button>
          <button
            onClick={() => setScheduleView('gantt')}
            className={`px-3 py-1.5 text-xs md:text-sm rounded-md transition-colors ${
              scheduleView === 'gantt' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Icon name="BarChart3" size={16} className="inline mr-1 rotate-90" />
            Диаграмма
          </button>
          </div>
        </div>
      </div>

      {worksWithDates.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Icon name="Calendar" size={48} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600">Нет работ с указанными сроками</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {scheduleView === 'list' ? (
            <div className="space-y-3">
              {worksWithDates.map((work) => (
                <Card key={work.id}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-slate-900">{work.title}</h3>
                        {work.contractor_name && (
                          <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                            <Icon name="Users" size={14} />
                            {work.contractor_name}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-sm">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Icon name="CalendarDays" size={16} className="text-green-600" />
                          <span className="font-medium">Начало:</span>
                          <span>{new Date(work.start_date!).toLocaleDateString('ru-RU')}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Icon name="CalendarCheck" size={16} className="text-blue-600" />
                          <span className="font-medium">Окончание:</span>
                          <span>{new Date(work.end_date!).toLocaleDateString('ru-RU')}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div 
                            className="h-full bg-blue-600 rounded-full transition-all"
                            style={{
                              width: `${Math.min(100, Math.max(0, 
                                ((new Date().getTime() - new Date(work.start_date!).getTime()) / 
                                (new Date(work.end_date!).getTime() - new Date(work.start_date!).getTime())) * 100
                              ))}%`
                            }}
                          />
                        </div>
                        <span className="text-xs text-slate-500 min-w-[45px] text-right">
                          {Math.min(100, Math.max(0, Math.round(
                            ((new Date().getTime() - new Date(work.start_date!).getTime()) / 
                            (new Date(work.end_date!).getTime() - new Date(work.start_date!).getTime())) * 100
                          )))}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-4 overflow-x-auto">
                <div className="min-w-[600px]">
                  <GanttChart works={worksWithDates} />
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default ScheduleTab;