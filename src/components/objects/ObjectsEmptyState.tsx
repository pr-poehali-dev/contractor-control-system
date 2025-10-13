import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface ObjectsEmptyStateProps {
  onResetFilters: () => void;
}

export default function ObjectsEmptyState({
  onResetFilters,
}: ObjectsEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-96 text-center">
      <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
        <Icon name="Building2" size={48} className="text-slate-300" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">Объекты не найдены</h3>
      <p className="text-slate-600 mb-6">Попробуйте изменить параметры поиска</p>
      <Button onClick={onResetFilters}>
        Сбросить фильтры
      </Button>
    </div>
  );
}
