import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { NotificationGroup } from '@/components/ui/notification-badge';

interface SiteData {
  id: number;
  title: string;
  status: string;
  address?: string;
  worksCount: number;
  completedWorks: number;
  statusMessage?: string;
  statusColor?: string;
  statusIcon?: string;
  unreadMessages?: number;
  unreadLogs?: number;
  unreadInspections?: number;
  hasDelays?: boolean;
}

interface ObjectsMobileListProps {
  sites: SiteData[];
  onSiteClick: (objectId: number) => void;
}

export default function ObjectsMobileList({
  sites,
  onSiteClick,
}: ObjectsMobileListProps) {
  if (sites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center px-4">
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <Icon name="Building2" size={48} className="text-slate-300" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Объекты не найдены</h3>
        <p className="text-slate-600 mb-6">Попробуйте изменить параметры поиска</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-200 bg-white">
      {sites.map((site) => (
        <div
          key={site.id}
          className="p-5 active:bg-slate-50 transition-colors cursor-pointer"
          onClick={() => onSiteClick(site.id)}
        >
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
              <Icon name="Building2" size={26} className="text-white" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-semibold text-lg text-slate-900 leading-snug flex-1">{site.title}</h3>
                {site.hasDelays && (
                  <Badge variant="destructive" className="flex-shrink-0 text-xs">
                    <Icon name="AlertTriangle" size={12} className="mr-1" />
                    Отставание
                  </Badge>
                )}
              </div>
              
              {site.address && (
                <p className="text-sm text-slate-500 mb-3 leading-relaxed">
                  {site.address}
                </p>
              )}
              
              <div className="flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Icon name="Wrench" size={15} />
                  <span className="font-medium">Завершено {site.completedWorks}/{site.worksCount}</span>
                </div>
                <NotificationGroup
                  messages={site.unreadMessages}
                  logs={site.unreadLogs}
                  inspections={site.unreadInspections}
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}