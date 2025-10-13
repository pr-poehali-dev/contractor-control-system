import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface SiteData {
  id: number;
  title: string;
  status: string;
  projectName: string;
  worksCount: number;
  completedWorks: number;
}

interface ObjectsMobileListProps {
  sites: SiteData[];
  onSiteClick: (site: SiteData) => void;
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
    <div className="divide-y divide-slate-100">
      {sites.map((site) => (
        <div
          key={site.id}
          className="p-4 active:bg-slate-50 transition-colors"
          onClick={() => onSiteClick(site)}
        >
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-16 h-16 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center">
              <Icon name="Building2" size={28} className="text-slate-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base text-slate-900 mb-1">{site.title}</h3>
              <p className="text-sm text-slate-500 mb-2">
                {site.projectName}
              </p>
              <div className="flex items-center gap-2 text-xs">
                <Badge className={
                  site.status === 'active' ? 'bg-yellow-100 text-yellow-700' :
                  site.status === 'pending' ? 'bg-blue-100 text-blue-700' :
                  'bg-green-100 text-green-700'
                }>
                  {site.status === 'active' ? 'Запланировано' : 
                   site.status === 'pending' ? 'Требуется проверка' : 
                   'Завершено'}
                </Badge>
                <span className="text-slate-400">{site.completedWorks}/{site.worksCount}</span>
              </div>
            </div>
            <div className="flex-shrink-0 text-right">
              <div className="text-xs text-slate-400 mb-1">2 часа назад</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
