import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { DocumentTemplate } from '@/store/slices/documentTemplatesSlice';
import { TemplateCard } from './TemplateCard';

interface TemplatesListProps {
  systemTemplates: DocumentTemplate[];
  userTemplates: DocumentTemplate[];
  extractVariables: (content: any) => string[];
  getTemplateTypeLabel: (type: string) => string;
  onTemplateClick: (id: number) => void;
}

export function TemplatesList({
  systemTemplates,
  userTemplates,
  extractVariables,
  getTemplateTypeLabel,
  onTemplateClick,
}: TemplatesListProps) {
  return (
    <div className="space-y-8">
      {systemTemplates.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Icon name="Shield" size={20} className="text-blue-600" />
            <h2 className="text-lg font-semibold text-slate-900">Системные шаблоны</h2>
            <Badge variant="secondary" className="text-xs">
              {systemTemplates.length}
            </Badge>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
            {systemTemplates.map((template) => {
              const variables = extractVariables(template.content);
              return (
                <TemplateCard
                  key={template.id}
                  template={template}
                  variables={variables}
                  onClick={() => onTemplateClick(template.id)}
                  getTemplateTypeLabel={getTemplateTypeLabel}
                />
              );
            })}
          </div>
        </div>
      )}

      {userTemplates.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Icon name="User" size={20} className="text-slate-600" />
            <h2 className="text-lg font-semibold text-slate-900">Пользовательские шаблоны</h2>
            <Badge variant="secondary" className="text-xs">
              {userTemplates.length}
            </Badge>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
            {userTemplates.map((template) => {
              const variables = extractVariables(template.content);
              return (
                <TemplateCard
                  key={template.id}
                  template={template}
                  variables={variables}
                  onClick={() => onTemplateClick(template.id)}
                  getTemplateTypeLabel={getTemplateTypeLabel}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
