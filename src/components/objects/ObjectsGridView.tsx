import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const statusLabels = {
  active: 'В работе',
  pending: 'Ожидание',
  completed: 'Завершено',
};

interface Work {
  contractor_name?: string;
}

interface SiteData {
  id: number;
  title: string;
  status: string;
  address: string;
  projectName: string;
  worksCount: number;
  completedWorks: number;
  progress: number;
  works: Work[];
}

interface ObjectsGridViewProps {
  sites: SiteData[];
  userRole?: string;
  onSiteClick: (site: SiteData) => void;
  onDeleteObject: (objectId: number, e: React.MouseEvent) => Promise<void>;
}

export default function ObjectsGridView({
  sites,
  userRole,
  onSiteClick,
  onDeleteObject,
}: ObjectsGridViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sites.map((site, index) => (
        <Card
          key={site.id}
          className="cursor-pointer hover:shadow-xl transition-all animate-fade-in group border-2 border-transparent hover:border-blue-200"
          style={{ animationDelay: `${index * 0.05}s` }}
          onClick={() => onSiteClick(site)}
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-2 mb-4">
              <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition-colors flex-1">
                {site.title}
              </h3>
              <div className="flex items-center gap-2">
                <Badge className={
                  site.status === 'active' ? 'bg-green-100 text-green-700' :
                  site.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-slate-100 text-slate-700'
                }>
                  {statusLabels[site.status as keyof typeof statusLabels]}
                </Badge>
                {(userRole === 'client' || userRole === 'admin') && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Icon name="MoreVertical" size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={(e) => onDeleteObject(site.id, e)}
                      >
                        <Icon name="Trash2" size={16} className="mr-2" />
                        Удалить
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
              <Icon name="MapPin" size={16} />
              <span className="truncate">{site.address}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
              <Icon name="Folder" size={16} />
              <span className="truncate">{site.projectName}</span>
            </div>

            {userRole === 'client' && site.works[0]?.contractor_name && (
              <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                <Icon name="User" size={16} />
                <span>{site.works[0].contractor_name}</span>
              </div>
            )}

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Прогресс</span>
                <span className="font-bold text-blue-600">{site.progress}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${site.progress}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-slate-600 pt-4 border-t border-slate-100">
              <span className="flex items-center gap-1.5">
                <Icon name="Wrench" size={16} />
                {site.worksCount} работ
              </span>
              <span className="flex items-center gap-1.5">
                <Icon name="CheckCircle2" size={16} />
                {site.completedWorks} завершено
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
