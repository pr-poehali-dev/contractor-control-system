import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useNavigate, useParams } from 'react-router-dom';

interface WorkHeaderProps {
  selectedWorkData: any;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  organizationName?: string;
  userRole?: string;
  onEdit?: () => void;
}

export default function WorkHeader({ selectedWorkData, activeTab, setActiveTab, organizationName, userRole, onEdit }: WorkHeaderProps) {
  const navigate = useNavigate();
  const { objectId } = useParams();

  return (
    <>
      {/* MOBILE: Compact header with back button */}
      <div className="md:hidden bg-white border-b border-slate-200 px-2.5 py-2 overflow-x-hidden">
        <div className="flex items-center gap-2 mb-2">
          <Button 
            variant="ghost" 
            size="icon"
            className="flex-shrink-0 h-8 w-8"
            onClick={() => navigate(`/objects/${objectId}`)}
          >
            <Icon name="ChevronLeft" size={18} />
          </Button>
          
          <div className="flex-1 min-w-0">
            {organizationName && (
              <div className="text-[10px] text-slate-500 truncate leading-tight">{organizationName}</div>
            )}
            <h1 className="text-[14px] font-bold text-slate-900 leading-tight truncate">{selectedWorkData.title}</h1>
          </div>

          {(userRole === 'client' || userRole === 'admin') && onEdit && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onEdit}
              className="h-8 w-8 flex-shrink-0"
            >
              <Icon name="Settings" size={16} />
            </Button>
          )}
        </div>

        {/* Mobile tabs */}
        <div className="flex gap-1 overflow-x-auto pb-0.5 -mx-2.5 px-2.5 scrollbar-hide">
          <button
            onClick={() => setActiveTab('journal')}
            className={`py-1.5 px-3 text-[11px] font-semibold transition-all relative whitespace-nowrap flex flex-col items-center gap-0.5 rounded-lg min-w-[60px] ${
              activeTab === 'journal'
                ? 'text-blue-600 bg-gradient-to-br from-blue-50 to-blue-100'
                : 'text-slate-500'
            }`}
          >
            <Icon name="MessageSquare" size={16} />
            <span className="text-[9px]">Журнал</span>
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={`py-1.5 px-3 text-[11px] font-semibold transition-all relative whitespace-nowrap flex flex-col items-center gap-0.5 rounded-lg min-w-[60px] ${
              activeTab === 'info'
                ? 'text-blue-600 bg-gradient-to-br from-blue-50 to-blue-100'
                : 'text-slate-500'
            }`}
          >
            <Icon name="Info" size={16} />
            <span className="text-[9px]">Инфо</span>
          </button>
          <button
            onClick={() => setActiveTab('description')}
            className={`py-1.5 px-3 text-[11px] font-semibold transition-all relative whitespace-nowrap flex flex-col items-center gap-0.5 rounded-lg min-w-[60px] ${
              activeTab === 'description'
                ? 'text-blue-600 bg-gradient-to-br from-blue-50 to-blue-100'
                : 'text-slate-500'
            }`}
          >
            <Icon name="FileText" size={16} />
            <span className="text-[9px]">Докум.</span>
          </button>
          <button
            onClick={() => setActiveTab('estimate')}
            className={`py-1.5 px-3 text-[11px] font-semibold transition-all relative whitespace-nowrap flex flex-col items-center gap-0.5 rounded-lg min-w-[60px] ${
              activeTab === 'estimate'
                ? 'text-blue-600 bg-gradient-to-br from-blue-50 to-blue-100'
                : 'text-slate-500'
            }`}
          >
            <Icon name="Calculator" size={16} />
            <span className="text-[9px]">Смета</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-1.5 px-3 text-[11px] font-semibold transition-all relative whitespace-nowrap flex flex-col items-center gap-0.5 rounded-lg min-w-[60px] ${
              activeTab === 'analytics'
                ? 'text-blue-600 bg-gradient-to-br from-blue-50 to-blue-100'
                : 'text-slate-500'
            }`}
          >
            <Icon name="BarChart" size={16} />
            <span className="text-[9px]">Данные</span>
          </button>
        </div>
      </div>

      {/* DESKTOP: Original header */}
      <div className="hidden md:block bg-gradient-to-b from-white to-slate-50/50 border-b border-slate-200 px-6 pt-5 pb-0">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4 flex-1 min-w-0 mr-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex-shrink-0 flex items-center justify-center shadow-md">
              <Icon name="Wrench" size={22} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              {organizationName && (
                <p className="text-sm text-slate-500 mb-1 truncate font-medium">
                  {organizationName}
                </p>
              )}
              <h2 className="text-2xl font-bold text-slate-900 leading-tight line-clamp-2">{selectedWorkData.title}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(userRole === 'client' || userRole === 'admin') && onEdit && (
              <Button variant="outline" size="default" onClick={onEdit} className="shadow-sm">
                <Icon name="Settings" size={16} className="mr-2" />
                Настройки
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <Icon name="Star" size={18} />
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <Icon name="MoreVertical" size={18} />
            </Button>
          </div>
        </div>

        <div className="border-b border-slate-100 overflow-x-auto scrollbar-hide">
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
            >
              Документация
              {activeTab === 'description' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-lg" />
              )}
            </button>
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