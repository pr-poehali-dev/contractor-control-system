import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface InfoTabProps {
  selectedWorkData: any;
  workEntries: any[];
  formatDate: (timestamp: string) => string;
  formatTime: (timestamp: string) => string;
  handleCreateInspection: () => void;
}

export default function InfoTab({
  selectedWorkData,
  workEntries,
  formatDate,
  formatTime,
  handleCreateInspection,
}: InfoTabProps) {
  return (
    <div className="flex-1 overflow-y-auto p-3 md:p-6">
      <div className="max-w-3xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Информация и история</h3>
          <Button size="sm" onClick={handleCreateInspection}>
            <Icon name="Plus" size={16} className="mr-1" />
            Создать проверку
          </Button>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold mb-3">Детали работы</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Статус:</span>
                  <Badge>
                    {selectedWorkData.status === 'active' ? '🟢 В работе' : selectedWorkData.status === 'completed' ? '✅ Готово' : '🟡 Ожидание'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Подрядчик:</span>
                  <span className="font-medium">{selectedWorkData.contractor_name || 'Не назначен'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Создано:</span>
                  <span className="font-medium">{formatDate(selectedWorkData.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Записей в журнале:</span>
                  <span className="font-medium">{workEntries.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold mb-3">История изменений</h4>
              <div className="space-y-3">
                <div className="flex gap-3 pb-3 border-b border-slate-100 last:border-b-0">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Работа создана</p>
                    <p className="text-xs text-slate-500">{formatDate(selectedWorkData.created_at)} в {formatTime(selectedWorkData.created_at)}</p>
                  </div>
                </div>
                {workEntries.slice(0, 5).map((entry) => (
                  <div key={entry.id} className="flex gap-3 pb-3 border-b border-slate-100 last:border-b-0">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{entry.author_name} добавил запись</p>
                      <p className="text-xs text-slate-600 mt-1">{entry.description.slice(0, 80)}...</p>
                      <p className="text-xs text-slate-500 mt-1">{formatDate(entry.created_at)} в {formatTime(entry.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
