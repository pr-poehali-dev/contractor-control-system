import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Icon from '@/components/ui/icon';

interface StatusOption {
  value: string;
  label: string;
}

interface ObjectsDesktopHeaderProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  selectedStatus: string;
  setSelectedStatus: (value: string) => void;
  statusOptions: StatusOption[];
  viewMode: 'grid' | 'table';
  setViewMode: (mode: 'grid' | 'table') => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  onCreateClick: () => void;
  isContractor: boolean;
}

export default function ObjectsDesktopHeader({
  searchQuery,
  setSearchQuery,
  selectedStatus,
  setSelectedStatus,
  statusOptions,
  viewMode,
  setViewMode,
  sortBy,
  setSortBy,
  onCreateClick,
  isContractor,
}: ObjectsDesktopHeaderProps) {
  return (
    <div className="bg-white border-b border-slate-200 p-6">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Мои объекты</h1>
          {!isContractor && (
            <Button size="lg" onClick={onCreateClick} data-tour="create-object-btn">
              <Icon name="Plus" size={20} className="mr-2" />
              Добавить объект
            </Button>
          )}
        </div>
        
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Icon name="Search" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Поиск по названию, адресу, описанию..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>
          
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-full md:w-[200px] h-12">
              <SelectValue placeholder="Все статусы" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions && Array.isArray(statusOptions) && statusOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-[180px] h-12">
              <SelectValue placeholder="Сортировка" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">По дате</SelectItem>
              <SelectItem value="name">По названию</SelectItem>
              <SelectItem value="progress">По прогрессу</SelectItem>
              <SelectItem value="works">По работам</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              className="h-12 w-12"
              onClick={() => setViewMode('grid')}
            >
              <Icon name="LayoutGrid" size={20} />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="icon"
              className="h-12 w-12"
              onClick={() => setViewMode('table')}
            >
              <Icon name="List" size={20} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}