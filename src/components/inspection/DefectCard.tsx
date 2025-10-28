import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { Defect } from './DefectsSection';

interface DefectCardProps {
  defect: Defect;
  index: number;
  isDraft: boolean;
  isClient: boolean;
  isCompleted?: boolean;
  onRemove: (id: string) => void;
  onRemediate?: (defectId: string) => void;
}

export function DefectCard({ defect, index, isDraft, isClient, isCompleted, onRemove, onRemediate }: DefectCardProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getSeverityConfig = (severity?: string) => {
    switch (severity) {
      case 'critical':
        return {
          label: 'Критическая',
          className: 'bg-red-100 text-red-700 border-red-200'
        };
      case 'high':
        return {
          label: 'Высокая',
          className: 'bg-orange-100 text-orange-700 border-orange-200'
        };
      case 'medium':
        return {
          label: 'Средняя',
          className: 'bg-amber-100 text-amber-700 border-amber-200'
        };
      case 'low':
        return {
          label: 'Низкая',
          className: 'bg-green-100 text-green-700 border-green-200'
        };
      default:
        return {
          label: 'Не указана',
          className: 'bg-slate-100 text-slate-700 border-slate-200'
        };
    }
  };

  const severityConfig = defect.severity ? getSeverityConfig(defect.severity) : null;

  const formatDate = (date?: string) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <Card className="relative">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 rounded-l-lg" />
      
      <CardContent className="p-3 md:p-4">
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-start gap-2 md:gap-3 w-full text-left hover:opacity-70 transition-opacity min-w-0"
        >
          <Icon 
            name={isCollapsed ? "ChevronRight" : "ChevronDown"} 
            size={20} 
            className="text-slate-500 flex-shrink-0 mt-0.5"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <h4 className="text-sm md:text-base font-semibold leading-tight">
                Замечание №{index + 1}
              </h4>
              {severityConfig && (
                <Badge variant="outline" className={cn("text-[10px] md:text-xs px-1.5 py-0", severityConfig.className)}>
                  {severityConfig.label}
                </Badge>
              )}
            </div>
            <p className="text-xs md:text-sm text-slate-700 line-clamp-2">
              {defect.description}
            </p>
            {isCollapsed && defect.location && (
              <p className="text-xs text-slate-500 mt-1">
                {defect.location}
              </p>
            )}
          </div>
        </button>

        {!isCollapsed && (
          <>
            {(defect.location || defect.responsible || defect.deadline) && (
              <div className="space-y-2 pl-8 mt-3 text-xs md:text-sm">
                {defect.location && (
                  <div className="flex items-start gap-2">
                    <Icon name="MapPin" size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-slate-500">Местоположение:</span>
                      <span className="text-slate-900 ml-1">{defect.location}</span>
                    </div>
                  </div>
                )}
                {defect.responsible && (
                  <div className="flex items-start gap-2">
                    <Icon name="User" size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-slate-500">Ответственный:</span>
                      <span className="text-slate-900 ml-1">{defect.responsible}</span>
                    </div>
                  </div>
                )}
                {defect.deadline && (
                  <div className="flex items-start gap-2">
                    <Icon name="Calendar" size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-slate-500">Срок устранения:</span>
                      <span className="text-slate-900 ml-1">{formatDate(defect.deadline)}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {defect.photo_urls && defect.photo_urls.length > 0 && (
              <div className="mt-3 pl-8">
                <p className="text-xs text-slate-500 mb-2">Фотофиксация:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {defect.photo_urls.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt={`Фото ${idx + 1}`}
                      className="w-full h-20 object-cover rounded-lg border border-slate-200"
                    />
                  ))}
                </div>
              </div>
            )}

            {isDraft && isClient && (
              <div className="flex items-center gap-2 pl-8 mt-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => onRemove(defect.id)}
                  title="Удалить"
                >
                  <Icon name="Trash2" size={14} className="mr-1" />
                  Удалить
                </Button>
              </div>
            )}

            {isCompleted && !isClient && onRemediate && (
              <div className="flex items-center gap-2 pl-8 mt-3">
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  className="h-8 text-xs bg-green-600 hover:bg-green-700"
                  onClick={() => onRemediate(defect.id)}
                >
                  <Icon name="CheckCircle2" size={14} className="mr-1" />
                  Заявить об устранении
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}