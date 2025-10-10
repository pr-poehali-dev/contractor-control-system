import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { WorkTemplate } from './types';

interface WorkTemplateCardProps {
  template: WorkTemplate;
  isAdmin: boolean;
  onView: (template: WorkTemplate) => void;
  onEdit: (template: WorkTemplate) => void;
  onDelete: (template: WorkTemplate) => void;
}

const WorkTemplateCard = ({
  template,
  isAdmin,
  onView,
  onEdit,
  onDelete,
}: WorkTemplateCardProps) => {
  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-all border-2 border-transparent hover:border-blue-200"
      onClick={() => onView(template)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-semibold text-slate-900">{template.title}</h3>
              {template.code && (
                <Badge variant="outline" className="text-xs">
                  {template.code}
                </Badge>
              )}
            </div>
            {template.description && (
              <p className="text-sm text-slate-600 line-clamp-2 mb-2">
                {template.description}
              </p>
            )}
            {template.normative_ref && (
              <p className="text-xs text-slate-500 mb-2">
                📋 {template.normative_ref}
              </p>
            )}
          </div>
          {isAdmin && (
            <div
              className="flex gap-1 ml-2"
              onClick={(e) => e.stopPropagation()}
            >
              <Button variant="ghost" size="sm" onClick={() => onEdit(template)}>
                <Icon name="Pencil" size={16} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(template)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Icon name="Trash2" size={16} />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkTemplateCard;