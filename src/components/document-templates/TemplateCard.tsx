import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { DocumentTemplate } from '@/store/slices/documentTemplatesSlice';

interface TemplateCardProps {
  template: DocumentTemplate;
  variables: string[];
  onClick: () => void;
  getTemplateTypeLabel: (type: string) => string;
}

export function TemplateCard({ template, variables, onClick, getTemplateTypeLabel }: TemplateCardProps) {
  return (
    <Card
      className="hover:shadow-md transition-all cursor-pointer group"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
            <Icon name="FileType" size={24} className="text-blue-600" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-lg text-slate-900">{template.name}</h3>
              <Icon name="ChevronRight" size={20} className="text-slate-400 flex-shrink-0" />
            </div>

            <p className="text-sm text-slate-600 mb-3 line-clamp-2">
              {template.description || 'Описание отсутствует'}
            </p>

            <div className="flex items-center gap-2 mb-3">
              <Badge variant="secondary" className="text-xs">
                {getTemplateTypeLabel(template.template_type)}
              </Badge>
              {template.is_active ? (
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                  Активен
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs">
                  Неактивен
                </Badge>
              )}
            </div>

            {Array.isArray(variables) && variables.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {variables.slice(0, 5).map((variable, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="text-xs bg-slate-50 text-slate-600 font-mono"
                  >
                    {typeof variable === 'string' ? `{{${variable}}}` : ''}
                  </Badge>
                ))}
                {variables.length > 5 && (
                  <Badge variant="outline" className="text-xs bg-slate-50 text-slate-600">
                    +{variables.length - 5}
                  </Badge>
                )}
              </div>
            )}

            <div className="flex items-center gap-4 text-xs text-slate-500 pt-3 border-t">
              {template.updated_at && (
                <div className="flex items-center gap-1">
                  <Icon name="Calendar" size={12} />
                  <span>
                    Обновлён{' '}
                    {(() => {
                      try {
                        const date = new Date(template.updated_at);
                        return isNaN(date.getTime()) ? 'недавно' : format(date, 'd.MM.yyyy', { locale: ru });
                      } catch {
                        return 'недавно';
                      }
                    })()}
                  </span>
                </div>
              )}
              {template.usage_count !== undefined && (
                <div className="flex items-center gap-1">
                  <Icon name="FileText" size={12} />
                  <span>Использован {template.usage_count} раз</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}