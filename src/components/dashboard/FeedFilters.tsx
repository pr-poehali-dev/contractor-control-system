import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';

interface FeedFiltersProps {
  filter: 'all' | 'work_logs' | 'inspections' | 'info_posts';
  onFilterChange: (filter: 'all' | 'work_logs' | 'inspections' | 'info_posts') => void;
}

const filterOptions = [
  { value: 'all', label: 'Все', icon: 'Sparkles' },
  { value: 'work_logs', label: 'Журнал', icon: 'FileText' },
  { value: 'inspections', label: 'Проверки', icon: 'ClipboardCheck' },
  { value: 'info_posts', label: 'Инфо', icon: 'Bell' },
];

const FeedFilters = ({ filter, onFilterChange }: FeedFiltersProps) => {
  const currentFilter = filterOptions.find(f => f.value === filter);

  return (
    <div className="mb-4">
      <Select value={filter} onValueChange={(val) => onFilterChange(val as any)}>
        <SelectTrigger className="w-full sm:w-[200px] bg-white">
          <SelectValue>
            <div className="flex items-center gap-2">
              <Icon name={currentFilter?.icon as any} size={16} />
              <span className="font-medium">{currentFilter?.label}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {filterOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center gap-2">
                <Icon name={option.icon as any} size={16} />
                <span>{option.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default FeedFilters;
