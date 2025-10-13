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
    <div className="flex-1 overflow-y-auto p-3 md:p-8 lg:p-12 bg-slate-50 pb-32 md:pb-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4 md:mb-8 gap-2">
          <h3 className="text-lg md:text-2xl lg:text-3xl font-bold">Информация</h3>
          <Button onClick={handleCreateInspection} size="sm" className="md:h-10">
            <Icon name="Plus" size={16} className="md:mr-2 md:w-[18px] md:h-[18px]" />
            <span className="hidden md:inline">Создать проверку</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 lg:gap-10">
          <Card>
            <CardContent className="p-4 md:p-6 lg:p-8">
              <h4 className="text-sm md:text-xl font-semibold mb-3 md:mb-5">Детали работы</h4>
              <div className="space-y-2 md:space-y-4 text-xs md:text-lg">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-600 flex-shrink-0">Статус:</span>
                  <Badge className="text-[10px] md:text-sm flex-shrink-0">
                    {selectedWorkData.status === 'active' ? '🟢 В работе' : selectedWorkData.status === 'completed' ? '✅ Готово' : '🟡 Ожидание'}
                  </Badge>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-600 flex-shrink-0">Подрядчик:</span>
                  <span className="font-medium text-right break-words min-w-0">{selectedWorkData.contractor_name || 'Не назначен'}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-600 flex-shrink-0">Создано:</span>
                  <span className="font-medium text-right break-words">{formatDate(selectedWorkData.created_at)}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-600 flex-shrink-0">Записей:</span>
                  <span className="font-medium">{workEntries.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:row-span-2">
            <CardContent className="p-4 md:p-5 lg:p-7">
              <h4 className="text-sm md:text-lg font-semibold mb-3 md:mb-4">История изменений</h4>
              <div className="space-y-2 md:space-y-4 max-h-[400px] md:max-h-[600px] overflow-y-auto pr-1 md:pr-2">
                <div className="flex gap-2 md:gap-4 pb-2 md:pb-4 border-b border-slate-100 last:border-b-0">
                  <div className="w-1.5 h-1.5 md:w-2.5 md:h-2.5 bg-blue-500 rounded-full mt-1.5 md:mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-base font-medium break-words">Работа создана</p>
                    <p className="text-[10px] md:text-sm text-slate-500 mt-0.5 md:mt-1">{formatDate(selectedWorkData.created_at)} в {formatTime(selectedWorkData.created_at)}</p>
                  </div>
                </div>
                {workEntries.slice(0, 5).map((entry) => (
                  <div key={entry.id} className="flex gap-2 md:gap-4 pb-2 md:pb-4 border-b border-slate-100 last:border-b-0">
                    <div className="w-1.5 h-1.5 md:w-2.5 md:h-2.5 bg-green-500 rounded-full mt-1.5 md:mt-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs md:text-base font-medium break-words">{entry.author_name} добавил запись</p>
                      <p className="text-[10px] md:text-sm text-slate-600 mt-0.5 md:mt-1 break-words line-clamp-3">{entry.description}</p>
                      <p className="text-[10px] md:text-sm text-slate-500 mt-0.5 md:mt-1">{formatDate(entry.created_at)} в {formatTime(entry.created_at)}</p>
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