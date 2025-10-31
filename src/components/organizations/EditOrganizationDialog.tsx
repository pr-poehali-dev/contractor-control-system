import { useState, useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { updateOrganization } from '@/store/slices/organizationsSlice';
import { Organization } from '@/store/slices/organizationsSlice';
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
import { useToast } from '@/hooks/use-toast';

interface EditOrganizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organization: Organization;
  onSuccess?: () => void;
}

export default function EditOrganizationDialog({
  open,
  onOpenChange,
  organization,
  onSuccess,
}: EditOrganizationDialogProps) {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: organization.name || '',
    inn: organization.inn || '',
    kpp: organization.kpp || '',
    ogrn: organization.ogrn || '',
    legal_address: organization.legal_address || '',
    actual_address: organization.actual_address || '',
    phone: organization.phone || '',
    email: organization.email || '',
    director_name: organization.director_name || '',
    director_position: organization.director_position || '',
    bik: organization.bik || '',
    bank_name: organization.bank_name || '',
    payment_account: organization.payment_account || '',
    correspondent_account: organization.correspondent_account || '',
  });

  useEffect(() => {
    if (open) {
      setFormData({
        name: organization.name || '',
        inn: organization.inn || '',
        kpp: organization.kpp || '',
        ogrn: organization.ogrn || '',
        legal_address: organization.legal_address || '',
        actual_address: organization.actual_address || '',
        phone: organization.phone || '',
        email: organization.email || '',
        director_name: organization.director_name || '',
        director_position: organization.director_position || '',
        bik: organization.bik || '',
        bank_name: organization.bank_name || '',
        payment_account: organization.payment_account || '',
        correspondent_account: organization.correspondent_account || '',
      });
    }
  }, [organization, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await dispatch(updateOrganization({
        id: organization.id,
        ...formData,
      })).unwrap();

      toast({
        title: 'Успешно',
        description: 'Данные организации обновлены',
      });

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить данные организации',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Редактировать организацию</DialogTitle>
          <DialogDescription>
            Обновите реквизиты и контактные данные организации
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Название организации *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="inn">ИНН *</Label>
              <Input
                id="inn"
                value={formData.inn}
                onChange={(e) => setFormData({ ...formData, inn: e.target.value })}
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
                maxLength={9}
              />
            </div>

            <div>
              <Label htmlFor="ogrn">ОГРН</Label>
              <Input
                id="ogrn"
                value={formData.ogrn}
                onChange={(e) => setFormData({ ...formData, ogrn: e.target.value })}
                maxLength={15}
              />
            </div>

            <div>
              <Label htmlFor="phone">Телефон</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+7 (999) 123-45-67"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="legal_address">Юридический адрес</Label>
              <Textarea
                id="legal_address"
                value={formData.legal_address}
                onChange={(e) => setFormData({ ...formData, legal_address: e.target.value })}
                rows={2}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="actual_address">Фактический адрес</Label>
              <Textarea
                id="actual_address"
                value={formData.actual_address}
                onChange={(e) => setFormData({ ...formData, actual_address: e.target.value })}
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="director_name">ФИО директора</Label>
              <Input
                id="director_name"
                value={formData.director_name}
                onChange={(e) => setFormData({ ...formData, director_name: e.target.value })}
                placeholder="Иванов Иван Иванович"
              />
            </div>

            <div>
              <Label htmlFor="director_position">Должность директора</Label>
              <Input
                id="director_position"
                value={formData.director_position}
                onChange={(e) => setFormData({ ...formData, director_position: e.target.value })}
                placeholder="Генеральный директор"
              />
            </div>

            <div>
              <Label htmlFor="bik">БИК</Label>
              <Input
                id="bik"
                value={formData.bik}
                onChange={(e) => setFormData({ ...formData, bik: e.target.value })}
                maxLength={9}
              />
            </div>

            <div>
              <Label htmlFor="bank_name">Название банка</Label>
              <Input
                id="bank_name"
                value={formData.bank_name}
                onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="payment_account">Расчётный счёт</Label>
              <Input
                id="payment_account"
                value={formData.payment_account}
                onChange={(e) => setFormData({ ...formData, payment_account: e.target.value })}
                maxLength={20}
              />
            </div>

            <div>
              <Label htmlFor="correspondent_account">Корреспондентский счёт</Label>
              <Input
                id="correspondent_account"
                value={formData.correspondent_account}
                onChange={(e) => setFormData({ ...formData, correspondent_account: e.target.value })}
                maxLength={20}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
