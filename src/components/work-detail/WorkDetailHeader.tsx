import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import type { Work, Site, Project } from '@/lib/api';

interface WorkDetailHeaderProps {
  work: Work;
  site: Site | undefined;
  project: Project | undefined;
  onBack: () => void;
  onEdit: () => void;
  getStatusLabel: (status: string) => string;
  getStatusColor: (status: string) => string;
  userRole: string;
}

export default function WorkDetailHeader({
  work,
  site,
  project,
  onBack,
  onEdit,
  getStatusLabel,
  getStatusColor,
  userRole,
}: WorkDetailHeaderProps) {
  console.log('=== WorkDetailHeader ===');
  console.log('userRole:', userRole);
  console.log('Should show button:', userRole === 'client');
  console.log('========================');
  
  return (
    <div className="bg-white border-b border-slate-200 px-4 md:px-6 py-3 md:py-4 flex-shrink-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <Button 
            variant="ghost" 
            size="icon"
            className="flex-shrink-0 mt-1 md:hidden"
            onClick={onBack}
          >
            <Icon name="ChevronLeft" size={24} />
          </Button>
          
          <div className="min-w-0 flex-1">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 mb-1">{work.title}</h1>
            <p className="text-xs md:text-sm text-slate-500 mb-2">
              <Icon name="MapPin" size={14} className="inline mr-1" />
              {site?.title} • {project?.title}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={getStatusColor(work.status)}>
                {getStatusLabel(work.status)}
              </Badge>
              {work.contractor_name && (
                <span className="text-xs md:text-sm text-slate-600 flex items-center gap-1">
                  <Icon name="User" size={14} />
                  {work.contractor_name}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {userRole === 'client' && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={onEdit}
          >
            <Icon name="Edit" size={16} className="mr-1" />
            Редактировать
          </Button>
        )}
      </div>
    </div>
  );
}