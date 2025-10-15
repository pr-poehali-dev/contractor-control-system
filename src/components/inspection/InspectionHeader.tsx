import Icon from '@/components/ui/icon';

interface InspectionHeaderProps {
  inspectionNumber: string;
  status: string;
  type?: string;
  workTitle?: string;
  objectTitle?: string;
  scheduledDate?: string;
}

export default function InspectionHeader({
  workTitle,
  objectTitle,
  scheduledDate
}: InspectionHeaderProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
      <div className="space-y-4">
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