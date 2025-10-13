import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface FeedFiltersProps {
  filter: 'all' | 'work_logs' | 'inspections' | 'info_posts';
  onFilterChange: (filter: 'all' | 'work_logs' | 'inspections' | 'info_posts') => void;
}

const FeedFilters = ({ filter, onFilterChange }: FeedFiltersProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm mb-4 overflow-x-auto">
      <div className="flex border-b border-slate-200">
        <Button
          variant="ghost"
          className={`flex-1 min-w-[100px] rounded-none border-b-2 transition-colors ${
            filter === 'all'
              ? 'border-blue-500 text-blue-600 hover:text-blue-600 hover:bg-blue-50'
              : 'border-transparent text-slate-600 hover:bg-slate-50'
          }`}
          onClick={() => onFilterChange('all')}
        >
          <Icon name="Sparkles" size={18} className="mr-2" />
          <span className="font-medium">Все</span>
        </Button>
        <Button
          variant="ghost"
          className={`flex-1 min-w-[140px] rounded-none border-b-2 transition-colors ${
            filter === 'work_logs'
              ? 'border-blue-500 text-blue-600 hover:text-blue-600 hover:bg-blue-50'
              : 'border-transparent text-slate-600 hover:bg-slate-50'
          }`}
          onClick={() => onFilterChange('work_logs')}
        >
          <Icon name="FileText" size={18} className="mr-2" />
          <span className="font-medium">Журнал</span>
        </Button>
        <Button
          variant="ghost"
          className={`flex-1 min-w-[120px] rounded-none border-b-2 transition-colors ${
            filter === 'inspections'
              ? 'border-blue-500 text-blue-600 hover:text-blue-600 hover:bg-blue-50'
              : 'border-transparent text-slate-600 hover:bg-slate-50'
          }`}
          onClick={() => onFilterChange('inspections')}
        >
          <Icon name="ClipboardCheck" size={18} className="mr-2" />
          <span className="font-medium">Проверки</span>
        </Button>
        <Button
          variant="ghost"
          className={`flex-1 min-w-[120px] rounded-none border-b-2 transition-colors ${
            filter === 'info_posts'
              ? 'border-blue-500 text-blue-600 hover:text-blue-600 hover:bg-blue-50'
              : 'border-transparent text-slate-600 hover:bg-slate-50'
          }`}
          onClick={() => onFilterChange('info_posts')}
        >
          <Icon name="Bell" size={18} className="mr-2" />
          <span className="font-medium">Инфо</span>
        </Button>
      </div>
    </div>
  );
};

export default FeedFilters;
