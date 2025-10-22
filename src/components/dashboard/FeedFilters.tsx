import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDown, X, Search } from 'lucide-react';

interface FeedFiltersProps {
  filter: 'all' | 'work_logs' | 'inspections' | 'info_posts';
  onFilterChange: (filter: 'all' | 'work_logs' | 'inspections' | 'info_posts') => void;
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  availableTags: Array<{ id: string; label: string; type: 'object' | 'work' | 'contractor'; workIds?: number[] }>;
  feed: any[];
  works: any[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const filterOptions = [
  { value: 'all', label: 'Все', icon: 'Sparkles' },
  { value: 'work_logs', label: 'Журнал', icon: 'FileText' },
  { value: 'inspections', label: 'Проверки', icon: 'ClipboardCheck' },
  { value: 'info_posts', label: 'Инфо', icon: 'Bell' },
];

const FeedFilters = ({ filter, onFilterChange, selectedTags, onTagsChange, availableTags, feed, works, searchQuery, onSearchChange }: FeedFiltersProps) => {
  const [objectSearch, setObjectSearch] = useState('');
  const [workSearch, setWorkSearch] = useState('');
  const [contractorSearch, setContractorSearch] = useState('');

  const toggleTag = (tagId: string, isDisabled: boolean) => {
    if (isDisabled) return;
    
    if (selectedTags.includes(tagId)) {
      onTagsChange(selectedTags.filter(t => t !== tagId));
    } else {
      onTagsChange([...selectedTags, tagId]);
    }
  };

  const clearAllTags = () => {
    onTagsChange([]);
  };

  // Функция проверки доступности тега
  const isTagAvailable = (tagId: string, tagType: 'object' | 'work' | 'contractor'): boolean => {
    // Если ничего не выбрано, все доступны
    if (selectedTags.length === 0) return true;

    // Получаем выбранные теги по типам
    const selectedObjects = selectedTags.filter(t => t.startsWith('object-'));
    const selectedWorks = selectedTags.filter(t => t.startsWith('work-'));
    const selectedContractors = selectedTags.filter(t => t.startsWith('contractor-'));

    // Проверяем, есть ли в feed события, которые совместимы с этим тегом
    const hasCompatibleEvents = feed.some(event => {
      const eventObjectId = `object-${event.objectId}`;
      const eventContractor = `contractor-${event.author}`;
      
      // Для работы находим тег с workIds
      const eventWorkTag = availableTags.find(t => 
        t.type === 'work' && t.workIds?.includes(event.workId)
      );
      const eventWorkId = eventWorkTag?.id;

      // Проверяем совместимость с текущими выборами
      const objectMatch = selectedObjects.length === 0 || selectedObjects.includes(eventObjectId);
      const workMatch = selectedWorks.length === 0 || (eventWorkId && selectedWorks.includes(eventWorkId));
      const contractorMatch = selectedContractors.length === 0 || selectedContractors.includes(eventContractor);

      // Проверяем, подходит ли событие к новому тегу
      if (tagType === 'object') {
        return tagId === eventObjectId && workMatch && contractorMatch;
      } else if (tagType === 'work') {
        return tagId === eventWorkId && objectMatch && contractorMatch;
      } else if (tagType === 'contractor') {
        return tagId === eventContractor && objectMatch && workMatch;
      }
      return false;
    });

    return hasCompatibleEvents;
  };

  const allObjectTags = availableTags.filter(t => t.type === 'object');
  const objectTags = allObjectTags
    .filter(t => t.label.toLowerCase().includes(objectSearch.toLowerCase()))
    .map(tag => ({
      ...tag,
      disabled: !isTagAvailable(tag.id, 'object')
    }));
  
  const allWorkTags = availableTags.filter(t => t.type === 'work');
  const workTags = allWorkTags
    .filter(t => t.label.toLowerCase().includes(workSearch.toLowerCase()))
    .map(tag => ({
      ...tag,
      disabled: !isTagAvailable(tag.id, 'work')
    }));
  
  const allContractorTags = availableTags.filter(t => t.type === 'contractor');
  const contractorTags = allContractorTags
    .filter(t => t.label.toLowerCase().includes(contractorSearch.toLowerCase()))
    .map(tag => ({
      ...tag,
      disabled: !isTagAvailable(tag.id, 'contractor')
    }));

  const selectedObjectsCount = selectedTags.filter(t => t.startsWith('object-')).length;
  const selectedWorksCount = selectedTags.filter(t => t.startsWith('work-')).length;
  const selectedContractorsCount = selectedTags.filter(t => t.startsWith('contractor-')).length;

  const currentFilter = filterOptions.find(f => f.value === filter);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input
          type="text"
          placeholder="Поиск по событиям..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-10"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
            onClick={() => onSearchChange('')}
          >
            <X size={16} />
          </Button>
        )}
      </div>
      
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
           style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 flex-shrink-0">
              <Icon name={currentFilter?.icon as any} size={14} className="mr-1.5" />
              {currentFilter?.label}
              <ChevronDown size={14} className="ml-1.5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-1" align="start">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onFilterChange(option.value as any)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-slate-100 transition-colors ${
                  filter === option.value ? 'bg-slate-100 font-medium' : ''
                }`}
              >
                <Icon name={option.icon as any} size={14} />
                {option.label}
                {filter === option.value && <Icon name="Check" size={14} className="ml-auto" />}
              </button>
            ))}
          </PopoverContent>
        </Popover>

        {availableTags.length > 0 && (
          <>
          {allObjectTags.length > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 flex-shrink-0">
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
                <div className="mb-2">
                  <div className="relative">
                    <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
                    <Input
                      placeholder="Поиск..."
                      value={objectSearch}
                      onChange={(e) => setObjectSearch(e.target.value)}
                      className="pl-8 h-9 text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {objectTags.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-4">Не найдено</p>
                  ) : (
                    objectTags.map((tag) => (
                    <label
                      key={tag.id}
                      className={`flex items-start gap-2 p-2 rounded transition-colors ${
                        tag.disabled 
                          ? 'opacity-40 cursor-not-allowed' 
                          : 'hover:bg-slate-50 cursor-pointer'
                      }`}
                    >
                      <Checkbox
                        checked={selectedTags.includes(tag.id)}
                        onCheckedChange={() => toggleTag(tag.id, tag.disabled)}
                        disabled={tag.disabled}
                        className="mt-0.5 flex-shrink-0"
                      />
                      <span className="text-sm flex-1 break-words leading-snug">{tag.label}</span>
                    </label>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>
            )}

            {allWorkTags.length > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 flex-shrink-0">
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
                <div className="mb-2">
                  <div className="relative">
                    <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
                    <Input
                      placeholder="Поиск..."
                      value={workSearch}
                      onChange={(e) => setWorkSearch(e.target.value)}
                      className="pl-8 h-9 text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {workTags.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-4">Не найдено</p>
                  ) : (
                    workTags.map((tag) => (
                    <label
                      key={tag.id}
                      className={`flex items-start gap-2 p-2 rounded transition-colors ${
                        tag.disabled 
                          ? 'opacity-40 cursor-not-allowed' 
                          : 'hover:bg-slate-50 cursor-pointer'
                      }`}
                    >
                      <Checkbox
                        checked={selectedTags.includes(tag.id)}
                        onCheckedChange={() => toggleTag(tag.id, tag.disabled)}
                        disabled={tag.disabled}
                        className="mt-0.5 flex-shrink-0"
                      />
                      <span className="text-sm flex-1 break-words leading-snug">{tag.label}</span>
                    </label>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>
            )}

            {allContractorTags.length > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 flex-shrink-0">
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
                <div className="mb-2">
                  <div className="relative">
                    <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
                    <Input
                      placeholder="Поиск..."
                      value={contractorSearch}
                      onChange={(e) => setContractorSearch(e.target.value)}
                      className="pl-8 h-9 text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {contractorTags.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-4">Не найдено</p>
                  ) : (
                    contractorTags.map((tag) => (
                    <label
                      key={tag.id}
                      className={`flex items-start gap-2 p-2 rounded transition-colors ${
                        tag.disabled 
                          ? 'opacity-40 cursor-not-allowed' 
                          : 'hover:bg-slate-50 cursor-pointer'
                      }`}
                    >
                      <Checkbox
                        checked={selectedTags.includes(tag.id)}
                        onCheckedChange={() => toggleTag(tag.id, tag.disabled)}
                        disabled={tag.disabled}
                        className="mt-0.5 flex-shrink-0"
                      />
                      <span className="text-sm flex-1 break-words leading-snug">{tag.label}</span>
                    </label>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>
            )}

            {selectedTags.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllTags}
              className="h-9 flex-shrink-0"
            >
              <X size={14} className="mr-1" />
              Очистить
            </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FeedFilters;