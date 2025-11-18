import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import type { EstimatePosition, WorkReport, EstimateComparison } from '@/types/estimate';

interface EstimateComparisonTabProps {
  estimatePositions: EstimatePosition[];
  workReports: WorkReport[];
}

export default function EstimateComparisonTab({
  estimatePositions,
  workReports,
}: EstimateComparisonTabProps) {
  
  const comparisonData: EstimateComparison[] = useMemo(() => {
    const positionMap = new Map<number, { name: string; unit: string; planned: number; actual: number }>();

    estimatePositions.forEach(ep => {
      positionMap.set(ep.id, {
        name: ep.name,
        unit: ep.unit,
        planned: ep.planned_quantity,
        actual: 0,
      });
    });

    workReports.forEach(report => {
      report.positions.forEach(rp => {
        if (rp.estimate_position_id) {
          const existing = positionMap.get(rp.estimate_position_id);
          if (existing) {
            existing.actual += rp.actual_quantity;
          }
        }
      });
    });

    return Array.from(positionMap.entries()).map(([id, data]) => {
      const percentage = data.planned > 0 ? Math.round((data.actual / data.planned) * 100) : 0;
      let status: 'under' | 'normal' | 'over' = 'normal';
      
      if (percentage < 90) status = 'under';
      else if (percentage > 110) status = 'over';

      return {
        position_id: id,
        name: data.name,
        unit: data.unit,
        planned_quantity: data.planned,
        actual_quantity: data.actual,
        percentage,
        status,
      };
    });
  }, [estimatePositions, workReports]);

  const getStatusColor = (status: 'under' | 'normal' | 'over') => {
    switch (status) {
      case 'under': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'normal': return 'text-green-600 bg-green-50 border-green-200';
      case 'over': return 'text-red-600 bg-red-50 border-red-200';
    }
  };

  const getStatusLabel = (status: 'under' | 'normal' | 'over') => {
    switch (status) {
      case 'under': return 'В работе';
      case 'normal': return 'По плану';
      case 'over': return 'Перерасход';
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage < 90) return 'bg-blue-500';
    if (percentage <= 110) return 'bg-green-500';
    return 'bg-red-500';
  };

  const stats = useMemo(() => {
    const total = comparisonData.length;
    const completed = comparisonData.filter(d => d.percentage >= 100).length;
    const inProgress = comparisonData.filter(d => d.percentage > 0 && d.percentage < 100).length;
    const notStarted = comparisonData.filter(d => d.percentage === 0).length;

    return { total, completed, inProgress, notStarted };
  }, [comparisonData]);

  if (estimatePositions.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto bg-slate-50 w-full overflow-x-hidden">
        <div className="px-3 py-4 md:p-8 lg:p-12 max-w-7xl mx-auto w-full">
          <Card className="p-12 text-center">
            <Icon name="FileSpreadsheet" size={64} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Смета не загружена</h3>
            <p className="text-slate-500">
              Загрузите локальный сметный расчет во вкладке "Локальная смета", чтобы начать сравнение план/факт
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 w-full overflow-x-hidden">
      <div className="px-3 py-4 md:p-8 lg:p-12 max-w-7xl mx-auto w-full">
        <div className="mb-6">
          <h4 className="text-lg md:text-xl font-semibold mb-4">План-фактный анализ</h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-100">
                    <Icon name="ListChecks" size={20} className="text-slate-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                    <p className="text-xs text-slate-500">Всего позиций</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100">
                    <Icon name="CheckCircle2" size={20} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                    <p className="text-xs text-slate-500">Выполнено</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <Icon name="Clock" size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
                    <p className="text-xs text-slate-500">В работе</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-100">
                    <Icon name="CircleDashed" size={20} className="text-slate-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-600">{stats.notStarted}</p>
                    <p className="text-xs text-slate-500">Не начато</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-3">
          {comparisonData.map((item) => (
            <Card key={item.position_id}>
              <CardContent className="p-4 md:p-5">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h5 className="font-semibold text-slate-900 mb-1 leading-tight">{item.name}</h5>
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <span>
                          <span className="font-medium">План:</span> {item.planned_quantity} {item.unit}
                        </span>
                        <span>•</span>
                        <span>
                          <span className="font-medium">Факт:</span> {item.actual_quantity.toFixed(2)} {item.unit}
                        </span>
                      </div>
                    </div>
                    <Badge className={getStatusColor(item.status)}>
                      {getStatusLabel(item.status)}
                    </Badge>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Процент выполнения</span>
                      <span className="font-semibold text-slate-900">{item.percentage}%</span>
                    </div>
                    <div className="relative">
                      <Progress 
                        value={Math.min(item.percentage, 100)} 
                        className="h-2.5"
                      />
                      <div 
                        className={`absolute top-0 left-0 h-2.5 rounded-full transition-all ${getProgressColor(item.percentage)}`}
                        style={{ width: `${Math.min(item.percentage, 100)}%` }}
                      />
                    </div>
                  </div>

                  {item.percentage > 110 && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <Icon name="AlertTriangle" size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-red-800">
                        Обнаружен перерасход материалов на {(item.actual_quantity - item.planned_quantity).toFixed(2)} {item.unit}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {comparisonData.length === 0 && (
          <Card className="p-12 text-center">
            <Icon name="FileSpreadsheet" size={64} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500">Нет данных для отображения</p>
          </Card>
        )}
      </div>
    </div>
  );
}
