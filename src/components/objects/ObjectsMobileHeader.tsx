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

interface ObjectsMobileHeaderProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  selectedStatus: string;
  setSelectedStatus: (value: string) => void;
  statusOptions: StatusOption[];
  onCreateClick: () => void;
  isContractor: boolean;
}

export default function ObjectsMobileHeader({
  searchQuery,
  setSearchQuery,
  selectedStatus,
  setSelectedStatus,
  statusOptions,
  onCreateClick,
  isContractor,
}: ObjectsMobileHeaderProps) {
  return (
    <div className="md:hidden bg-white border-b border-slate-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-slate-900">Объекты</h1>
        {!isContractor && (
          <Button 
            size="icon" 
            onClick={onCreateClick}
            className="rounded-full h-12 w-12"
          >
            <Icon name="Plus" size={20} />
          </Button>
        )}
      </div>
      
      <div className="space-y-3">
        <div className="relative">
          <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="Поиск по названию, адресу..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11"
          />
        </div>
        
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-full h-11">
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
      </div>
    </div>
  );
}