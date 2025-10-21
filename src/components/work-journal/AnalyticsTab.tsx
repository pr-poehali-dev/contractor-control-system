import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Icon from '@/components/ui/icon';

interface AnalyticsTabProps {
  workId: number;
}

interface MaterialItem {
  id: number;
  name: string;
  planned: number;
  actual: number;
  deviation: number;
  deviationPercent: number;
}

const mockMaterials: MaterialItem[] = [
  { id: 1, name: 'Вода', id: 1, planned: 5900, actual: 0, deviation: 5900, deviationPercent: 100 },
  { id: 2, name: 'Вывоз мусора', planned: 1180, actual: 1000, deviation: 180, deviationPercent: 15.25 },
  { id: 3, name: 'Охрана помещений', planned: 5900, actual: 6000, deviation: -100, deviationPercent: -1.69 },
  { id: 4, name: 'Прочие эксплуатационные расходы', planned: 4720, actual: 0, deviation: 4720, deviationPercent: 100 },
  { id: 5, name: 'Текущий ремонт зданий и сооружений', planned: 29500, actual: 0, deviation: 29500, deviationPercent: 100 },
  { id: 6, name: 'Текущий ремонт производственного оборудования', planned: 73750, actual: 10000, deviation: 63750, deviationPercent: 86.44 },
  { id: 7, name: 'Сооружения', planned: 0, actual: 0, deviation: 0, deviationPercent: 0 },
  { id: 8, name: 'Теплоэнергия', planned: 3540, actual: 3000, deviation: 540, deviationPercent: 15.25 },
  { id: 9, name: 'Техническое обслуживание', planned: 14160, actual: 0, deviation: 14160, deviationPercent: 100 },
  { id: 10, name: 'Уборка помещений', planned: 7080, actual: 6000, deviation: 1080, deviationPercent: 15.25 },
  { id: 11, name: 'Электроэнергия', planned: 32450, actual: 3000, deviation: 29450, deviationPercent: 90.76 },
];

const summary = {
  planned: 178180,
  actual: 29000,
  deviation: 149180,
  deviationPercent: 83.72,
};

export default function AnalyticsTab({ workId }: AnalyticsTabProps) {
  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 w-full overflow-x-hidden">
      <div className="px-3 py-4 md:p-8 lg:p-12 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <h3 className="text-lg md:text-2xl font-bold">План-фактный анализ по материалам</h3>
          <Button variant="outline" size="sm" className="md:h-10">
            <Icon name="Download" size={16} className="md:mr-2" />
            <span className="hidden md:inline">Экспорт</span>
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs md:text-sm">
                <thead className="bg-amber-50 border-b-2 border-amber-200">
                  <tr>
                    <th className="text-left p-2 md:p-4 font-semibold text-slate-700 sticky left-0 bg-amber-50 z-10">
                      Материал
                    </th>
                    <th className="text-right p-2 md:p-4 font-semibold text-slate-700 whitespace-nowrap">
                      ПЛАН
                    </th>
                    <th className="text-right p-2 md:p-4 font-semibold text-slate-700 whitespace-nowrap">
                      ФАКТ
                    </th>
                    <th className="text-right p-2 md:p-4 font-semibold text-slate-700 whitespace-nowrap">
                      Откл. (абс.)
                    </th>
                    <th className="text-right p-2 md:p-4 font-semibold text-slate-700 whitespace-nowrap">
                      Откл. (%)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {mockMaterials.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-2 md:p-4 sticky left-0 bg-white hover:bg-slate-50 z-10">
                        {item.name}
                      </td>
                      <td className="p-2 md:p-4 text-right font-medium whitespace-nowrap">
                        {item.planned.toLocaleString('ru-RU')}
                      </td>
                      <td className="p-2 md:p-4 text-right font-medium whitespace-nowrap">
                        {item.actual.toLocaleString('ru-RU')}
                      </td>
                      <td className={cn(
                        'p-2 md:p-4 text-right font-semibold whitespace-nowrap',
                        item.deviation > 0 ? 'text-slate-600' : 'text-red-600'
                      )}>
                        {item.deviation.toLocaleString('ru-RU')}
                      </td>
                      <td className={cn(
                        'p-2 md:p-4 text-right font-semibold whitespace-nowrap',
                        item.deviationPercent === 100 ? 'text-slate-600' :
                        item.deviationPercent > 0 ? 'text-slate-600' : 'text-red-600'
                      )}>
                        {item.deviationPercent.toFixed(2).replace('.', ',')}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-amber-50 border-t-2 border-amber-300">
                  <tr>
                    <td className="p-2 md:p-4 font-bold text-base sticky left-0 bg-amber-50 z-10">
                      Итого
                    </td>
                    <td className="p-2 md:p-4 text-right font-bold text-base whitespace-nowrap">
                      {summary.planned.toLocaleString('ru-RU')}
                    </td>
                    <td className="p-2 md:p-4 text-right font-bold text-base whitespace-nowrap">
                      {summary.actual.toLocaleString('ru-RU')}
                    </td>
                    <td className="p-2 md:p-4 text-right font-bold text-base text-slate-700 whitespace-nowrap">
                      {summary.deviation.toLocaleString('ru-RU')}
                    </td>
                    <td className="p-2 md:p-4 text-right font-bold text-base text-slate-700 whitespace-nowrap">
                      {summary.deviationPercent.toFixed(2).replace('.', ',')}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
