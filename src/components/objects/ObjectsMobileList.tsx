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
          className="p-4 active:bg-slate-50 transition-colors cursor-pointer"
          onClick={() => onSiteClick(site.id)}
        >
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
              <Icon name="Building2" size={24} className="text-white" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <h3 className="font-semibold text-base text-slate-900 line-clamp-1">{site.title}</h3>
                <span className="flex-shrink-0 text-xs text-slate-400 whitespace-nowrap">2 ч назад</span>
              </div>
              
              {site.address && (
                <p className="text-sm text-slate-500 mb-2.5 line-clamp-1">
                  {site.address}
                </p>
              )}
              
              <div className="flex items-center gap-2 mb-2.5">
                <Badge 
                  className={`${site.statusColor || 'bg-slate-100 text-slate-700'} text-xs px-2 py-0.5 font-medium`}
                >
                  {site.statusIcon && <span className="mr-1">{site.statusIcon}</span>}
                  {site.statusMessage || 'Запланировано'}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Icon name="ClipboardList" size={14} />
                  <span className="font-medium">{site.completedWorks}/{site.worksCount}</span>
                </div>
              </div>
              
              <NotificationGroup
                messages={site.unreadMessages}
                logs={site.unreadLogs}
                inspections={site.unreadInspections}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}