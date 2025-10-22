import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import type { ObjectData } from '@/contexts/AuthContext';

interface ObjectInfoBarProps {
  object: ObjectData;
  className?: string;
  compact?: boolean;
}

const ObjectInfoBar = ({ object, className = '', compact = false }: ObjectInfoBarProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/public/objects/${object.id}`);
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

  if (compact) {
    return (
      <button
        onClick={handleClick}
        className={`w-full bg-white border border-slate-200 rounded-lg p-2.5 flex items-center gap-2.5 hover:border-blue-300 hover:bg-slate-50 active:bg-slate-100 transition-all cursor-pointer text-left ${className}`}
      >
        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
          <Icon name="Building2" size={18} className="text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 truncate">
              {object.title}
            </h3>
            {object.status && getStatusBadge(object.status)}
          </div>
          {object.address && (
            <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
              <Icon name="MapPin" size={12} />
              <span className="truncate">{object.address}</span>
            </div>
          )}
        </div>

        <div className="flex-shrink-0">
          <Icon name="ExternalLink" size={16} className="text-slate-400" />
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`w-full bg-gradient-to-br from-blue-50 to-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer text-left ${className}`}
    >
      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
        <Icon name="Building2" size={20} className="text-white" />
      </div>

      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-base font-bold text-slate-900 truncate">
            {object.title}
          </h3>
          {object.status && getStatusBadge(object.status)}
        </div>
        {object.address && (
          <div className="flex items-center gap-1.5 text-sm text-slate-600 mb-1.5">
            <Icon name="MapPin" size={14} />
            <span className="truncate">{object.address}</span>
          </div>
        )}
        {object.description && (
          <p className="text-xs text-slate-500 line-clamp-2">
            {object.description}
          </p>
        )}
      </div>

      <div className="flex-shrink-0 pt-1">
        <Icon name="ExternalLink" size={16} className="text-slate-400" />
      </div>
    </button>
  );
};

export default ObjectInfoBar;