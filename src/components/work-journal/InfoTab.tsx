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
  const getStatusInfo = () => {
    const completion = selectedWorkData?.completion_percentage || 0;
    const status = selectedWorkData?.status;
    
    if (completion === 100 || status === 'completed') {
      return { label: '✅ Завершено', color: 'bg-green-100 text-green-800 border-green-200' };
    }
    if (completion > 0 || status === 'active' || selectedWorkData?.start_date) {
      return { label: '🟢 В процессе', color: 'bg-blue-100 text-blue-800 border-blue-200' };
    }
    return { label: '🟡 Ожидание', color: 'bg-amber-100 text-amber-800 border-amber-200' };
  };

  const statusInfo = getStatusInfo();
  const reportEntries = workEntries
    .filter(entry => !entry.is_work_start && (entry.volume || entry.materials || entry.photo_urls))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 w-full overflow-x-hidden">
      <div className="px-3 py-4 md:p-8 lg:p-12 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 lg:gap-10">
          <Card>
            <CardContent className="p-3 md:p-6 lg:p-8">
              <h4 className="text-base md:text-xl font-semibold mb-3 md:mb-5">Детали работы</h4>
              <div className="space-y-2.5 md:space-y-4 text-sm md:text-base">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-600">Статус:</span>
                  <Badge className={`text-xs flex-shrink-0 border ${statusInfo.color}`} variant="outline">
                    {statusInfo.label}
                  </Badge>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-600">Процент выполнения:</span>
                  <span className="font-bold text-green-700">{selectedWorkData?.completion_percentage || 0}%</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-600">Подрядчик:</span>
                  <span className="font-medium text-right">{selectedWorkData.contractor_name || 'Не назначен'}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-600">Создано:</span>
                  <span className="font-medium text-right">{formatDate(selectedWorkData.created_at)}</span>
                </div>
                {selectedWorkData?.start_date && (
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-600">Начало работ:</span>
                    <span className="font-medium text-right">{formatDate(selectedWorkData.start_date)}</span>
                  </div>
                )}
                <div className="flex justify-between gap-2">
                  <span className="text-slate-600 flex-shrink-0">Отчетов:</span>
                  <span className="font-medium">{reportEntries.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:row-span-2">
            <CardContent className="p-3 md:p-5 lg:p-7">
              <h4 className="text-base md:text-lg font-semibold mb-3">История изменений</h4>
              <div className="space-y-3 md:space-y-4 max-h-[400px] md:max-h-[600px] overflow-y-auto pr-1">
                {reportEntries.map((entry) => (
                  <div key={entry.id} className="flex gap-2 pb-3 border-b border-slate-100">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        {entry.author_name} отправил отчет
                        {entry.completion_percentage !== undefined && entry.completion_percentage !== null && (
                          <span className="ml-2 text-green-600 font-bold">({entry.completion_percentage}%)</span>
                        )}
                      </p>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">{entry.description}</p>
                      {entry.volume && (
                        <p className="text-xs text-blue-600 mt-1">Объём: {entry.volume}</p>
                      )}
                      <p className="text-xs text-slate-500 mt-1">{formatDate(entry.created_at)} в {formatTime(entry.created_at)}</p>
                    </div>
                  </div>
                ))}
                {selectedWorkData?.start_date && (
                  <div className="flex gap-2 pb-3 border-b border-slate-100">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">🚀 Начало работ</p>
                      <p className="text-xs text-slate-500 mt-0.5">{formatDate(selectedWorkData.start_date)} в {formatTime(selectedWorkData.start_date)}</p>
                    </div>
                  </div>
                )}
                <div className="flex gap-2 pb-3 border-b-0">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">Работа создана</p>
                    <p className="text-xs text-slate-500 mt-0.5">{formatDate(selectedWorkData.created_at)} в {formatTime(selectedWorkData.created_at)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}