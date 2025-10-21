import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { WorkForm, UNITS } from './types';

interface WorkFormCardProps {
  work: WorkForm;
  index: number;
  categories: string[];
  workTemplates: any[];
  contractors: any[];
  onUpdate: (id: string, field: keyof WorkForm, value: string | boolean) => void;
  onDuplicate: (id: string) => void;
  onRemove: (id: string) => void;
}

export const WorkFormCard = ({
  work,
  index,
  categories,
  workTemplates,
  contractors,
  onUpdate,
  onDuplicate,
  onRemove,
}: WorkFormCardProps) => {
  const [isCollapsed, setIsCollapsed] = useState(work.isCollapsed ?? false);
  
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const getContractorName = () => {
    if (!work.contractor_id) return 'Не назначен';
    const contractor = contractors.find((c: any) => String(c.id) === work.contractor_id);
    return contractor?.name || 'Не назначен';
  };

  const formatDate = (date: string) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  console.log(`🎯 WorkFormCard render - Work ${index + 1}, category:`, work.category, 'title:', work.title);
  
  return (
    <Card className={cn("relative", work.isExisting && "bg-slate-50")}>
      <div className={cn(
        "absolute left-0 top-0 bottom-0 w-1 rounded-l-lg",
        work.isExisting ? "bg-slate-400" : "bg-blue-500"
      )} />
      
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={toggleCollapse}
            className="flex items-center gap-3 flex-1 text-left hover:opacity-70 transition-opacity"
          >
            <Icon 
              name={isCollapsed ? "ChevronRight" : "ChevronDown"} 
              size={20} 
              className="text-slate-500 flex-shrink-0"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-semibold">{work.title || `Работа ${index + 1}`}</h3>
                {work.isExisting && (
                  <Badge variant="outline" className="text-xs bg-slate-100">
                    Добавленная
                  </Badge>
                )}
                {work.category && (
                  <Badge variant="secondary" className="text-xs">
                    {work.category}
                  </Badge>
                )}
              </div>
              {isCollapsed && (
                <p className="text-sm text-slate-500 mt-1">
                  Подрядчик: {getContractorName()} • 
                  {work.planned_start_date && ` ${formatDate(work.planned_start_date)}`}
                  {work.planned_end_date && ` — ${formatDate(work.planned_end_date)}`}
                  {!work.planned_start_date && !work.planned_end_date && ' Даты не указаны'}
                </p>
              )}
            </div>
          </button>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onDuplicate(work.id)}
              title="Дублировать"
            >
              <Icon name="Copy" size={16} />
            </Button>
            {!work.isExisting && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => onRemove(work.id)}
                title="Удалить"
              >
                <Icon name="Trash2" size={16} />
              </Button>
            )}
          </div>
        </div>

        {!isCollapsed && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-8">
            <div>
              <Label htmlFor={`category-${work.id}`} className="text-sm">
                Категория работ <span className="text-red-500">*</span>
              </Label>
              <Select
                key={`category-${work.id}-${work.category}`}
                value={work.category || undefined}
                onValueChange={(value) => {
                  if (!work.isExisting && work.category && work.category !== value) {
                    onUpdate(work.id, 'title', '');
                  }
                  onUpdate(work.id, 'category', value);
                }}
                disabled={work.isExisting}
              >
                <SelectTrigger id={`category-${work.id}`} className="h-9">
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div key={`title-container-${work.id}-${work.category}`}>
              <Label htmlFor={`title-${work.id}`} className="text-sm">
                Вид работ <span className="text-red-500">*</span>
              </Label>
              {work.category ? (
                <Select
                  key={`title-${work.id}-${work.title}`}
                  value={work.title || undefined}
                  onValueChange={(value) => onUpdate(work.id, 'title', value)}
                  disabled={work.isExisting}
                >
                  <SelectTrigger id={`title-${work.id}`} className={cn(!work.title && 'border-red-300', "h-9")}>
                    <SelectValue placeholder="Выберите вид работ" />
                  </SelectTrigger>
                  <SelectContent>
                    {workTemplates
                      .filter((t: any) => t.category === work.category)
                      .map((template: any) => (
                        <SelectItem key={template.id} value={template.title}>
                          {template.title}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="h-9 flex items-center px-3 text-sm text-slate-400 border border-slate-200 rounded-md bg-slate-50">
                  Сначала выберите категорию
                </div>
              )}
            </div>

            <div>
              <Label htmlFor={`volume-${work.id}`} className="text-sm">Объём работ</Label>
              <Input
                id={`volume-${work.id}`}
                type="number"
                placeholder="0"
                value={work.volume}
                onChange={(e) => onUpdate(work.id, 'volume', e.target.value)}
                className="h-9"
              />
            </div>

            <div>
              <Label htmlFor={`unit-${work.id}`} className="text-sm">Единица измерения</Label>
              <Select
                value={work.unit}
                onValueChange={(value) => onUpdate(work.id, 'unit', value)}
              >
                <SelectTrigger id={`unit-${work.id}`} className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNITS.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor={`start-${work.id}`} className="text-sm">Плановое начало</Label>
              <Input
                id={`start-${work.id}`}
                type="date"
                value={work.planned_start_date}
                onChange={(e) => onUpdate(work.id, 'planned_start_date', e.target.value)}
                className="h-9"
              />
            </div>

            <div>
              <Label htmlFor={`end-${work.id}`} className="text-sm">Плановое окончание</Label>
              <Input
                id={`end-${work.id}`}
                type="date"
                value={work.planned_end_date}
                onChange={(e) => onUpdate(work.id, 'planned_end_date', e.target.value)}
                className="h-9"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor={`contractor-${work.id}`} className="text-sm">Подрядчик</Label>
              <Select
                value={work.contractor_id || 'none'}
                onValueChange={(value) => onUpdate(work.id, 'contractor_id', value === 'none' ? '' : value)}
              >
                <SelectTrigger id={`contractor-${work.id}`} className="h-9">
                  <SelectValue placeholder="Не выбран" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Не выбран</SelectItem>
                  {contractors.map((contractor: any) => (
                    <SelectItem key={contractor.id} value={String(contractor.id)}>
                      {contractor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
