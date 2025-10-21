import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { NotificationGroup } from '@/components/ui/notification-badge';
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
  worksCount: number;
  completedWorks: number;
  progress: number;
  works: Work[];
  statusMessage?: string;
  statusColor?: string;
  statusIcon?: string;
  unreadMessages?: number;
  unreadLogs?: number;
  unreadInspections?: number;
}

interface ObjectsGridViewProps {
  sites: SiteData[];
  isContractor?: boolean;
  onSiteClick: (objectId: number) => void;
  onDeleteSite: (objectId: number, e: React.MouseEvent) => Promise<void>;
}

export default function ObjectsGridView({
  sites,
  isContractor,
  onSiteClick,
  onDeleteSite,
}: ObjectsGridViewProps) {
  const handleDelete = (siteId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteSite(siteId, e);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sites.map((site, index) => (
        <Card
          key={site.id}
          className="cursor-pointer hover:shadow-xl transition-all animate-fade-in group border-2 border-transparent hover:border-blue-200"
          style={{ animationDelay: `${index * 0.05}s` }}
          onClick={() => onSiteClick(site.id)}
        >
          <CardContent className="p-6">
            <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition-colors mb-4">
              {site.title}
            </h3>

            <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
              <Icon name="MapPin" size={16} />
              <span className="truncate">{site.address}</span>
            </div>
            
            <NotificationGroup
              messages={site.unreadMessages}
              logs={!isContractor ? site.unreadLogs : undefined}
              inspections={isContractor ? site.unreadInspections : undefined}
              className="mb-4"
            />

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

            <div className="flex items-center justify-between gap-2 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-sm text-slate-600">
                <Icon name="Wrench" size={16} />
                <span>Завершено {site.completedWorks}/{site.worksCount}</span>
              </div>
              <Badge className={site.statusColor || 'bg-slate-100 text-slate-700'}>
                {site.statusIcon} {site.statusMessage || 'Запланировано'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}