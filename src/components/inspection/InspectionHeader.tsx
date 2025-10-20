import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { safeFormatDate } from '@/utils/dateValidation';

interface InspectionHeaderProps {
  inspectionNumber: string;
  status: string;
  type?: string;
  workTitle?: string;
  objectTitle?: string;
  scheduledDate?: string;
}

export default function InspectionHeader({
  status,
  workTitle,
  objectTitle,
  scheduledDate
}: InspectionHeaderProps) {
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
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-6 mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
        <h2 className="text-base md:text-lg font-semibold text-slate-900">Информация о проверке</h2>
        <Badge variant="outline" className={statusConfig.className}>
          {statusConfig.label}
        </Badge>
      </div>
      <div className="space-y-3 md:space-y-4">
        {objectTitle && (
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded-lg shrink-0">
              <Icon name="Building2" size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Объект</p>
              <p className="font-medium text-slate-900">{objectTitle}</p>
            </div>
          </div>
        )}

        {workTitle && (
          <div className="flex items-start gap-3">
            <div className="bg-purple-100 p-2 rounded-lg shrink-0">
              <Icon name="Hammer" size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Вид работы</p>
              <p className="font-medium text-slate-900">{workTitle}</p>
            </div>
          </div>
        )}

        {scheduledDate && (
          <div className="flex items-start gap-3">
            <div className="bg-amber-100 p-2 rounded-lg shrink-0">
              <Icon name="Calendar" size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Дата проверки</p>
              <p className="font-medium text-slate-900">{formatDate(scheduledDate)}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}