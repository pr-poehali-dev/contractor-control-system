import Icon from '@/components/ui/icon';
import { safeFormatDate } from '@/utils/dateValidation';

interface ScheduledInspectionNoticeProps {
  scheduledDate: string;
}

export default function ScheduledInspectionNotice({ scheduledDate }: ScheduledInspectionNoticeProps) {
  const formattedDate = safeFormatDate(scheduledDate, { day: 'numeric', month: 'long' });
  
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
      <Icon name="Clock" size={20} className="text-amber-600 shrink-0 mt-0.5" />
      <div>
        <p className="font-medium text-amber-900 mb-1">Проверка запланирована</p>
        <p className="text-sm text-amber-700">
          {formattedDate ? `Редактирование будет доступно ${formattedDate}` : 'Дата проверки некорректна'}
        </p>
      </div>
    </div>
  );
}