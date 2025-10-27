import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchOrganizationDetail,
  selectCurrentOrganization,
  selectOrganizationsLoading,
} from '@/store/slices/organizationsSlice';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Icon from '@/components/ui/icon';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface OrganizationDetailDialogProps {
  organizationId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function OrganizationDetailDialog({
  organizationId,
  open,
  onOpenChange,
}: OrganizationDetailDialogProps) {
  const dispatch = useAppDispatch();
  const organization = useAppSelector(selectCurrentOrganization);
  const loading = useAppSelector(selectOrganizationsLoading);

  useEffect(() => {
    if (open && organizationId) {
      dispatch(fetchOrganizationDetail(organizationId));
    }
  }, [open, organizationId, dispatch]);

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Icon name="Building" size={24} className="text-blue-600" />
            </div>
            {loading ? <Skeleton className="h-7 w-64" /> : organization?.name}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : organization ? (
          <div className="space-y-6 py-4">
            {/* Основная информация */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Icon name="FileText" size={18} />
                  Основная информация
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500">ИНН</p>
                    <p className="font-medium">{organization.inn}</p>
                  </div>
                  {organization.kpp && (
                    <div>
                      <p className="text-sm text-slate-500">КПП</p>
                      <p className="font-medium">{organization.kpp}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-slate-500">Статус</p>
                    <Badge
                      variant="secondary"
                      className={
                        organization.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-slate-100 text-slate-700'
                      }
                    >
                      {organization.status === 'active' ? 'Активна' : 'Неактивна'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Создана</p>
                    <p className="font-medium">
                      {format(new Date(organization.created_at), 'd MMMM yyyy', { locale: ru })}
                    </p>
                  </div>
                </div>

                {organization.legal_address && (
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Юридический адрес</p>
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={16} className="mt-0.5 text-slate-400" />
                      <p className="font-medium">{organization.legal_address}</p>
                    </div>
                  </div>
                )}

                {organization.actual_address && (
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Фактический адрес</p>
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={16} className="mt-0.5 text-slate-400" />
                      <p className="font-medium">{organization.actual_address}</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {organization.phone && (
                    <div>
                      <p className="text-sm text-slate-500">Телефон</p>
                      <div className="flex items-center gap-2">
                        <Icon name="Phone" size={16} className="text-slate-400" />
                        <p className="font-medium">{organization.phone}</p>
                      </div>
                    </div>
                  )}
                  {organization.email && (
                    <div>
                      <p className="text-sm text-slate-500">Email</p>
                      <div className="flex items-center gap-2">
                        <Icon name="Mail" size={16} className="text-slate-400" />
                        <p className="font-medium">{organization.email}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Сотрудники */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Icon name="Users" size={18} />
                  Сотрудники ({organization.employees?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!organization.employees || organization.employees.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Icon name="Users" size={48} className="mx-auto mb-2 text-slate-300" />
                    <p>Нет сотрудников</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {organization.employees.map((employee) => (
                      <div
                        key={employee.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                      >
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Icon name="User" size={20} className="text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{employee.name}</p>
                            {employee.organization_role === 'admin' && (
                              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                                Администратор
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-600">
                            {employee.email && (
                              <span className="flex items-center gap-1">
                                <Icon name="Mail" size={14} />
                                {employee.email}
                              </span>
                            )}
                            {employee.phone && (
                              <span className="flex items-center gap-1">
                                <Icon name="Phone" size={14} />
                                {employee.phone}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-slate-400">
                          {format(new Date(employee.created_at), 'd MMM yyyy', { locale: ru })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {organization.pending_invites && organization.pending_invites.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm font-medium text-slate-700 mb-2">
                      Ожидают приглашения ({organization.pending_invites.length})
                    </p>
                    <div className="space-y-2">
                      {organization.pending_invites.map((invite) => (
                        <div
                          key={invite.id}
                          className="flex items-center gap-2 p-2 rounded bg-amber-50 text-sm"
                        >
                          <Icon name="Clock" size={16} className="text-amber-600" />
                          <span className="flex-1">{invite.email}</span>
                          <span className="text-xs text-slate-500">
                            до {format(new Date(invite.expires_at), 'd MMM', { locale: ru })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Работы */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Icon name="Briefcase" size={18} />
                  Работы на объектах ({organization.works?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!organization.works || organization.works.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Icon name="Briefcase" size={48} className="mx-auto mb-2 text-slate-300" />
                    <p>Нет работ</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {organization.works.map((work) => (
                      <div
                        key={work.id}
                        className="p-4 rounded-lg border bg-white hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-slate-900 mb-1">{work.name}</h4>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Icon name="Building2" size={14} />
                              <span>{work.object_name}</span>
                            </div>
                            {work.object_address && (
                              <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                                <Icon name="MapPin" size={14} />
                                <span>{work.object_address}</span>
                              </div>
                            )}
                          </div>
                          <Badge
                            variant="secondary"
                            className={
                              work.status === 'completed'
                                ? 'bg-green-100 text-green-700'
                                : work.status === 'in_progress'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-slate-100 text-slate-700'
                            }
                          >
                            {work.status === 'completed'
                              ? 'Завершена'
                              : work.status === 'in_progress'
                              ? 'В работе'
                              : work.status === 'planned'
                              ? 'Запланирована'
                              : work.status}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          {work.progress !== undefined && work.progress !== null && (
                            <div className="flex items-center gap-2">
                              <Icon name="TrendingUp" size={14} />
                              <span>{work.progress}%</span>
                            </div>
                          )}
                          {work.start_date && (
                            <div className="flex items-center gap-2">
                              <Icon name="Calendar" size={14} />
                              <span>
                                {format(new Date(work.start_date), 'd MMM yyyy', { locale: ru })}
                              </span>
                            </div>
                          )}
                          {work.end_date && (
                            <div className="flex items-center gap-2">
                              <Icon name="CalendarCheck" size={14} />
                              <span>
                                {format(new Date(work.end_date), 'd MMM yyyy', { locale: ru })}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}