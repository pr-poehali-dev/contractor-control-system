import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { WorkTemplate } from './types';
import WorkTemplateCard from './WorkTemplateCard';

interface WorkTemplateListProps {
  groupedTemplates: Record<string, WorkTemplate[]>;
  isAdmin: boolean;
  onView: (template: WorkTemplate) => void;
  onEdit: (template: WorkTemplate) => void;
  onDelete: (template: WorkTemplate) => void;
}

const getCategoryIcon = (category: string) => {
  if (category.includes('Общестроительные')) return 'Building2';
  if (category.includes('Отделочные') || category.includes('Малярные'))
    return 'Paintbrush';
  if (category.includes('Электромонтажные')) return 'Zap';
  if (category.includes('Сантехнические')) return 'Droplet';
  if (category.includes('Кровельные')) return 'Home';
  if (category.includes('Кладочные')) return 'Layers';
  if (category.includes('Бетонные')) return 'Box';
  return 'Wrench';
};

const WorkTemplateList = ({
  groupedTemplates,
  isAdmin,
  onView,
  onEdit,
  onDelete,
}: WorkTemplateListProps) => {
  return (
    <div className="space-y-6">
      {Object.entries(groupedTemplates).map(([category, items]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Icon
                name={getCategoryIcon(category) as any}
                size={20}
                className="text-blue-600"
              />
              {category}
              <Badge variant="secondary" className="ml-2">
                {items.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map((template) => (
                <WorkTemplateCard
                  key={template.id}
                  template={template}
                  isAdmin={isAdmin}
                  onView={onView}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default WorkTemplateList;
