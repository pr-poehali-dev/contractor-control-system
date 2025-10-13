import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface FeedFiltersProps {
  filter: 'all' | 'work_logs' | 'inspections' | 'info_posts';
  onFilterChange: (filter: 'all' | 'work_logs' | 'inspections' | 'info_posts') => void;
}

const FeedFilters = ({ filter, onFilterChange }: FeedFiltersProps) => {
  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onFilterChange('all')}
            className="flex-shrink-0"
          >
            <Icon name="Sparkles" size={16} className="mr-2" />
            Все события
          </Button>
          <Button
            variant={filter === 'work_logs' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onFilterChange('work_logs')}
            className="flex-shrink-0"
          >
            <Icon name="FileText" size={16} className="mr-2" />
            Журнал работ
          </Button>
          <Button
            variant={filter === 'inspections' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onFilterChange('inspections')}
            className="flex-shrink-0"
          >
            <Icon name="ClipboardCheck" size={16} className="mr-2" />
            Проверки
          </Button>
          <Button
            variant={filter === 'info_posts' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onFilterChange('info_posts')}
            className="flex-shrink-0"
          >
            <Icon name="Bell" size={16} className="mr-2" />
            Инфо-посты
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeedFilters;
