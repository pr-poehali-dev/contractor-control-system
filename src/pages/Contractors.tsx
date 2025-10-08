import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

const Contractors = () => {
  const { userData } = useAuth();

  const works = userData?.works || [];

  const contractorsMap = new Map<number, { id: number; name: string; worksCount: number; activeWorks: number }>();

  works.forEach(work => {
    if (work.contractor_id && work.contractor_name) {
      const existing = contractorsMap.get(work.contractor_id);
      if (existing) {
        existing.worksCount++;
        if (work.status === 'active') existing.activeWorks++;
      } else {
        contractorsMap.set(work.contractor_id, {
          id: work.contractor_id,
          name: work.contractor_name,
          worksCount: 1,
          activeWorks: work.status === 'active' ? 1 : 0,
        });
      }
    }
  });

  const contractors = Array.from(contractorsMap.values());

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Подрядчики</h1>
        <p className="text-slate-600">Организации, выполняющие работы по вашим проектам</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Всего подрядчиков</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{contractors.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Активных работ</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">
              {contractors.reduce((sum, c) => sum + c.activeWorks, 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Всего работ</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">
              {contractors.reduce((sum, c) => sum + c.worksCount, 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {contractors.length === 0 ? (
        <Card className="p-12 text-center">
          <Icon name="Users" size={64} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Нет подрядчиков</h3>
          <p className="text-slate-500">Подрядчики появятся после назначения на работы</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contractors.map((contractor, index) => (
            <Card 
              key={contractor.id}
              className="hover:shadow-lg transition-shadow animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="w-14 h-14 flex-shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
                      {getInitials(contractor.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg text-slate-900 mb-2 truncate">
                      {contractor.name}
                    </h3>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Icon name="Wrench" size={16} />
                        <span>{contractor.worksCount} {contractor.worksCount === 1 ? 'работа' : 'работ'}</span>
                      </div>

                      {contractor.activeWorks > 0 && (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            <Icon name="Activity" size={12} className="mr-1" />
                            {contractor.activeWorks} в работе
                          </Badge>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Icon name="Building2" size={14} />
                        <span>Подрядная организация</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Contractors;
