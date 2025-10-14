import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDown, X } from 'lucide-react';

interface FeedFiltersProps {
  filter: 'all' | 'work_logs' | 'inspections' | 'info_posts';
  onFilterChange: (filter: 'all' | 'work_logs' | 'inspections' | 'info_posts') => void;
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  availableTags: Array<{ id: string; label: string; type: 'object' | 'work' | 'contractor' }>;
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

  const objectTags = availableTags.filter(t => t.type === 'object');
  const workTags = availableTags.filter(t => t.type === 'work');
  const contractorTags = availableTags.filter(t => t.type === 'contractor');

  const selectedObjectsCount = selectedTags.filter(t => t.startsWith('object-')).length;
  const selectedWorksCount = selectedTags.filter(t => t.startsWith('work-')).length;
  const selectedContractorsCount = selectedTags.filter(t => t.startsWith('contractor-')).length;

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
        <div className="flex flex-wrap gap-2 items-center">
          {objectTags.length > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <Icon name="Building2" size={14} className="mr-1.5" />
                  Объекты
                  {selectedObjectsCount > 0 && (
                    <Badge variant="secondary" className="ml-1.5 px-1.5 py-0 text-[10px] min-w-[18px] h-[18px] flex items-center justify-center">
                      {selectedObjectsCount}
                    </Badge>
                  )}
                  <ChevronDown size={14} className="ml-1" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2" align="start">
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {objectTags.map((tag) => (
                    <label
                      key={tag.id}
                      className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer"
                    >
                      <Checkbox
                        checked={selectedTags.includes(tag.id)}
                        onCheckedChange={() => toggleTag(tag.id)}
                      />
                      <span className="text-sm flex-1 truncate">{tag.label}</span>
                    </label>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}

          {workTags.length > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <Icon name="Wrench" size={14} className="mr-1.5" />
                  Работы
                  {selectedWorksCount > 0 && (
                    <Badge variant="secondary" className="ml-1.5 px-1.5 py-0 text-[10px] min-w-[18px] h-[18px] flex items-center justify-center">
                      {selectedWorksCount}
                    </Badge>
                  )}
                  <ChevronDown size={14} className="ml-1" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2" align="start">
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {workTags.map((tag) => (
                    <label
                      key={tag.id}
                      className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer"
                    >
                      <Checkbox
                        checked={selectedTags.includes(tag.id)}
                        onCheckedChange={() => toggleTag(tag.id)}
                      />
                      <span className="text-sm flex-1 truncate">{tag.label}</span>
                    </label>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}

          {contractorTags.length > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <Icon name="Users" size={14} className="mr-1.5" />
                  Подрядчики
                  {selectedContractorsCount > 0 && (
                    <Badge variant="secondary" className="ml-1.5 px-1.5 py-0 text-[10px] min-w-[18px] h-[18px] flex items-center justify-center">
                      {selectedContractorsCount}
                    </Badge>
                  )}
                  <ChevronDown size={14} className="ml-1" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2" align="start">
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {contractorTags.map((tag) => (
                    <label
                      key={tag.id}
                      className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer"
                    >
                      <Checkbox
                        checked={selectedTags.includes(tag.id)}
                        onCheckedChange={() => toggleTag(tag.id)}
                      />
                      <span className="text-sm flex-1 truncate">{tag.label}</span>
                    </label>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}

          {selectedTags.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllTags}
              className="h-9"
            >
              <X size={14} className="mr-1" />
              Очистить
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default FeedFilters;
