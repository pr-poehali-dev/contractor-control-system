import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useNavigate, useParams } from 'react-router-dom';
import { getWorkStatusInfo, formatDateRange } from '@/utils/workStatus';
import { NotificationGroup } from '@/components/ui/notification-badge';
import type { Work } from '@/contexts/AuthContext';

interface WorkHeaderProps {
  selectedWorkData: Work;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  organizationName?: string;
  userRole?: string;
  onEdit?: () => void;
  unreadMessages?: number;
  unreadLogs?: number;
  unreadInspections?: number;
}

export default function WorkHeader({ selectedWorkData, activeTab, setActiveTab, organizationName, userRole, onEdit, unreadMessages, unreadLogs, unreadInspections }: WorkHeaderProps) {
  const navigate = useNavigate();
  const { objectId } = useParams();

  return (
    <>
      {/* MOBILE: Compact header with back button */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3.5 overflow-x-hidden">
        <div className="flex items-start gap-3 mb-2.5">
          <Button 
            variant="ghost" 
            size="icon"
            className="flex-shrink-0 h-9 w-9"
            onClick={() => navigate(`/objects/${objectId}`)}
          >
            <Icon name="ChevronLeft" size={20} />
          </Button>
          
          <div className="flex-1 min-w-0">
            {organizationName && (
              <button
                onClick={() => navigate(`/objects/${objectId}/public`)}
                className="text-[11px] text-slate-500 hover:text-blue-600 truncate leading-tight mb-1 flex items-center gap-1 transition-colors"
              >
                <Icon name="Building2" size={11} />
                <span className="truncate">{organizationName}</span>
                <Icon name="ExternalLink" size={9} />
              </button>
            )}
            <h1 className="text-[15px] font-bold text-slate-900 leading-tight mb-2">{selectedWorkData.title}</h1>
            
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <Badge 
                className={`text-[11px] font-semibold px-2 py-0.5 flex-shrink-0 ${getWorkStatusInfo(selectedWorkData).color}`}
              >
                {getWorkStatusInfo(selectedWorkData).icon} {getWorkStatusInfo(selectedWorkData).message}
              </Badge>
              
              {selectedWorkData.planned_start_date && (
                <div className="flex items-center gap-1 text-[11px] text-slate-500 flex-shrink-0">
                  <Icon name="Calendar" size={12} />
                  <span>{formatDateRange(selectedWorkData.planned_start_date, selectedWorkData.planned_end_date)}</span>
                </div>
              )}
              
              {(userRole === 'client' || userRole === 'admin') && (
                <button
                  onClick={() => navigate(`/objects/${objectId}/works/create`)}
                  className="ml-auto flex-shrink-0 h-7 w-7 flex items-center justify-center hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <Icon name="Settings" size={16} className="text-slate-600" />
                </button>
              )}
            </div>
            
            <NotificationGroup
              messages={unreadMessages}
              logs={userRole !== 'contractor' ? unreadLogs : undefined}
              inspections={userRole === 'contractor' ? unreadInspections : undefined}
              size="xs"
            />
          </div>
        </div>

        {/* Mobile tabs */}
        <div className="border-t border-slate-200 -mx-4 px-4 pt-1 pb-0">
        <div className="grid grid-cols-5 gap-1">
          <button
            onClick={() => setActiveTab('journal')}
            className={`pt-1 pb-0.5 transition-all relative flex flex-col items-center gap-1 rounded-lg ${
              activeTab === 'journal'
                ? 'text-blue-600 bg-blue-50'
                : 'text-slate-600'
            }`}
          >
            <Icon name="MessageSquare" size={18} />
            <span className="text-[10px] font-medium">Журнал</span>
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={`pt-1 pb-0.5 transition-all relative flex flex-col items-center gap-1 rounded-lg ${
              activeTab === 'info'
                ? 'text-blue-600 bg-blue-50'
                : 'text-slate-600'
            }`}
          >
            <Icon name="Info" size={18} />
            <span className="text-[10px] font-medium">Инфо</span>
          </button>
          <button
            onClick={() => setActiveTab('description')}
            className={`pt-1 pb-0.5 transition-all relative flex flex-col items-center gap-1 rounded-lg ${
              activeTab === 'description'
                ? 'text-blue-600 bg-blue-50'
                : 'text-slate-600'
            }`}
          >
            <Icon name="FileText" size={18} />
            <span className="text-[10px] font-medium">Докум.</span>
          </button>
          <button
            onClick={() => setActiveTab('estimate')}
            className={`pt-1 pb-0.5 transition-all relative flex flex-col items-center gap-1 rounded-lg ${
              activeTab === 'estimate'
                ? 'text-blue-600 bg-blue-50'
                : 'text-slate-600'
            }`}
          >
            <Icon name="Calculator" size={18} />
            <span className="text-[10px] font-medium">Смета</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`pt-1 pb-0.5 transition-all relative flex flex-col items-center gap-1 rounded-lg ${
              activeTab === 'analytics'
                ? 'text-blue-600 bg-blue-50'
                : 'text-slate-600'
            }`}
          >
            <Icon name="BarChart" size={18} />
            <span className="text-[10px] font-medium">Данные</span>
          </button>
        </div>
        </div>
      </div>

      {/* DESKTOP: Original header */}
      <div className="hidden md:block bg-gradient-to-b from-white to-slate-50/50 px-6 pt-[18px] pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 min-w-0 mr-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex-shrink-0 flex items-center justify-center shadow-md">
              <Icon name="Wrench" size={18} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold text-slate-900 leading-tight line-clamp-1 mb-1">{selectedWorkData.title}</h2>
              <div className="flex items-center gap-3 flex-wrap">
                {selectedWorkData.planned_start_date && (
                  <div className="flex items-center gap-1.5 text-sm text-slate-600">
                    <Icon name="Calendar" size={14} />
                    <span>{formatDateRange(selectedWorkData.planned_start_date, selectedWorkData.planned_end_date)}</span>
                  </div>
                )}
                <Badge 
                  className={`text-xs font-semibold px-2.5 py-1 ${getWorkStatusInfo(selectedWorkData).color}`}
                >
                  {getWorkStatusInfo(selectedWorkData).icon} {getWorkStatusInfo(selectedWorkData).message}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(userRole === 'client' || userRole === 'admin') && (
              <Button variant="outline" size="default" onClick={() => navigate(`/objects/${objectId}/works/create`)} className="shadow-sm md:hidden">
                <Icon name="Edit" size={16} className="mr-2" />
                Управление
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="hidden md:block border-b border-slate-100">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('journal')}
              className={`pb-3 px-4 text-[15px] font-semibold transition-all relative whitespace-nowrap rounded-t-xl ${
                activeTab === 'journal'
                  ? 'text-blue-600 bg-gradient-to-b from-blue-50/50 to-transparent'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/50'
              }`}
            >
              Журнал
              {activeTab === 'journal' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-lg" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('info')}
              className={`pb-3 px-4 text-[15px] font-semibold transition-all relative whitespace-nowrap rounded-t-xl ${
                activeTab === 'info'
                  ? 'text-blue-600 bg-gradient-to-b from-blue-50/50 to-transparent'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/50'
              }`}
            >
              Информация
              {activeTab === 'info' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-lg" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('description')}
              className={`pb-3 px-4 text-[15px] font-semibold transition-all relative whitespace-nowrap rounded-t-xl ${
                activeTab === 'description'
                  ? 'text-blue-600 bg-gradient-to-b from-blue-50/50 to-transparent'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/50'
              }`}
            >Регламенты</button>
            <button
              onClick={() => setActiveTab('estimate')}
              className={`pb-3 px-4 text-[15px] font-semibold transition-all relative whitespace-nowrap rounded-t-xl ${
                activeTab === 'estimate'
                  ? 'text-blue-600 bg-gradient-to-b from-blue-50/50 to-transparent'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/50'
              }`}
            >
              Смета
              {activeTab === 'estimate' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-lg" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`pb-3 px-4 text-[15px] font-semibold transition-all relative whitespace-nowrap rounded-t-xl ${
                activeTab === 'analytics'
                  ? 'text-blue-600 bg-gradient-to-b from-blue-50/50 to-transparent'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/50'
              }`}
            >
              Аналитика
              {activeTab === 'analytics' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-lg" />
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}