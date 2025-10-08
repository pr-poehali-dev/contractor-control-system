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
    <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-10 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl md:text-2xl font-bold">Информация и история</h3>
          <Button onClick={handleCreateInspection}>
            <Icon name="Plus" size={18} className="mr-2" />
            Создать проверку
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <Card>
            <CardContent className="p-5 lg:p-7">
              <h4 className="text-lg font-semibold mb-4">Детали работы</h4>
              <div className="space-y-3 text-base">
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

          <Card className="lg:row-span-2">
            <CardContent className="p-5 lg:p-7">
              <h4 className="text-lg font-semibold mb-4">История изменений</h4>
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                <div className="flex gap-4 pb-4 border-b border-slate-100 last:border-b-0">
                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-full mt-2" />
                  <div className="flex-1">
                    <p className="text-base font-medium">Работа создана</p>
                    <p className="text-sm text-slate-500 mt-1">{formatDate(selectedWorkData.created_at)} в {formatTime(selectedWorkData.created_at)}</p>
                  </div>
                </div>
                {workEntries.slice(0, 5).map((entry) => (
                  <div key={entry.id} className="flex gap-4 pb-4 border-b border-slate-100 last:border-b-0">
                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full mt-2" />
                    <div className="flex-1">
                      <p className="text-base font-medium">{entry.author_name} добавил запись</p>
                      <p className="text-sm text-slate-600 mt-1">{entry.description.slice(0, 80)}...</p>
                      <p className="text-sm text-slate-500 mt-1">{formatDate(entry.created_at)} в {formatTime(entry.created_at)}</p>
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