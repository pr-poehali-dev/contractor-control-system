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
  inspectionNumber,
  status,
  workTitle,
  objectTitle,
  scheduledDate,
  isCollapsed = false,
  onToggle
}: InspectionInfoCardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return safeFormatDate(dateString);
  };

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
      <CardContent className="p-4 md:p-6">
        <button
          type="button"
          onClick={onToggle}
          className="flex items-start gap-3 w-full text-left hover:opacity-70 transition-opacity mb-4"
        >
          <Icon 
            name={isCollapsed ? "ChevronRight" : "ChevronDown"} 
            size={20} 
            className="text-slate-500 flex-shrink-0 mt-0.5"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="text-base md:text-lg font-semibold">Информация о проверке</h3>
              <Badge variant="outline" className={cn("text-xs", statusConfig.className)}>
                {statusConfig.label}
              </Badge>
            </div>
            {isCollapsed && (
              <p className="text-xs md:text-sm text-slate-500">
                {objectTitle && `${objectTitle} • `}
                {workTitle}
              </p>
            )}
          </div>
        </button>

        {!isCollapsed && (
          <div className="space-y-3 pl-8">
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

            {scheduledDate && (
              <div className="flex items-start gap-3">
                <div className="bg-amber-100 p-2 rounded-lg shrink-0">
                  <Icon name="Calendar" size={18} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Дата проверки</p>
                  <p className="text-sm md:text-base font-medium text-slate-900">{formatDate(scheduledDate)}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
