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
        <div className="flex items-center gap-2 flex-wrap mb-4">
          <Badge variant="outline" className={cn("text-xs", statusConfig.className)}>
            {statusConfig.label}
          </Badge>
        </div>

        <div className="space-y-3">
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
        </div>
      </CardContent>
    </Card>
  );
}