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

interface SiteData {
  id: number;
  title: string;
  status: string;
  address: string;
  worksCount: number;
  completedWorks: number;
  progress: number;
  statusMessage?: string;
  statusColor?: string;
  statusIcon?: string;
  hasDelays?: boolean;
}

interface ObjectsTableViewProps {
  sites: SiteData[];
  isContractor?: boolean;
  onSiteClick: (objectId: number) => void;
  onDeleteSite: (objectId: number, e: React.MouseEvent) => Promise<void>;
}

export default function ObjectsTableView({
  sites,
  isContractor,
  onSiteClick,
  onDeleteSite,
}: ObjectsTableViewProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-slate-700">Объект</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-700">Адрес</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-700">Статус</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-700">Прогресс</th>
                <th className="text-right p-4 text-sm font-semibold text-slate-700">Работы</th>
                {!isContractor && (
                  <th className="text-right p-4 text-sm font-semibold text-slate-700">Действия</th>
                )}
              </tr>
            </thead>
            <tbody>
              {sites.map((site) => (
                <tr
                  key={site.id}
                  className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => onSiteClick(site.id)}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-900">{site.title}</p>
                      {site.hasDelays && (
                        <Badge variant="destructive" className="flex-shrink-0">
                          <Icon name="AlertTriangle" size={12} className="mr-1" />
                          Отставание
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-600">{site.address}</td>
                  <td className="p-4">
                    <Badge className={site.statusColor || 'bg-slate-100 text-slate-700'}>
                      {site.statusIcon} {site.statusMessage || 'Запланировано'}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-slate-100 rounded-full h-2 max-w-[100px]">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${site.progress}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-slate-700 w-12">{site.progress}%</span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <span className="text-sm text-slate-700">
                      {site.completedWorks}/{site.worksCount}
                    </span>
                  </td>
                  {!isContractor && (
                    <td className="p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Icon name="MoreVertical" size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={(e) => onDeleteSite(site.id, e)}
                          >
                            <Icon name="Trash2" size={16} className="mr-2" />
                            Удалить
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}