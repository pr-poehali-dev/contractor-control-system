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
import EditOrganizationDialog from '@/components/organizations/EditOrganizationDialog';

export default function OrganizationPage() {
  const { isAuthenticated } = useAuthRedux();
  const dispatch = useAppDispatch();
  const organizations = useAppSelector(selectOrganizations);
  const currentOrg = useAppSelector(selectCurrentOrganization);
  const loading = useAppSelector(selectOrganizationsLoading);
  const user = useAppSelector((state) => state.user.user);
  
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.organization_id) {
      dispatch(fetchOrganizationDetail(user.organization_id));
    }
  }, [dispatch, isAuthenticated, user?.organization_id]);

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
    <div className="flex-1 overflow-y-auto bg-slate-50 w-full pb-20 md:pb-0">
      <div className="px-3 py-4 md:p-8 lg:p-12 max-w-7xl mx-auto">
        <div className="mb-4 md:mb-8">
          <div className="flex items-start justify-between mb-4 gap-2">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold truncate">Моя организация</h1>
              <p className="text-slate-500 mt-1 text-sm md:text-base truncate">{currentOrg.name}</p>
            </div>
            {isAdmin && (
              <Button variant="outline" onClick={() => setEditDialogOpen(true)}>
                <Icon name="Pencil" size={18} className="mr-2" />
                <span className="hidden md:inline">Редактировать</span>
              </Button>
            )}
          </div>
          
          {isAdmin && (
            <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full md:w-auto">
                  <Icon name="UserPlus" size={18} className="mr-2" />
                  <span className="hidden md:inline">Пригласить сотрудника</span>
                  <span className="md:hidden">Пригласить</span>
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

        <div className="grid grid-cols-3 gap-2 md:gap-4 mb-4 md:mb-6">
          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="text-center">
                <p className="text-xs text-slate-500 mb-1">Активных сотрудников</p>
                <p className="text-xl md:text-2xl font-bold">{currentOrg.employees?.length || 0}</p>
                <Icon name="Users" size={20} className="text-blue-500 mx-auto mt-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="text-center">
                <p className="text-xs text-slate-500 mb-1">Активных работ</p>
                <p className="text-xl md:text-2xl font-bold">{currentOrg.works_count || 0}</p>
                <Icon name="Briefcase" size={20} className="text-green-500 mx-auto mt-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="text-center">
                <p className="text-xs text-slate-500 mb-1">Ожидают приглашения</p>
                <p className="text-xl md:text-2xl font-bold">{currentOrg.pending_invites?.length || 0}</p>
                <Icon name="Mail" size={20} className="text-amber-500 mx-auto mt-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg md:text-xl">Информация об организации</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 md:space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <Label className="text-xs md:text-sm text-slate-500">ИНН</Label>
                  <p className="font-medium text-sm md:text-base break-all">{currentOrg.inn || '—'}</p>
                </div>
                
                <div>
                  <Label className="text-xs md:text-sm text-slate-500">КПП</Label>
                  <p className="font-medium text-sm md:text-base break-all">{currentOrg.kpp || '—'}</p>
                </div>
                
                <div>
                  <Label className="text-xs md:text-sm text-slate-500">ОГРН</Label>
                  <p className="font-medium text-sm md:text-base break-all">{(currentOrg as any).ogrn || '—'}</p>
                </div>
                
                <div>
                  <Label className="text-xs md:text-sm text-slate-500">Телефон</Label>
                  <p className="font-medium text-sm md:text-base">{currentOrg.phone || '—'}</p>
                </div>
                
                <div className="md:col-span-2">
                  <Label className="text-xs md:text-sm text-slate-500">Email</Label>
                  <p className="font-medium text-sm md:text-base break-all">{currentOrg.email || '—'}</p>
                </div>
                
                <div className="md:col-span-2">
                  <Label className="text-xs md:text-sm text-slate-500">Юридический адрес</Label>
                  <p className="font-medium text-sm md:text-base break-words">{currentOrg.legal_address || '—'}</p>
                </div>
                
                <div className="md:col-span-2">
                  <Label className="text-xs md:text-sm text-slate-500">Фактический адрес</Label>
                  <p className="font-medium text-sm md:text-base break-words">{currentOrg.actual_address || '—'}</p>
                </div>
                
                <div>
                  <Label className="text-xs md:text-sm text-slate-500">Директор (ФИО)</Label>
                  <p className="font-medium text-sm md:text-base">{(currentOrg as any).director_name || '—'}</p>
                </div>
                
                <div>
                  <Label className="text-xs md:text-sm text-slate-500">Должность директора</Label>
                  <p className="font-medium text-sm md:text-base">{(currentOrg as any).director_position || '—'}</p>
                </div>
                
                <div>
                  <Label className="text-xs md:text-sm text-slate-500">БИК</Label>
                  <p className="font-medium text-sm md:text-base">{(currentOrg as any).bik || '—'}</p>
                </div>
                
                <div>
                  <Label className="text-xs md:text-sm text-slate-500">Название банка</Label>
                  <p className="font-medium text-sm md:text-base">{(currentOrg as any).bank_name || '—'}</p>
                </div>
                
                <div>
                  <Label className="text-xs md:text-sm text-slate-500">Расчётный счёт</Label>
                  <p className="font-medium text-sm md:text-base break-all">{(currentOrg as any).payment_account || '—'}</p>
                </div>
                
                <div>
                  <Label className="text-xs md:text-sm text-slate-500">Корреспондентский счёт</Label>
                  <p className="font-medium text-sm md:text-base break-all">{(currentOrg as any).correspondent_account || '—'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg md:text-xl">Сотрудники</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 md:space-y-3">
                {currentOrg.employees?.map((employee) => (
                  <div
                    key={employee.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                  >
                    <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 flex-shrink-0 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {employee.name?.charAt(0) || 'У'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm md:text-base truncate">{employee.name}</p>
                        <p className="text-xs md:text-sm text-slate-500 truncate">{employee.email}</p>
                      </div>
                    </div>
                    
                    {employee.organization_role === 'admin' && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded whitespace-nowrap ml-2">
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
          <Card className="mt-4 md:mt-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg md:text-xl">Отправленные приглашения</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 md:space-y-3">
                {currentOrg.pending_invites.map((invite) => (
                  <div
                    key={invite.id}
                    className="flex items-center justify-between p-3 bg-amber-50 rounded-lg gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm md:text-base break-all">{invite.phone}</p>
                      <p className="text-xs md:text-sm text-slate-500">
                        Отправлено {format(new Date(invite.created_at), 'dd MMMM yyyy', { locale: ru })}
                      </p>
                    </div>
                    
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded whitespace-nowrap">
                      Ожидает
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      {currentOrg && (
        <EditOrganizationDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          organization={currentOrg}
          onSuccess={() => {
            if (currentOrg.id) {
              dispatch(fetchOrganizationDetail(currentOrg.id));
            }
          }}
        />
      )}
    </div>
  );
}