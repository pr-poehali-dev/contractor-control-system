import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { safeFormatDate } from '@/utils/dateValidation';
import { cn } from '@/lib/utils';

interface InspectionInfoCardProps {
  inspectionNumber?: number;
  status: string;
  type?: string;
  workTitle?: string;
  objectTitle?: string;
  scheduledDate?: string;
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export function InspectionInfoCard({
  status,
  workTitle,
  objectTitle,
}: InspectionInfoCardProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'draft':
        return {
          label: 'Запланирована',
          className: 'bg-blue-100 text-blue-700 border-blue-200'
        };
      case 'active':
        return {
          label: 'На проверке',
          className: 'bg-amber-100 text-amber-700 border-amber-200'
        };
      case 'completed':
        return {
          label: 'Завершена',
          className: 'bg-green-100 text-green-700 border-green-200'
        };
      default:
        return {
          label: status,
          className: 'bg-slate-100 text-slate-700 border-slate-200'
        };
    }
  };

  const statusConfig = getStatusConfig(status);

  return (
    <Card className="mb-6">
      <CardContent className="p-3 md:p-4">
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-start gap-2 md:gap-3 w-full text-left hover:opacity-70 transition-opacity min-w-0"
        >
          <Icon 
            name={isCollapsed ? "ChevronRight" : "ChevronDown"} 
            size={20} 
            className="text-slate-500 flex-shrink-0 mt-0.5"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm md:text-base font-semibold leading-tight mb-1.5">Информация о проверке</h3>
            {isCollapsed && (
              <p className="text-xs md:text-sm text-slate-500">
                {objectTitle && `${objectTitle} • `}
                {workTitle}
              </p>
            )}
          </div>
        </button>

        {!isCollapsed && (
          <div className="space-y-3 pl-8 mt-3">
          {objectTitle && (
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-lg shrink-0">
                <Icon name="Building2" size={18} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Объект</p>
                <p className="text-sm md:text-base font-medium text-slate-900">{objectTitle}</p>
              </div>
            </div>
          )}

          {workTitle && (
            <div className="flex items-start gap-3">
              <div className="bg-purple-100 p-2 rounded-lg shrink-0">
                <Icon name="Hammer" size={18} className="text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Вид работы</p>
                <p className="text-sm md:text-base font-medium text-slate-900">{workTitle}</p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3">
            <div className="bg-slate-100 p-2 rounded-lg shrink-0">
              <Icon name="CheckCircle2" size={18} className="text-slate-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Статус</p>
              <Badge variant="outline" className={cn("text-xs", statusConfig.className)}>
                {statusConfig.label}
              </Badge>
            </div>
          </div>
        </div>
        )}
      </CardContent>
    </Card>
  );
}