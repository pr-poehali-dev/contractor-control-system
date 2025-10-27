import { useEffect, useState } from 'react';
import { useAuthRedux } from '@/hooks/useAuthRedux';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchOrganizations,
  fetchOrganizationDetail,
  sendInvite,
  selectOrganizations,
  selectCurrentOrganization,
  selectOrganizationsLoading,
} from '@/store/slices/organizationsSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function OrganizationPage() {
  const { isAuthenticated } = useAuthRedux();
  const dispatch = useAppDispatch();
  const organizations = useAppSelector(selectOrganizations);
  const currentOrg = useAppSelector(selectCurrentOrganization);
  const loading = useAppSelector(selectOrganizationsLoading);
  const user = useAppSelector((state) => state.user.user);
  
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchOrganizations());
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (organizations.length > 0 && !currentOrg) {
      dispatch(fetchOrganizationDetail(organizations[0].id));
    }
  }, [organizations, currentOrg, dispatch]);

  const handleSendInvite = async () => {
    if (!currentOrg || !invitePhone) return;
    
    await dispatch(sendInvite({
      organization_id: currentOrg.id,
      phone: invitePhone,
    }));
    
    setInvitePhone('');
    setInviteDialogOpen(false);
    dispatch(fetchOrganizationDetail(currentOrg.id));
  };

  const isAdmin = currentOrg?.employees?.find(emp => emp.id === user?.id)?.organization_role === 'admin';

  if (loading && !currentOrg) {
    return (
      <div className="flex-1 overflow-y-auto bg-slate-50 w-full">
        <div className="px-3 py-4 md:p-8 lg:p-12 max-w-7xl mx-auto">
          <Skeleton className="h-10 w-64 mb-6" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!currentOrg) {
    return (
      <div className="flex-1 overflow-y-auto bg-slate-50 w-full">
        <div className="px-3 py-4 md:p-8 lg:p-12 max-w-7xl mx-auto">
          <Card>
            <CardContent className="p-12 text-center">
              <Icon name="Building" size={64} className="mx-auto mb-4 text-slate-300" />
              <h3 className="text-xl font-semibold mb-2">Организация не найдена</h3>
              <p className="text-slate-500 mb-6">
                Вы не привязаны ни к одной организации
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 w-full">
      <div className="px-3 py-4 md:p-8 lg:p-12 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Моя организация</h1>
            <p className="text-slate-500 mt-1">{currentOrg.name}</p>
          </div>
          
          {isAdmin && (
            <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Icon name="UserPlus" size={18} className="mr-2" />
                  Пригласить сотрудника
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Пригласить сотрудника</DialogTitle>
                  <DialogDescription>
                    На указанный номер будет отправлено SMS с кодом приглашения
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="invite-phone">Мобильный телефон сотрудника</Label>
                    <Input
                      id="invite-phone"
                      type="tel"
                      placeholder="+7 (999) 123-45-67"
                      value={invitePhone}
                      onChange={(e) => setInvitePhone(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleSendInvite} className="w-full">
                    Отправить приглашение
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Сотрудников</p>
                  <p className="text-3xl font-bold">{currentOrg.employees?.length || 0}</p>
                </div>
                <Icon name="Users" size={32} className="text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Активных работ</p>
                  <p className="text-3xl font-bold">{currentOrg.works_count || 0}</p>
                </div>
                <Icon name="Briefcase" size={32} className="text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Ожидают приглашения</p>
                  <p className="text-3xl font-bold">{currentOrg.pending_invites?.length || 0}</p>
                </div>
                <Icon name="Mail" size={32} className="text-amber-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Информация об организации</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-slate-500">ИНН</Label>
                <p className="font-medium">{currentOrg.inn}</p>
              </div>
              
              {currentOrg.kpp && (
                <div>
                  <Label className="text-slate-500">КПП</Label>
                  <p className="font-medium">{currentOrg.kpp}</p>
                </div>
              )}
              
              {currentOrg.legal_address && (
                <div>
                  <Label className="text-slate-500">Юридический адрес</Label>
                  <p className="font-medium">{currentOrg.legal_address}</p>
                </div>
              )}
              
              {currentOrg.actual_address && (
                <div>
                  <Label className="text-slate-500">Фактический адрес</Label>
                  <p className="font-medium">{currentOrg.actual_address}</p>
                </div>
              )}
              
              {currentOrg.phone && (
                <div>
                  <Label className="text-slate-500">Телефон</Label>
                  <p className="font-medium">{currentOrg.phone}</p>
                </div>
              )}
              
              {currentOrg.email && (
                <div>
                  <Label className="text-slate-500">Email</Label>
                  <p className="font-medium">{currentOrg.email}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Сотрудники</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentOrg.employees?.map((employee) => (
                  <div
                    key={employee.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {employee.name?.charAt(0) || 'У'}
                      </div>
                      <div>
                        <p className="font-medium">{employee.name}</p>
                        <p className="text-sm text-slate-500">{employee.email}</p>
                      </div>
                    </div>
                    
                    {employee.organization_role === 'admin' && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                        Администратор
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {currentOrg.pending_invites && currentOrg.pending_invites.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Отправленные приглашения</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentOrg.pending_invites.map((invite) => (
                  <div
                    key={invite.id}
                    className="flex items-center justify-between p-3 bg-amber-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{invite.phone}</p>
                      <p className="text-sm text-slate-500">
                        Отправлено {format(new Date(invite.created_at), 'dd MMMM yyyy', { locale: ru })}
                      </p>
                    </div>
                    
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded">
                      Ожидает принятия
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}