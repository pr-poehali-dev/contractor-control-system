import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface Stats {
  clients_count: number;
  contractors_count: number;
  total_users: number;
  projects_count: number;
  objects_count: number;
  works_count: number;
  new_users_week: number;
}

interface AdminStatsProps {
  stats: Stats | null;
  loading: boolean;
}

export default function AdminStats({ stats, loading }: AdminStatsProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Icon name="Loader2" size={48} className="animate-spin text-slate-400" />
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium text-slate-600">Всего пользователей</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-bold text-slate-900">{stats.total_users}</p>
              <Badge variant="secondary" className="text-xs">
                +{stats.new_users_week} за неделю
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium text-slate-600">Заказчики</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-blue-600">{stats.clients_count}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium text-slate-600">Подрядчики</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-green-600">{stats.contractors_count}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium text-slate-600">Проекты</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-slate-900">{stats.projects_count}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium text-slate-600">Объекты</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-slate-900">{stats.objects_count}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium text-slate-600">Работы</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-slate-900">{stats.works_count}</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
