import { useState, useEffect } from 'react';
import { useAuthRedux } from '@/hooks/useAuthRedux';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  fetchOrganizations, 
  selectOrganizations, 
  selectOrganizationsLoading 
} from '@/store/slices/organizationsSlice';
import CreateOrganizationDialog from '@/components/organizations/CreateOrganizationDialog';
import OrganizationDetailDialog from '@/components/organizations/OrganizationDetailDialog';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

const Contractors = () => {
  const { isAuthenticated, user } = useAuthRedux();
  const dispatch = useAppDispatch();
  const allOrganizations = useAppSelector(selectOrganizations);
  const loading = useAppSelector(selectOrganizationsLoading);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);
  
  // Фильтруем только подрядные организации (type = 'contractor')
  const organizations = allOrganizations.filter(org => org.type === 'contractor');

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchOrganizations());
    }
  }, [isAuthenticated, dispatch]);

  const handleCreateSuccess = () => {
    dispatch(fetchOrganizations());
  };

  if (loading && organizations.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto bg-slate-50 w-full">
        <div className="px-3 py-4 md:p-8 lg:p-12 max-w-7xl mx-auto">
          <Skeleton className="h-10 w-64 mb-6" />
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 w-full">
      <div className="px-3 py-4 md:p-8 lg:p-12 max-w-7xl mx-auto">
        <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">
              Подрядные организации
            </h1>
            <p className="text-slate-600">
              Организации, выполняющие работы по вашим проектам
            </p>
          </div>
          
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Icon name={user?.role === 'admin' ? "Building" : "UserPlus"} size={18} className="mr-2" />
            {user?.role === 'admin' ? 'Создать организацию' : 'Пригласить подрядчика'}
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Всего организаций</p>
                  <p className="text-2xl font-bold">{organizations.length}</p>
                </div>
                <Icon name="Building" size={24} className="text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Активных</p>
                  <p className="text-2xl font-bold">
                    {organizations.filter(o => o.status === 'active').length}
                  </p>
                </div>
                <Icon name="CheckCircle" size={24} className="text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Всего работ</p>
                  <p className="text-2xl font-bold">
                    {organizations.reduce((sum, o) => sum + (o.works_count || 0), 0)}
                  </p>
                </div>
                <Icon name="Briefcase" size={24} className="text-amber-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Всего сотрудников</p>
                  <p className="text-2xl font-bold">
                    {organizations.reduce((sum, o) => sum + (o.employees_count || 0), 0)}
                  </p>
                </div>
                <Icon name="Users" size={24} className="text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {organizations.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Icon name="Building" size={64} className="mx-auto mb-4 text-slate-300" />
              <h3 className="text-xl font-semibold mb-2">Нет подрядных организаций</h3>
              <p className="text-slate-500 mb-6">
                {user?.role === 'admin' ? 'Создайте первую организацию для начала работы' : 'Пригласите первого подрядчика для начала работы'}
              </p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Icon name="Plus" size={18} className="mr-2" />
                {user?.role === 'admin' ? 'Создать организацию' : 'Пригласить подрядчика'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {organizations.map((org) => (
              <Card 
                key={org.id} 
                className="hover:shadow-md transition-all cursor-pointer"
                onClick={() => setSelectedOrgId(org.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon name="Building" size={28} className="text-blue-600" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-slate-900">
                              {org.name}
                            </h3>
                            {org.status === 'active' && (
                              <Badge variant="secondary" className="bg-green-100 text-green-700">
                                Активна
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-600">ИНН: {org.inn}</p>
                          {org.kpp && (
                            <p className="text-sm text-slate-600">КПП: {org.kpp}</p>
                          )}
                        </div>

                        <div className="text-right flex-shrink-0">
                          <div className="text-sm text-slate-500">
                            Создана {format(new Date(org.created_at), 'd MMM yyyy', { locale: ru })}
                          </div>
                        </div>
                      </div>

                      {(org.legal_address || org.phone || org.email) && (
                        <div className="space-y-1 mb-3 text-sm text-slate-600">
                          {org.legal_address && (
                            <div className="flex items-start gap-2">
                              <Icon name="MapPin" size={14} className="mt-0.5 flex-shrink-0" />
                              <span>{org.legal_address}</span>
                            </div>
                          )}
                          {org.phone && (
                            <div className="flex items-center gap-2">
                              <Icon name="Phone" size={14} />
                              <span>{org.phone}</span>
                            </div>
                          )}
                          {org.email && (
                            <div className="flex items-center gap-2">
                              <Icon name="Mail" size={14} />
                              <span>{org.email}</span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-6 pt-3 border-t text-sm">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Icon name="Users" size={16} className="text-slate-400" />
                          <span>{org.employees_count || 0} сотрудников</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <Icon name="Briefcase" size={16} className="text-slate-400" />
                          <span>{org.works_count || 0} работ</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <CreateOrganizationDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSuccess={handleCreateSuccess}
        />

        <OrganizationDetailDialog
          organizationId={selectedOrgId}
          open={selectedOrgId !== null}
          onOpenChange={(open) => !open && setSelectedOrgId(null)}
        />
      </div>
    </div>
  );
};

export default Contractors;