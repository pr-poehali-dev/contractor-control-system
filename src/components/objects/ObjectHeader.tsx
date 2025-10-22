import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import type { ObjectData } from '@/contexts/AuthContext';

interface ObjectHeaderProps {
  object: ObjectData;
  showBackButton?: boolean;
  onEdit?: () => void;
}

const ObjectHeader = ({ object, showBackButton = false, onEdit }: ObjectHeaderProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/objects');
  };

  const handlePublicPage = () => {
    navigate(`/objects/${object.id}/public`);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      active: { label: 'Активный', variant: 'default' },
      completed: { label: 'Завершен', variant: 'secondary' },
      on_hold: { label: 'Приостановлен', variant: 'outline' },
    };

    const statusInfo = statusMap[status] || { label: status, variant: 'outline' };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  return (
    <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center gap-3 md:gap-4">
          {/* Кнопка назад */}
          {showBackButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="flex-shrink-0 h-9 w-9"
            >
              <Icon name="ChevronLeft" size={20} />
            </Button>
          )}

          {/* Иконка объекта */}
          <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 bg-blue-500 rounded-xl flex items-center justify-center">
            <Icon name="Building2" size={20} className="text-white" />
          </div>

          {/* Информация об объекте */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-lg md:text-xl font-semibold text-slate-900 truncate">
                {object.title}
              </h1>
              {object.status && getStatusBadge(object.status)}
            </div>
            {object.address && (
              <div className="flex items-center gap-1.5 text-sm text-slate-600">
                <Icon name="MapPin" size={14} />
                <span className="truncate">{object.address}</span>
              </div>
            )}
          </div>

          {/* Действия */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Публичная страница */}
            <Button
              variant="outline"
              size="sm"
              onClick={handlePublicPage}
              className="hidden md:flex items-center gap-2"
            >
              <Icon name="ExternalLink" size={16} />
              Публичная страница
            </Button>

            {/* Мобильная версия - только иконка */}
            <Button
              variant="outline"
              size="icon"
              onClick={handlePublicPage}
              className="md:hidden h-9 w-9"
            >
              <Icon name="ExternalLink" size={18} />
            </Button>

            {/* Редактирование */}
            {onEdit && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onEdit}
                  className="hidden md:flex items-center gap-2"
                >
                  <Icon name="Settings" size={16} />
                  Настройки
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onEdit}
                  className="md:hidden h-9 w-9"
                >
                  <Icon name="Settings" size={18} />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ObjectHeader;
