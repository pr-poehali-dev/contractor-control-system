import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

interface Work {
  id: number;
  title: string;
  description: string;
  object_id: number;
  status: string;
  contractor_name?: string;
  start_date?: string;
  end_date?: string;
}

interface BuildingObject {
  id: number;
  title: string;
  address?: string;
  description?: string;
  status: string;
  created_at: string;
  updated_at?: string;
}

const GanttChart = ({ works }: { works: Work[] }) => {
  const sortedWorks = [...works].sort((a, b) => 
    new Date(a.start_date!).getTime() - new Date(b.start_date!).getTime()
  );

  const allDates = sortedWorks.flatMap(w => [
    new Date(w.start_date!).getTime(),
    new Date(w.end_date!).getTime()
  ]);
  const minDate = Math.min(...allDates);
  const maxDate = Math.max(...allDates);
  const totalDays = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)) + 1;

  const getMonthsInRange = () => {
    const months: { label: string; days: number }[] = [];
    const current = new Date(minDate);
    
    while (current.getTime() <= maxDate) {
      const year = current.getFullYear();
      const month = current.getMonth();
      const monthStart = new Date(year, month, 1);
      const monthEnd = new Date(year, month + 1, 0);
      
      const rangeStart = Math.max(monthStart.getTime(), minDate);
      const rangeEnd = Math.min(monthEnd.getTime(), maxDate);
      const days = Math.ceil((rangeEnd - rangeStart) / (1000 * 60 * 60 * 24)) + 1;
      
      months.push({
        label: current.toLocaleDateString('ru-RU', { month: 'short', year: 'numeric' }),
        days
      });
      
      current.setMonth(current.getMonth() + 1);
    }
    
    return months;
  };

  const months = getMonthsInRange();

  return (
    <div className="space-y-2">
      <div className="flex border-b border-slate-200 pb-2 mb-4">
        <div className="w-48 flex-shrink-0" />
        <div className="flex-1 flex">
          {months.map((month, idx) => (
            <div 
              key={idx}
              className="text-xs font-medium text-slate-600 text-center border-l border-slate-200 px-2"
              style={{ width: `${(month.days / totalDays) * 100}%` }}
            >
              {month.label}
            </div>
          ))}
        </div>
      </div>

      {sortedWorks.map((work) => {
        const workStart = new Date(work.start_date!).getTime();
        const workEnd = new Date(work.end_date!).getTime();
        const offsetDays = Math.ceil((workStart - minDate) / (1000 * 60 * 60 * 24));
        const durationDays = Math.ceil((workEnd - workStart) / (1000 * 60 * 60 * 24)) + 1;
        const leftPercent = (offsetDays / totalDays) * 100;
        const widthPercent = (durationDays / totalDays) * 100;

        return (
          <div key={work.id} className="flex items-center gap-2 py-2 hover:bg-slate-50 rounded">
            <div className="w-48 flex-shrink-0 pr-4">
              <p className="text-sm font-medium text-slate-900 truncate">{work.title}</p>
              {work.contractor_name && (
                <p className="text-xs text-slate-500 truncate">{work.contractor_name}</p>
              )}
            </div>
            <div className="flex-1 relative h-8">
              <div className="absolute inset-0 flex items-center">
                <div 
                  className="absolute h-6 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-medium shadow-sm"
                  style={{ 
                    left: `${leftPercent}%`,
                    width: `${widthPercent}%`,
                    minWidth: '60px'
                  }}
                >
                  {durationDays}д
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const PublicObject = () => {
  const { objectId } = useParams();
  const navigate = useNavigate();
  const { userData } = useAuth();
  const [object, setObject] = useState<BuildingObject | null>(null);
  const [works, setWorks] = useState<Work[]>([]);
  const [activeTab, setActiveTab] = useState('info');
  const [scheduleView, setScheduleView] = useState<'list' | 'gantt'>('list');

  useEffect(() => {
    if (userData?.objects && objectId) {
      const foundObject = userData.objects.find((obj: BuildingObject) => obj.id === Number(objectId));
      setObject(foundObject || null);
      
      if (userData.works) {
        const objectWorks = userData.works.filter((work: Work) => 
          work.object_id === Number(objectId)
        );
        setWorks(objectWorks);
      }
    }
  }, [userData, objectId]);

  if (!object) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Icon name="Building2" size={64} className="text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Объект не найден</h2>
          <Button onClick={() => navigate('/profile')} variant="outline" className="mt-4">
            Вернуться к профилю
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', { 
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/profile')}
            >
              <Icon name="ArrowLeft" size={20} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
            >
              <Icon name="MoreVertical" size={20} />
            </Button>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 mb-4 flex items-center justify-center">
              <Icon name="Building2" size={40} className="text-blue-600" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 mb-6">{object.title}</h1>
          </div>
        </div>

        <div className="container max-w-4xl mx-auto px-4 pb-3">
          <div className="space-y-2 w-full">
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setActiveTab('journal')}
                className={`text-xs md:text-sm py-2 px-3 rounded-md transition-colors ${
                  activeTab === 'journal' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Журнал работ
              </button>
              <button
                onClick={() => setActiveTab('schedule')}
                className={`text-xs md:text-sm py-2 px-3 rounded-md transition-colors ${
                  activeTab === 'schedule' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                График
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`text-xs md:text-sm py-2 px-3 rounded-md transition-colors ${
                  activeTab === 'analytics' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Аналитика
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setActiveTab('inspections')}
                className={`text-xs md:text-sm py-2 px-3 rounded-md transition-colors ${
                  activeTab === 'inspections' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Проверки
              </button>
              <button
                onClick={() => setActiveTab('info')}
                className={`text-xs md:text-sm py-2 px-3 rounded-md transition-colors ${
                  activeTab === 'info' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Общая информация
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-6">
          {activeTab === 'info' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Даты</h2>
              <div className="space-y-3">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <span className="text-slate-600 text-sm md:text-base">Дата старта работ</span>
                      <span className="text-slate-900 font-medium text-sm md:text-base">
                        {object.created_at ? formatDate(object.created_at) : '—'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <span className="text-slate-600 text-sm md:text-base">Дата заключения договора</span>
                      <span className="text-slate-900 font-medium text-sm md:text-base">
                        {object.updated_at ? formatDate(object.updated_at) : '—'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Характеристики</h2>
              <div className="space-y-3">
                {object.address && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <span className="text-slate-600 text-sm md:text-base">Адрес</span>
                        <span className="text-slate-900 font-medium text-sm md:text-base text-left md:text-right">
                          {object.address}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )}
                {object.description && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <span className="text-slate-600 text-sm md:text-base">Описание</span>
                        <span className="text-slate-900 font-medium text-sm md:text-base text-left md:text-right">
                          {object.description}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 text-sm md:text-base">Проект</span>
                      <Button variant="link" className="text-blue-600 p-0 h-auto text-sm md:text-base">
                        Скачать
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 text-sm md:text-base">Разрешительная документация</span>
                      <Button variant="link" className="text-blue-600 p-0 h-auto text-sm md:text-base">
                        Скачать
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
          )}

          {activeTab === 'journal' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Журнал работ</h2>
            {works.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Icon name="Briefcase" size={48} className="text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600">Нет работ в журнале</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {works.map((work) => (
                  <Card key={work.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-slate-900 mb-1">{work.title}</h3>
                      {work.description && (
                        <p className="text-sm text-slate-600 mb-2">{work.description}</p>
                      )}
                      {work.contractor_name && (
                        <p className="text-sm text-slate-500 flex items-center gap-1">
                          <Icon name="Users" size={14} />
                          {work.contractor_name}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
          )}

          {activeTab === 'schedule' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">График работ</h2>
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

            {works.filter(w => w.start_date && w.end_date).length === 0 ? (
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
                    {works.filter(w => w.start_date && w.end_date).map((work) => (
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
                        <GanttChart works={works.filter(w => w.start_date && w.end_date)} />
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
          )}

          {activeTab === 'analytics' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Аналитика</h2>
            <Card>
              <CardContent className="p-8 text-center">
                <Icon name="BarChart3" size={48} className="text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600">Раздел в разработке</p>
              </CardContent>
            </Card>
          </div>
          )}

          {activeTab === 'inspections' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Проверки</h2>
            <Card>
              <CardContent className="p-8 text-center">
                <Icon name="ClipboardCheck" size={48} className="text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600">Раздел в разработке</p>
              </CardContent>
            </Card>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicObject;