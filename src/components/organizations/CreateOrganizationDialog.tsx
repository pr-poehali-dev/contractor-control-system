import { useState } from 'react';
import { useAuthRedux } from '@/hooks/useAuthRedux';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createOrganization, selectOrganizationsLoading } from '@/store/slices/organizationsSlice';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';

interface CreateOrganizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function CreateOrganizationDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateOrganizationDialogProps) {
  const { user } = useAuthRedux();
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectOrganizationsLoading);

  const [formData, setFormData] = useState({
    name: '',
    inn: '',
    kpp: '',
    legal_address: '',
    actual_address: '',
    phone: '',
    email: '',
    first_user_phone: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await dispatch(createOrganization(formData));
    
    if (createOrganization.fulfilled.match(result)) {
      setFormData({
        name: '',
        inn: '',
        kpp: '',
        legal_address: '',
        actual_address: '',
        phone: '',
        email: '',
        first_user_phone: '',
      });
      onOpenChange(false);
      onSuccess?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {user?.role === 'admin' ? 'Создать подрядную организацию' : 'Пригласить подрядчика'}
          </DialogTitle>
          <DialogDescription>
            Заполните данные организации и пригласите первого сотрудника
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="name">
                Название организации <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="ООО Стройтех"
                required
              />
            </div>

            <div>
              <Label htmlFor="inn">
                ИНН <span className="text-red-500">*</span>
              </Label>
              <Input
                id="inn"
                value={formData.inn}
                onChange={(e) => setFormData({ ...formData, inn: e.target.value })}
                placeholder="7707123456"
                required
                maxLength={12}
              />
            </div>

            <div>
              <Label htmlFor="kpp">КПП</Label>
              <Input
                id="kpp"
                value={formData.kpp}
                onChange={(e) => setFormData({ ...formData, kpp: e.target.value })}
                placeholder="770701001"
                maxLength={9}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="legal_address">Юридический адрес</Label>
              <Textarea
                id="legal_address"
                value={formData.legal_address}
                onChange={(e) => setFormData({ ...formData, legal_address: e.target.value })}
                placeholder="г. Москва, ул. Ленина, д. 1"
                rows={2}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="actual_address">Фактический адрес</Label>
              <Textarea
                id="actual_address"
                value={formData.actual_address}
                onChange={(e) => setFormData({ ...formData, actual_address: e.target.value })}
                placeholder="г. Москва, ул. Ленина, д. 1"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="phone">Телефон</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+7 (495) 123-45-67"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="info@stroitech.ru"
              />
            </div>
          </div>

          <div className="border-t pt-4 mt-6">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Icon name="UserPlus" size={18} />
              Пригласить первого сотрудника
            </h4>
            <div>
              <Label htmlFor="first_user_phone">
                Мобильный телефон первого сотрудника (станет администратором)
              </Label>
              <Input
                id="first_user_phone"
                type="tel"
                value={formData.first_user_phone}
                onChange={(e) => setFormData({ ...formData, first_user_phone: e.target.value })}
                placeholder="+7 (999) 123-45-67"
              />
              <p className="text-sm text-slate-500 mt-1">
                На этот номер будет отправлено SMS с кодом приглашения. После регистрации этот пользователь получит роль администратора.
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Создание...' : (user?.role === 'admin' ? 'Создать организацию' : 'Пригласить подрядчика')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Отмена
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}