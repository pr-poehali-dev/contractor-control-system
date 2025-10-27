import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface EmptyTemplatesStateProps {
  hasFilters: boolean;
  onCreateClick: () => void;
}

export function EmptyTemplatesState({ hasFilters, onCreateClick }: EmptyTemplatesStateProps) {
  return (
    <Card>
      <CardContent className="p-12 text-center">
        <Icon name="FileText" size={64} className="mx-auto mb-4 text-slate-300" />
        <h3 className="text-xl font-semibold mb-2">
          {hasFilters ? 'Шаблоны не найдены' : 'Нет шаблонов документов'}
        </h3>
        <p className="text-slate-500 mb-6">
          {hasFilters
            ? 'Попробуйте изменить параметры поиска'
            : 'Создайте первый шаблон для начала работы'}
        </p>
        {!hasFilters && (
          <Button onClick={onCreateClick}>
            <Icon name="Plus" size={18} className="mr-2" />
            Создать шаблон
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
