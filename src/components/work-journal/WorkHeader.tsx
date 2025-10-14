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
      <div className="md:hidden bg-white border-b border-slate-200 px-3 py-2.5 overflow-x-hidden">
        <div className="flex items-center gap-2 mb-2">
          <Button 
            variant="ghost" 
            size="icon"
            className="flex-shrink-0"
            onClick={() => navigate(`/objects/${objectId}`)}
          >
            <Icon name="ChevronLeft" size={20} />
          </Button>
          
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex-shrink-0 flex items-center justify-center">
              <Icon name="Wrench" size={16} className="text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] text-slate-500">Секция А, корпус 2</div>
              <h1 className="text-sm font-bold text-slate-900 leading-tight line-clamp-2">{selectedWorkData.title}</h1>
            </div>
          </div>

          <Button 
            variant="ghost" 
            size="icon"
            onClick={onEdit}
            className="h-8 w-8"
          >
            <Icon name="Settings" size={16} />
          </Button>
        </div>

        {/* Mobile tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-3 px-3 scrollbar-hide">
          <button
            onClick={() => setActiveTab('journal')}
            className={`py-2 px-3.5 text-[12px] font-semibold transition-all relative whitespace-nowrap flex flex-col items-center gap-1 rounded-xl min-w-[70px] ${
              activeTab === 'journal'
                ? 'text-blue-600 bg-gradient-to-br from-blue-50 to-blue-100 shadow-sm'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Icon name="MessageSquare" size={18} />
            <span className="text-[10px]">Журнал</span>
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={`py-2 px-3.5 text-[12px] font-semibold transition-all relative whitespace-nowrap flex flex-col items-center gap-1 rounded-xl min-w-[70px] ${
              activeTab === 'info'
                ? 'text-blue-600 bg-gradient-to-br from-blue-50 to-blue-100 shadow-sm'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Icon name="Info" size={18} />
            <span className="text-[10px]">Инфо</span>
          </button>
          <button
            onClick={() => setActiveTab('description')}
            className={`py-2 px-3.5 text-[12px] font-semibold transition-all relative whitespace-nowrap flex flex-col items-center gap-1 rounded-xl min-w-[70px] ${
              activeTab === 'description'
                ? 'text-blue-600 bg-gradient-to-br from-blue-50 to-blue-100 shadow-sm'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Icon name="FileText" size={18} />
            <span className="text-[10px]">Докум.</span>
          </button>
          <button
            onClick={() => setActiveTab('estimate')}
            className={`py-2 px-3.5 text-[12px] font-semibold transition-all relative whitespace-nowrap flex flex-col items-center gap-1 rounded-xl min-w-[70px] ${
              activeTab === 'estimate'
                ? 'text-blue-600 bg-gradient-to-br from-blue-50 to-blue-100 shadow-sm'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Icon name="Calculator" size={18} />
            <span className="text-[10px]">Смета</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-2 px-3.5 text-[12px] font-semibold transition-all relative whitespace-nowrap flex flex-col items-center gap-1 rounded-xl min-w-[70px] ${
              activeTab === 'analytics'
                ? 'text-blue-600 bg-gradient-to-br from-blue-50 to-blue-100 shadow-sm'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Icon name="BarChart" size={18} />
            <span className="text-[10px]">Данные</span>
          </button>
        </div>
      </div>

      {/* DESKTOP: Original header */}
      <div className="hidden md:block bg-white border-b border-slate-200 px-2 md:px-6 pt-2 md:pt-4 pb-0">
        <div className="flex items-center justify-between mb-2 md:mb-3">
          <div className="flex-1 min-w-0 mr-2">
            <h2 className="text-sm md:text-xl font-bold truncate leading-tight">{selectedWorkData.title}</h2>
            {organizationName && (
              <p className="text-xs text-slate-500 mt-0.5 truncate">
                {organizationName}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1">
            {(userRole === 'client' || userRole === 'admin') && onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit} className="hidden md:flex">
                <Icon name="Edit" size={16} className="mr-1" />
                Редактировать
              </Button>
            )}
            {(userRole === 'client' || userRole === 'admin') && onEdit && (
              <Button variant="ghost" size="icon" onClick={onEdit} className="md:hidden h-8 w-8">
                <Icon name="Edit" size={16} />
              </Button>
            )}
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Icon name="Search" size={18} />
            </Button>
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Icon name="Star" size={18} />
            </Button>
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Icon name="Bell" size={18} />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Icon name="MoreVertical" size={16} />
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