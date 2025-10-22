import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import type { ObjectData } from '@/contexts/AuthContext';

interface ObjectInfoBarProps {
  object: ObjectData;
  className?: string;
}

const ObjectInfoBar = ({ object, className = '' }: ObjectInfoBarProps) => {
  const navigate = useNavigate();

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
    return <Badge variant={statusInfo.variant} className="text-xs">{statusInfo.label}</Badge>;
  };

  return (
    <div className={`bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center gap-3 ${className}`}>
      <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
        <Icon name="Building2" size={18} className="text-white" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h3 className="text-sm font-semibold text-slate-900 truncate">
            {object.title}
          </h3>
          {object.status && getStatusBadge(object.status)}
        </div>
        {object.address && (
          <div className="flex items-center gap-1 text-xs text-slate-600">
            <Icon name="MapPin" size={12} />
            <span className="truncate">{object.address}</span>
          </div>
        )}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={handlePublicPage}
        className="flex-shrink-0 h-8 px-3 text-xs"
      >
        <Icon name="ExternalLink" size={14} className="mr-1.5" />
        <span className="hidden lg:inline">Публичная</span>
      </Button>
    </div>
  );
};

export default ObjectInfoBar;
