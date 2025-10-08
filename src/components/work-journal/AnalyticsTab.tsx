import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { PlanFactComparison } from '@/types/journal';

interface AnalyticsTabProps {
  workId: number;
}

const mockPlanFactData: PlanFactComparison[] = [
  {
    estimate_item_id: 1,
    category: 'Материалы',
    name: 'Кирпич керамический',
    planned_quantity: 1000,
    actual_quantity: 950,
    planned_cost: 50000,
    actual_cost: 47500,
    deviation_percent: -5,
    deviation_amount: -2500,
    status: 'normal',
  },
  {
    estimate_item_id: 2,
    category: 'Материалы',
    name: 'Цемент М500',
    planned_quantity: 500,
    actual_quantity: 580,
    planned_cost: 25000,
    actual_cost: 29000,
    deviation_percent: 16,
    deviation_amount: 4000,
    status: 'critical',
  },
  {
    estimate_item_id: 3,
    category: 'Работа',
    name: 'Кирпичная кладка',
    planned_quantity: 100,
    actual_quantity: 108,
    planned_cost: 200000,
    actual_cost: 216000,
    deviation_percent: 8,
    deviation_amount: 16000,
    status: 'warning',
  },
];

const mockSummary = {
  total_planned_budget: 275000,
  total_actual_cost: 292500,
  total_deviation: 17500,
  total_deviation_percent: 6.4,
  items_in_budget: 1,
  items_warning: 1,
  items_critical: 1,
};

export default function AnalyticsTab({ workId }: AnalyticsTabProps) {
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'normal': return '🟢 В пределах нормы';
      case 'warning': return '⚠️ Требует внимания';
      case 'critical': return '❌ Критическое отклонение';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-3 md:p-6 lg:p-8 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold">Аналитика: План vs Факт</h3>
          <Button size="sm" variant="outline">
            <Icon name="Download" size={16} className="mr-2" />
            Экспорт отчёта
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Icon name="Calculator" size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-600">Плановый бюджет</p>
                  <p className="text-lg font-bold">{mockSummary.total_planned_budget.toLocaleString('ru-RU')} ₽</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Icon name="TrendingUp" size={20} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-600">Фактические затраты</p>
                  <p className="text-lg font-bold">{mockSummary.total_actual_cost.toLocaleString('ru-RU')} ₽</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center',
                  mockSummary.total_deviation >= 0 ? 'bg-red-100' : 'bg-green-100'
                )}>
                  <Icon 
                    name={mockSummary.total_deviation >= 0 ? 'TrendingDown' : 'TrendingUp'} 
                    size={20} 
                    className={mockSummary.total_deviation >= 0 ? 'text-red-600' : 'text-green-600'} 
                  />
                </div>
                <div>
                  <p className="text-xs text-slate-600">Отклонение</p>
                  <p className={cn(
                    'text-lg font-bold',
                    mockSummary.total_deviation >= 0 ? 'text-red-600' : 'text-green-600'
                  )}>
                    {mockSummary.total_deviation >= 0 ? '+' : ''}{mockSummary.total_deviation.toLocaleString('ru-RU')} ₽
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Icon name="Percent" size={20} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-600">Отклонение, %</p>
                  <p className={cn(
                    'text-lg font-bold',
                    mockSummary.total_deviation_percent > 5 ? 'text-amber-600' : 'text-green-600'
                  )}>
                    {mockSummary.total_deviation_percent >= 0 ? '+' : ''}{mockSummary.total_deviation_percent.toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white rounded-lg p-4 mb-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">Цветовая индикация отклонений:</h4>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-xs text-slate-600">≤ 5% — норма</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                <span className="text-xs text-slate-600">5–15% — предупреждение</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-xs text-slate-600">&gt; 15% — критично</span>
              </div>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Детализация по позициям сметы</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left p-3 text-xs font-semibold text-slate-700">Категория</th>
                    <th className="text-left p-3 text-xs font-semibold text-slate-700">Наименование</th>
                    <th className="text-right p-3 text-xs font-semibold text-slate-700">План (кол.)</th>
                    <th className="text-right p-3 text-xs font-semibold text-slate-700">Факт (кол.)</th>
                    <th className="text-right p-3 text-xs font-semibold text-slate-700">План (₽)</th>
                    <th className="text-right p-3 text-xs font-semibold text-slate-700">Факт (₽)</th>
                    <th className="text-right p-3 text-xs font-semibold text-slate-700">Откл. (%)</th>
                    <th className="text-left p-3 text-xs font-semibold text-slate-700">Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {mockPlanFactData.map((item) => (
                    <tr key={item.estimate_item_id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-3">
                        <Badge variant="outline" className="text-xs">{item.category}</Badge>
                      </td>
                      <td className="p-3 text-sm">{item.name}</td>
                      <td className="p-3 text-sm text-right text-slate-600">{item.planned_quantity}</td>
                      <td className="p-3 text-sm text-right font-semibold">{item.actual_quantity}</td>
                      <td className="p-3 text-sm text-right text-slate-600">
                        {item.planned_cost.toLocaleString('ru-RU')}
                      </td>
                      <td className="p-3 text-sm text-right font-semibold">
                        {item.actual_cost.toLocaleString('ru-RU')}
                      </td>
                      <td className="p-3 text-sm text-right">
                        <span className={cn(
                          'font-semibold',
                          item.status === 'normal' && 'text-green-600',
                          item.status === 'warning' && 'text-amber-600',
                          item.status === 'critical' && 'text-red-600'
                        )}>
                          {item.deviation_percent >= 0 ? '+' : ''}{item.deviation_percent}%
                        </span>
                      </td>
                      <td className="p-3">
                        <Badge className={cn('text-xs border', getStatusColor(item.status))}>
                          {getStatusLabel(item.status)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 border-t-2 border-slate-300">
                  <tr>
                    <td colSpan={4} className="p-3 text-sm font-semibold">Итого:</td>
                    <td className="p-3 text-sm font-semibold text-right">
                      {mockSummary.total_planned_budget.toLocaleString('ru-RU')} ₽
                    </td>
                    <td className="p-3 text-sm font-semibold text-right">
                      {mockSummary.total_actual_cost.toLocaleString('ru-RU')} ₽
                    </td>
                    <td className="p-3 text-sm font-semibold text-right">
                      <span className={cn(
                        mockSummary.total_deviation_percent <= 5 && 'text-green-600',
                        mockSummary.total_deviation_percent > 5 && mockSummary.total_deviation_percent <= 15 && 'text-amber-600',
                        mockSummary.total_deviation_percent > 15 && 'text-red-600'
                      )}>
                        {mockSummary.total_deviation_percent >= 0 ? '+' : ''}{mockSummary.total_deviation_percent.toFixed(1)}%
                      </span>
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900">
            💡 <strong>Будущие функции (январь 2025):</strong> Фильтрация по дате, объекту, видам работ, материалам. Экспорт в PDF/XLSX.
          </p>
        </div>
      </div>
    </div>
  );
}