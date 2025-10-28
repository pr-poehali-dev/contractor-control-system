import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TemplatesHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  typeFilter: string;
  onTypeFilterChange: (filter: string) => void;
  onCreateClick: () => void;
}

export function TemplatesHeader({
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  onCreateClick,
}: TemplatesHeaderProps) {
  return (
    <div className="mb-6 md:mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Шаблоны документов</h1>
          <p className="text-slate-600 mt-1">Создавайте и управляйте шаблонами документов</p>
        </div>
        <Button onClick={onCreateClick}>
          <Icon name="Plus" size={18} className="mr-2" />
          Создать шаблон
        </Button>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="flex-1 relative">
          <Icon name="Search" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Поиск шаблонов..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={onTypeFilterChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Все типы" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все типы</SelectItem>
            <SelectItem value="act">Акт работ</SelectItem>
            <SelectItem value="inspection">Акт проверки</SelectItem>
            <SelectItem value="defect_detection">Обнаружение дефектов</SelectItem>
            <SelectItem value="defect_resolution">Устранение дефектов</SelectItem>
            <SelectItem value="work_acceptance">Приёмка работ</SelectItem>
            <SelectItem value="protocol">Протокол</SelectItem>
            <SelectItem value="contract">Договор</SelectItem>
            <SelectItem value="custom">Прочее</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}