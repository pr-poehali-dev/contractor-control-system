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
  const { projectId, objectId } = useParams();

  return (
    <>
      {/* MOBILE: Compact header with back button */}
      <div className="md:hidden bg-white border-b border-slate-200 px-3 py-2.5">
        <div className="flex items-center gap-2 mb-2">
          <Button 
            variant="ghost" 
            size="icon"
            className="flex-shrink-0"
            onClick={() => navigate(`/projects/${projectId}/objects/${objectId}`)}
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
        <div className="flex gap-1 overflow-x-auto pb-1 -mx-3 px-3 scrollbar-hide">
          <button
            onClick={() => setActiveTab('journal')}
            className={`py-1.5 px-2.5 text-[11px] font-medium transition-colors relative whitespace-nowrap flex items-center gap-1 rounded-lg ${
              activeTab === 'journal'
                ? 'text-blue-600 bg-blue-50'
                : 'text-slate-600'
            }`}
          >
            <Icon name="MessageSquare" size={12} />
            Журнал
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={`py-1.5 px-2.5 text-[11px] font-medium transition-colors relative whitespace-nowrap flex items-center gap-1 rounded-lg ${
              activeTab === 'info'
                ? 'text-blue-600 bg-blue-50'
                : 'text-slate-600'
            }`}
          >
            <Icon name="Info" size={12} />
            Инфо
          </button>
          <button
            onClick={() => setActiveTab('description')}
            className={`py-1.5 px-2.5 text-[11px] font-medium transition-colors relative whitespace-nowrap flex items-center gap-1 rounded-lg ${
              activeTab === 'description'
                ? 'text-blue-600 bg-blue-50'
                : 'text-slate-600'
            }`}
          >
            <Icon name="FileText" size={12} />
            Документы
          </button>
          <button
            onClick={() => setActiveTab('estimate')}
            className={`py-1.5 px-2.5 text-[11px] font-medium transition-colors relative whitespace-nowrap flex items-center gap-1 rounded-lg ${
              activeTab === 'estimate'
                ? 'text-blue-600 bg-blue-50'
                : 'text-slate-600'
            }`}
          >
            <Icon name="Calculator" size={12} />
            Смета
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-1.5 px-2.5 text-[11px] font-medium transition-colors relative whitespace-nowrap flex items-center gap-1 rounded-lg ${
              activeTab === 'analytics'
                ? 'text-blue-600 bg-blue-50'
                : 'text-slate-600'
            }`}
          >
            <Icon name="BarChart" size={12} />
            Аналитика
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

        <div className="border-b border-slate-200 overflow-x-auto">
          <div className="flex gap-3 md:gap-6 min-w-max">
            <button
              onClick={() => setActiveTab('journal')}
              className={`pb-2 md:pb-3 px-1 text-xs md:text-sm font-medium transition-colors relative whitespace-nowrap ${
                activeTab === 'journal'
                  ? 'text-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="hidden md:inline">Журнал</span>
              <span className="md:hidden flex items-center gap-1">
                <Icon name="MessageSquare" size={14} />
                Журнал
              </span>
              {activeTab === 'journal' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('info')}
              className={`pb-2 md:pb-3 px-1 text-xs md:text-sm font-medium transition-colors relative whitespace-nowrap ${
                activeTab === 'info'
                  ? 'text-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="hidden md:inline">Информация</span>
              <span className="md:hidden flex items-center gap-1">
                <Icon name="Info" size={14} />
                Инфо
              </span>
              {activeTab === 'info' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('description')}
              className={`pb-2 md:pb-3 px-1 text-xs md:text-sm font-medium transition-colors relative whitespace-nowrap ${
                activeTab === 'description'
                  ? 'text-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="hidden md:inline">Нормативная документация</span>
              <span className="md:hidden flex items-center gap-1">
                <Icon name="FileText" size={14} />
                Документы
              </span>
              {activeTab === 'description' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('estimate')}
              className={`pb-2 md:pb-3 px-1 text-xs md:text-sm font-medium transition-colors relative whitespace-nowrap ${
                activeTab === 'estimate'
                  ? 'text-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="hidden md:inline">Смета</span>
              <span className="md:hidden flex items-center gap-1">
                <Icon name="Calculator" size={14} />
                Смета
              </span>
              {activeTab === 'estimate' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`pb-2 md:pb-3 px-1 text-xs md:text-sm font-medium transition-colors relative whitespace-nowrap ${
                activeTab === 'analytics'
                  ? 'text-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="hidden md:inline">Аналитика</span>
              <span className="md:hidden flex items-center gap-1">
                <Icon name="BarChart" size={14} />
                Данные
              </span>
              {activeTab === 'analytics' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}