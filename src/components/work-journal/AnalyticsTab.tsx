import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import Icon from '@/components/ui/icon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

type SortField = 'name' | 'planned' | 'actual' | 'deviation' | 'deviationPercent';
type SortOrder = 'asc' | 'desc';

const mockMaterials: MaterialItem[] = [
  { id: 1, name: 'Вода', planned: 5900, actual: 0, deviation: 5900, deviationPercent: 100 },
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

export default function AnalyticsTab({ workId }: AnalyticsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [deviationFilter, setDeviationFilter] = useState<'all' | 'positive' | 'negative' | 'zero'>('all');

  const filteredAndSortedMaterials = useMemo(() => {
    let filtered = mockMaterials;

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (deviationFilter !== 'all') {
      filtered = filtered.filter(item => {
        if (deviationFilter === 'positive') return item.deviation > 0;
        if (deviationFilter === 'negative') return item.deviation < 0;
        if (deviationFilter === 'zero') return item.deviation === 0;
        return true;
      });
    }

    const sorted = [...filtered].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue, 'ru')
          : bValue.localeCompare(aValue, 'ru');
      }

      return sortOrder === 'asc' 
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });

    return sorted;
  }, [searchQuery, sortField, sortOrder, deviationFilter]);

  const summary = useMemo(() => {
    const planned = filteredAndSortedMaterials.reduce((sum, item) => sum + item.planned, 0);
    const actual = filteredAndSortedMaterials.reduce((sum, item) => sum + item.actual, 0);
    const deviation = planned - actual;
    const deviationPercent = planned > 0 ? (deviation / planned) * 100 : 0;

    return { planned, actual, deviation, deviationPercent };
  }, [filteredAndSortedMaterials]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const exportToCSV = () => {
    const headers = ['Материал', 'ПЛАН', 'ФАКТ', 'Откл. (абс.)', 'Откл. (%)'];
    const rows = filteredAndSortedMaterials.map(item => [
      item.name,
      item.planned,
      item.actual,
      item.deviation,
      item.deviationPercent.toFixed(2)
    ]);
    
    const csv = [
      headers.join(';'),
      ...rows.map(row => row.join(';')),
      ['', '', '', '', ''],
      ['Итого', summary.planned, summary.actual, summary.deviation, summary.deviationPercent.toFixed(2)].join(';')
    ].join('\n');

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `analytics_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <Icon name="ArrowUpDown" size={14} className="opacity-40" />;
    return sortOrder === 'asc' 
      ? <Icon name="ArrowUp" size={14} /> 
      : <Icon name="ArrowDown" size={14} />;
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 w-full overflow-x-hidden">
      <div className="px-3 py-4 md:p-8 lg:p-12 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
          <h3 className="text-lg md:text-2xl font-bold">План-фактный анализ по материалам</h3>
          <Button variant="outline" size="sm" className="md:h-10 w-full md:w-auto" onClick={exportToCSV}>
            <Icon name="Download" size={16} className="mr-2" />
            Экспорт
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <div className="relative">
            <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Поиск по материалам..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10"
            />
          </div>

          <Select value={deviationFilter} onValueChange={(value: any) => setDeviationFilter(value)}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Фильтр по отклонениям" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все материалы</SelectItem>
              <SelectItem value="positive">Положительное отклонение</SelectItem>
              <SelectItem value="negative">Отрицательное отклонение</SelectItem>
              <SelectItem value="zero">Без отклонений</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Icon name="Info" size={16} />
            <span>Найдено: {filteredAndSortedMaterials.length} из {mockMaterials.length}</span>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs md:text-sm">
                <thead className="bg-amber-50 border-b-2 border-amber-200">
                  <tr>
                    <th 
                      className="text-left p-2 md:p-4 font-semibold text-slate-700 sticky left-0 bg-amber-50 z-10 cursor-pointer hover:bg-amber-100 transition-colors"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center gap-2">
                        Материал
                        <SortIcon field="name" />
                      </div>
                    </th>
                    <th 
                      className="text-right p-2 md:p-4 font-semibold text-slate-700 whitespace-nowrap cursor-pointer hover:bg-amber-100 transition-colors"
                      onClick={() => handleSort('planned')}
                    >
                      <div className="flex items-center justify-end gap-2">
                        ПЛАН
                        <SortIcon field="planned" />
                      </div>
                    </th>
                    <th 
                      className="text-right p-2 md:p-4 font-semibold text-slate-700 whitespace-nowrap cursor-pointer hover:bg-amber-100 transition-colors"
                      onClick={() => handleSort('actual')}
                    >
                      <div className="flex items-center justify-end gap-2">
                        ФАКТ
                        <SortIcon field="actual" />
                      </div>
                    </th>
                    <th 
                      className="text-right p-2 md:p-4 font-semibold text-slate-700 whitespace-nowrap cursor-pointer hover:bg-amber-100 transition-colors"
                      onClick={() => handleSort('deviation')}
                    >
                      <div className="flex items-center justify-end gap-2">
                        Откл. (абс.)
                        <SortIcon field="deviation" />
                      </div>
                    </th>
                    <th 
                      className="text-right p-2 md:p-4 font-semibold text-slate-700 whitespace-nowrap cursor-pointer hover:bg-amber-100 transition-colors"
                      onClick={() => handleSort('deviationPercent')}
                    >
                      <div className="flex items-center justify-end gap-2">
                        Откл. (%)
                        <SortIcon field="deviationPercent" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedMaterials.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500">
                        <Icon name="Search" size={48} className="mx-auto mb-2 opacity-20" />
                        <p>Материалы не найдены</p>
                      </td>
                    </tr>
                  ) : (
                    filteredAndSortedMaterials.map((item) => (
                      <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
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
                          item.deviation > 0 ? 'text-slate-600' : item.deviation < 0 ? 'text-red-600' : 'text-slate-400'
                        )}>
                          {item.deviation.toLocaleString('ru-RU')}
                        </td>
                        <td className={cn(
                          'p-2 md:p-4 text-right font-semibold whitespace-nowrap',
                          item.deviationPercent === 100 ? 'text-slate-600' :
                          item.deviationPercent > 0 ? 'text-slate-600' : 
                          item.deviationPercent < 0 ? 'text-red-600' : 'text-slate-400'
                        )}>
                          {item.deviationPercent.toFixed(2).replace('.', ',')}
                        </td>
                      </tr>
                    ))
                  )}
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

        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Icon name="Info" size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-slate-700">
              <p className="font-semibold mb-1">Как читать таблицу:</p>
              <ul className="space-y-1 text-slate-600">
                <li>• <strong>ПЛАН</strong> — запланированный расход материала</li>
                <li>• <strong>ФАКТ</strong> — фактический расход материала</li>
                <li>• <strong>Откл. (абс.)</strong> — абсолютное отклонение (план - факт)</li>
                <li>• <strong>Откл. (%)</strong> — процентное отклонение от плана</li>
                <li>• Красным цветом выделен перерасход материалов</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
