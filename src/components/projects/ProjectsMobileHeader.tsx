import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProjectsMobileHeaderProps {
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  onNavigateProfile: () => void;
}

export default function ProjectsMobileHeader({
  selectedStatus,
  setSelectedStatus,
  sortBy,
  setSortBy,
  onNavigateProfile,
}: ProjectsMobileHeaderProps) {
  return (
    <div className="md:hidden bg-white border-b border-slate-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900">Проекты</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={onNavigateProfile}>
          <Icon name="User" size={24} />
        </Button>
      </div>
      
      <div className="space-y-2">
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-full h-11">
            <SelectValue placeholder="Все проекты" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все проекты</SelectItem>
            <SelectItem value="active">Активные</SelectItem>
            <SelectItem value="pending">В планировании</SelectItem>
            <SelectItem value="completed">Завершённые</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full h-11">
            <SelectValue placeholder="По дате" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">По дате</SelectItem>
            <SelectItem value="name">По названию</SelectItem>
            <SelectItem value="progress">По прогрессу</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
