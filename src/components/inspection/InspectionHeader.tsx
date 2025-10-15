import { Badge } from '@/components/ui/badge';
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
  inspectionNumber,
  status,
  type,
  workTitle,
  objectTitle,
  scheduledDate
}: InspectionHeaderProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">draft</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-700">Завершена</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
          {inspectionNumber}
        </h1>
        {getStatusBadge(status)}
      </div>
      
      {type && (
        <p className="text-slate-600">
          {type === 'scheduled' ? '📅 Плановая проверка' : '⚡ Внеплановая проверка'}
        </p>
      )}
      
      {workTitle && (
        <p className="text-slate-600 mt-1">
          <Icon name="Wrench" size={16} className="inline mr-1" />
          {workTitle}
          {objectTitle && ` • ${objectTitle}`}
        </p>
      )}
      
      {scheduledDate && (
        <p className="text-slate-600 mt-1">
          <Icon name="Calendar" size={16} className="inline mr-1" />
          Запланирована на: {new Date(scheduledDate).toLocaleDateString('ru-RU')}
        </p>
      )}
    </div>
  );
}
