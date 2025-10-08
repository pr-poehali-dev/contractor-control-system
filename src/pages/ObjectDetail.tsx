import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';

type WorkStatus = 'inProgress' | 'review' | 'completed' | 'defects';

interface Work {
  id: string;
  name: string;
  contractor: string;
  status: WorkStatus;
  progress: number;
  defectsCount: number;
  lastEntry?: string;
  unreadCount?: number;
}

interface JournalEntry {
  id: string;
  date: string;
  time: string;
  type: 'work' | 'inspection' | 'defect' | 'system';
  author: string;
  description: string;
  photos?: number;
  volume?: string;
  materials?: string;
}

const mockWorks: Work[] = [
  { 
    id: 'w1', 
    name: 'Замена кровли', 
    contractor: 'ООО "СтройМастер"', 
    status: 'inProgress', 
    progress: 80, 
    defectsCount: 2,
    lastEntry: 'Выполнены работы по монтажу...',
    unreadCount: 3
  },
  { 
    id: 'w2', 
    name: 'Ремонт фасада', 
    contractor: 'ООО "СтройМастер"', 
    status: 'review', 
    progress: 100, 
    defectsCount: 0,
    lastEntry: 'Работы завершены, ожидается приёмка'
  },
  { 
    id: 'w3', 
    name: 'Замена окон', 
    contractor: 'ИП Иванов', 
    status: 'completed', 
    progress: 100, 
    defectsCount: 0,
    lastEntry: 'Работы приняты без замечаний'
  },
  { 
    id: 'w4', 
    name: 'Ремонт подъезда №1', 
    contractor: 'ООО "РемонтПро"', 
    status: 'defects', 
    progress: 65, 
    defectsCount: 5,
    lastEntry: 'Выявлены замечания по качеству штукатурки',
    unreadCount: 1
  },
];

const mockJournalEntries: Record<string, JournalEntry[]> = {
  w1: [
    {
      id: 'j1',
      date: '05.10.2025',
      time: '14:30',
      type: 'work',
      author: 'Иванов С.С.',
      description: 'Выполнены работы по монтажу кровельного покрытия на площади 150 м². Использован материал согласно смете.',
      photos: 8,
      volume: '150 м²',
      materials: 'Металлочерепица Монтеррей, саморезы кровельные'
    },
    {
      id: 'j2',
      date: '05.10.2025',
      time: '10:15',
      type: 'inspection',
      author: 'Петров А.И. (Технадзор)',
      description: 'Проведена проверка качества монтажа. Выявлены замечания: недостаточная герметизация стыков на участке 2А.',
      photos: 5
    },
    {
      id: 'j3',
      date: '04.10.2025',
      time: '16:45',
      type: 'work',
      author: 'Иванов С.С.',
      description: 'Демонтаж старого кровельного покрытия, подготовка основания под новое покрытие',
      photos: 12,
      volume: '200 м²'
    },
    {
      id: 'j4',
      date: '03.10.2025',
      time: '09:00',
      type: 'system',
      author: 'Система',
      description: 'Работы переведены в статус "В работе". Подрядчик: ООО "СтройМастер"'
    }
  ],
  w2: [
    {
      id: 'j5',
      date: '06.10.2025',
      time: '15:20',
      type: 'work',
      author: 'Сидоров М.П.',
      description: 'Завершены работы по окраске фасада. Площадь обработки: 450 м²',
      photos: 15,
      volume: '450 м²',
      materials: 'Краска фасадная атмосферостойкая'
    },
    {
      id: 'j6',
      date: '05.10.2025',
      time: '11:30',
      type: 'work',
      author: 'Сидоров М.П.',
      description: 'Нанесение второго слоя фасадной краски',
      photos: 10
    }
  ]
};

const getStatusIcon = (status: WorkStatus) => {
  switch (status) {
    case 'completed':
      return '✅';
    case 'inProgress':
      return '🟡';
    case 'review':
      return '🔵';
    case 'defects':
      return '🔴';
  }
};

const getStatusLabel = (status: WorkStatus) => {
  switch (status) {
    case 'completed':
      return 'Завершено';
    case 'inProgress':
      return 'В работе';
    case 'review':
      return 'На проверке';
    case 'defects':
      return 'Замечания';
  }
};

const ObjectDetail = () => {
  const { projectId, objectId } = useParams();
  const navigate = useNavigate();
  const [selectedWork, setSelectedWork] = useState<Work | null>(mockWorks[0]);
  const [isMobileJournalOpen, setIsMobileJournalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<WorkStatus | 'all'>('all');

  const filteredWorks = mockWorks.filter(work => {
    const matchesSearch = work.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         work.contractor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || work.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const journalEntries = selectedWork ? (mockJournalEntries[selectedWork.id] || []) : [];

  const handleWorkClick = (work: Work) => {
    setSelectedWork(work);
    setIsMobileJournalOpen(true);
  };

  const handleBackToList = () => {
    setIsMobileJournalOpen(false);
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate(`/projects/${projectId}`)}
            className="flex-shrink-0"
          >
            <Icon name="ChevronLeft" size={20} />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-slate-900 truncate">ул. Ленина, д. 10</h1>
            <p className="text-sm text-slate-600 truncate">Капремонт Казани 2025</p>
          </div>
          <Button 
            size="sm"
            onClick={() => navigate(`/projects/${projectId}/objects/${objectId}/works/create`)}
            className="flex-shrink-0"
          >
            <Icon name="Plus" size={18} />
            <span className="ml-2 hidden sm:inline">Работа</span>
          </Button>
        </div>
      </div>

      {/* Two-panel layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel - Works list (hidden on mobile when journal is open) */}
        <div className={cn(
          "w-full md:w-96 bg-white border-r border-slate-200 flex flex-col",
          isMobileJournalOpen && "hidden md:flex"
        )}>
          {/* Search */}
          <div className="p-3 border-b border-slate-200">
            <div className="relative">
              <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input 
                placeholder="Поиск работ..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Status filter tabs */}
          <div className="flex gap-1 p-2 border-b border-slate-200 overflow-x-auto">
            <Button
              size="sm"
              variant={statusFilter === 'all' ? 'default' : 'ghost'}
              onClick={() => setStatusFilter('all')}
              className="flex-shrink-0"
            >
              Все
            </Button>
            <Button
              size="sm"
              variant={statusFilter === 'inProgress' ? 'default' : 'ghost'}
              onClick={() => setStatusFilter('inProgress')}
              className="flex-shrink-0"
            >
              🟡 В работе
            </Button>
            <Button
              size="sm"
              variant={statusFilter === 'review' ? 'default' : 'ghost'}
              onClick={() => setStatusFilter('review')}
              className="flex-shrink-0"
            >
              🔵 Проверка
            </Button>
            <Button
              size="sm"
              variant={statusFilter === 'defects' ? 'default' : 'ghost'}
              onClick={() => setStatusFilter('defects')}
              className="flex-shrink-0"
            >
              🔴 Замечания
            </Button>
            <Button
              size="sm"
              variant={statusFilter === 'completed' ? 'default' : 'ghost'}
              onClick={() => setStatusFilter('completed')}
              className="flex-shrink-0"
            >
              ✅ Готово
            </Button>
          </div>

          {/* Works list */}
          <div className="flex-1 overflow-y-auto">
            {filteredWorks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                  <Icon name="Search" size={32} className="text-slate-400" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Работы не найдены</h3>
                <p className="text-sm text-slate-600">Попробуйте изменить фильтры</p>
              </div>
            ) : (
              filteredWorks.map((work) => (
              <div
                key={work.id}
                onClick={() => handleWorkClick(work)}
                className={cn(
                  "px-4 py-3 border-b border-slate-100 cursor-pointer transition-colors hover:bg-slate-50",
                  selectedWork?.id === work.id && "bg-blue-50 hover:bg-blue-50 border-l-4 border-l-[#2563EB]"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-xl">
                    {getStatusIcon(work.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900 truncate">{work.name}</h3>
                      {work.unreadCount && work.unreadCount > 0 && (
                        <Badge className="bg-[#2563EB] text-white rounded-full h-5 min-w-[20px] px-1.5 flex items-center justify-center text-xs">
                          {work.unreadCount}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mb-1">{work.contractor}</p>
                    {work.lastEntry && (
                      <p className="text-sm text-slate-500 truncate">{work.lastEntry}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {getStatusLabel(work.status)}
                      </Badge>
                      {work.defectsCount > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {work.defectsCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
            )}
          </div>
        </div>

        {/* Right panel - Journal (chat-like) */}
        <div className={cn(
          "flex-1 flex flex-col bg-white",
          !isMobileJournalOpen && "hidden md:flex"
        )}>
          {selectedWork ? (
            <>
              {/* Journal header */}
              <div className="px-4 py-3 border-b border-slate-200 bg-white">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBackToList}
                    className="md:hidden flex-shrink-0"
                  >
                    <Icon name="ChevronLeft" size={20} />
                  </Button>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-slate-900 truncate">{selectedWork.name}</h2>
                    <p className="text-sm text-slate-600 truncate">{selectedWork.contractor}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant="outline">
                      {getStatusIcon(selectedWork.status)} {getStatusLabel(selectedWork.status)}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Journal entries (messages) */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {journalEntries.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                      <Icon name="MessageSquare" size={32} className="text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Журнал пуст</h3>
                    <p className="text-slate-600">Записи о работах появятся здесь</p>
                  </div>
                ) : (
                  journalEntries.map((entry, index) => (
                    <div 
                      key={entry.id} 
                      className="flex gap-3 animate-fade-in"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      {/* Avatar */}
                      <Avatar className="flex-shrink-0">
                        <AvatarFallback className={cn(
                          entry.type === 'system' ? 'bg-slate-200 text-slate-600' :
                          entry.type === 'inspection' ? 'bg-orange-100 text-orange-700' :
                          entry.type === 'defect' ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                        )}>
                          {entry.type === 'system' ? '⚙️' :
                           entry.type === 'inspection' ? '🔍' :
                           entry.type === 'defect' ? '⚠️' :
                           entry.author.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>

                      {/* Message bubble */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm text-slate-900">{entry.author}</span>
                          <span className="text-xs text-slate-500">{entry.date} • {entry.time}</span>
                        </div>
                        
                        <div className={cn(
                          "rounded-lg p-3",
                          entry.type === 'system' ? 'bg-slate-50 border border-slate-200' :
                          entry.type === 'inspection' ? 'bg-orange-50 border border-orange-200' :
                          entry.type === 'defect' ? 'bg-red-50 border border-red-200' :
                          'bg-blue-50 border border-blue-200'
                        )}>
                          <p className="text-sm text-slate-900 whitespace-pre-wrap">{entry.description}</p>
                          
                          {/* Metadata */}
                          {(entry.volume || entry.materials) && (
                            <div className="mt-2 pt-2 border-t border-slate-200 space-y-1">
                              {entry.volume && (
                                <div className="flex items-center gap-2 text-xs text-slate-600">
                                  <Icon name="Box" size={14} />
                                  <span>Объём: {entry.volume}</span>
                                </div>
                              )}
                              {entry.materials && (
                                <div className="flex items-center gap-2 text-xs text-slate-600">
                                  <Icon name="Package" size={14} />
                                  <span>Материалы: {entry.materials}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Photos */}
                          {entry.photos && entry.photos > 0 && (
                            <div className="mt-2 flex items-center gap-2">
                              <div className="flex -space-x-2">
                                {Array.from({ length: Math.min(entry.photos, 3) }).map((_, i) => (
                                  <div 
                                    key={i}
                                    className="w-12 h-12 rounded bg-slate-200 border-2 border-white flex items-center justify-center"
                                  >
                                    <Icon name="Image" size={16} className="text-slate-500" />
                                  </div>
                                ))}
                              </div>
                              {entry.photos > 3 && (
                                <span className="text-xs text-slate-600">+{entry.photos - 3} фото</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add entry button */}
              <div className="p-4 border-t border-slate-200 bg-white hidden md:block">
                <Button 
                  className="w-full"
                  size="lg"
                  onClick={() => navigate(`/work-log?workId=${selectedWork.id}`)}
                >
                  <Icon name="Plus" size={20} className="mr-2" />
                  Добавить запись в журнал
                </Button>
              </div>

              {/* Floating button (mobile) */}
              <Button
                size="lg"
                className="md:hidden fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg p-0 z-50"
                onClick={() => navigate(`/work-log?workId=${selectedWork.id}`)}
              >
                <Icon name="Plus" size={24} />
              </Button>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center">
              <div>
                <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <Icon name="MessageSquare" size={40} className="text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Выберите работу</h3>
                <p className="text-slate-600">Журнал работ появится справа</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ObjectDetail;