import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface WorkHeaderProps {
  selectedWorkData: any;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  organizationName?: string;
}

export default function WorkHeader({ selectedWorkData, activeTab, setActiveTab, organizationName }: WorkHeaderProps) {
  return (
    <div className="bg-white border-b border-slate-200 px-3 md:px-6 pt-3 md:pt-4 pb-0">
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1 min-w-0 mr-3">
          <h2 className="text-base md:text-xl font-bold truncate">{selectedWorkData.title}</h2>
          {organizationName && (
            <p className="text-xs text-slate-500 mt-0.5">
              {organizationName}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Icon name="Search" size={18} />
          </Button>
          <Button variant="ghost" size="icon">
            <Icon name="Star" size={18} />
          </Button>
          <Button variant="ghost" size="icon">
            <Icon name="Bell" size={18} />
          </Button>
          <Button variant="ghost" size="icon">
            <Icon name="MoreVertical" size={18} />
          </Button>
        </div>
      </div>

      <div className="border-b border-slate-200">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('chat')}
            className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
              activeTab === 'chat'
                ? 'text-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Чат
            {activeTab === 'chat' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
              activeTab === 'info'
                ? 'text-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Информация
            {activeTab === 'info' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('description')}
            className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
              activeTab === 'description'
                ? 'text-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Описание
            {activeTab === 'description' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('subtasks')}
            className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
              activeTab === 'subtasks'
                ? 'text-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Подзадачи
            {activeTab === 'subtasks' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('estimate')}
            className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
              activeTab === 'estimate'
                ? 'text-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Смета
            {activeTab === 'estimate' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}