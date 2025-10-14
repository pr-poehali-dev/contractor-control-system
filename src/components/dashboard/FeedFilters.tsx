import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { X } from 'lucide-react';

interface FeedFiltersProps {
  filter: 'all' | 'work_logs' | 'inspections' | 'info_posts';
  onFilterChange: (filter: 'all' | 'work_logs' | 'inspections' | 'info_posts') => void;
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  availableTags: Array<{ id: string; label: string; type: 'object' | 'work' }>;
}

const filterOptions = [
  { value: 'all', label: 'Все', icon: 'Sparkles' },
  { value: 'work_logs', label: 'Журнал', icon: 'FileText' },
  { value: 'inspections', label: 'Проверки', icon: 'ClipboardCheck' },
  { value: 'info_posts', label: 'Инфо', icon: 'Bell' },
];

const FeedFilters = ({ filter, onFilterChange, selectedTags, onTagsChange, availableTags }: FeedFiltersProps) => {
  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onTagsChange(selectedTags.filter(t => t !== tagId));
    } else {
      onTagsChange([...selectedTags, tagId]);
    }
  };

  const clearAllTags = () => {
    onTagsChange([]);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {filterOptions.map((option) => (
          <Button
            key={option.value}
            variant={filter === option.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => onFilterChange(option.value as any)}
            className="h-9"
          >
            <Icon name={option.icon as any} size={16} className="mr-1.5" />
            {option.label}
          </Button>
        ))}
      </div>

      {availableTags.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-600">Фильтр по тегам:</p>
            {selectedTags.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllTags}
                className="h-6 px-2 text-xs"
              >
                <X size={12} className="mr-1" />
                Очистить
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <Badge
                key={tag.id}
                variant={selectedTags.includes(tag.id) ? 'default' : 'outline'}
                className="cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => toggleTag(tag.id)}
              >
                <Icon 
                  name={tag.type === 'object' ? 'Building2' : 'Wrench'} 
                  size={12} 
                  className="mr-1" 
                />
                {tag.label}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedFilters;
