import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import type { ObjectData } from '@/contexts/AuthContext';

interface ObjectInfoBarProps {
  object: ObjectData;
  className?: string;
  compact?: boolean;
  onBack?: () => void;
  onSettings?: () => void;
}

const ObjectInfoBar = ({ object, className = '', compact = false, onBack, onSettings }: ObjectInfoBarProps) => {
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
      <div className={`w-full bg-white border border-slate-200 rounded-lg p-2.5 flex items-center gap-2.5 ${className}`}>
        {onBack && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBack();
            }}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Icon name="ChevronLeft" size={20} className="text-slate-600" />
          </button>
        )}

        <button
          onClick={handleClick}
          className="flex-1 min-w-0 flex items-center gap-2.5 hover:opacity-80 transition-opacity"
        >
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
      </div>
    );
  }

  return (
    <div className={`w-full bg-gradient-to-b from-white to-slate-50/50 px-6 pt-[18px] pb-[52px] flex items-center gap-4 ${className}`}>
      {onBack ? (
        <button
          onClick={onBack}
          className="flex-shrink-0 w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-xl transition-colors"
        >
          <Icon name="ChevronLeft" size={20} className="text-slate-600" />
        </button>
      ) : (
        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
          <Icon name="Building2" size={18} className="text-white" />
        </div>
      )}

      <button
        onClick={handleClick}
        className="flex-1 min-w-0 hover:opacity-80 transition-opacity text-left"
      >
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-base font-bold text-slate-900 truncate">
            {object.title}
          </h3>
          {object.status && getStatusBadge(object.status)}
        </div>
        {object.address && (
          <div className="flex items-center gap-1.5 text-sm text-slate-600">
            <Icon name="MapPin" size={14} />
            <span className="truncate">{object.address}</span>
          </div>
        )}
      </button>

      {onSettings && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSettings();
          }}
          className="flex-shrink-0 w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-xl transition-colors"
        >
          <Icon name="Settings" size={18} className="text-slate-600" />
        </button>
      )}
    </div>
  );
};

export default ObjectInfoBar;