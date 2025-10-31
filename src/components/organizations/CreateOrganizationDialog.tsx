import { useState } from 'react';
import { toast } from 'sonner';
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
    console.log('🚀 handleSubmit called, preventing default...');
    e.preventDefault();
    e.stopPropagation();
    
    console.log('📤 Submitting organization:', formData);
    
    try {
      const result = await dispatch(createOrganization(formData));
      
      console.log('📥 Organization creation result:', result);
      
      if (createOrganization.fulfilled.match(result)) {
        console.log('✅ Organization created successfully');
        resetForm();
        onOpenChange(false);
        onSuccess?.();
      } else if (createOrganization.rejected.match(result)) {
        const error = result.payload as any;
        
        // Если организация уже существует (409)
        if (error?.existing_organization) {
          const org = error.existing_organization;
          const msg = error.already_linked 
            ? `Организация "${org.name}" (ИНН: ${org.inn}) уже добавлена в ваш список`
            : `Организация "${org.name}" (ИНН: ${org.inn}) уже существует в системе`;
          
          toast.warning(msg, {
            duration: 5000,
          });
          
          resetForm();
          onOpenChange(false);
        } else {
          console.error('❌ Organization creation failed:', result.error);
          toast.error(error?.error || 'Не удалось создать организацию');
        }
      }
    } catch (error) {
      console.error('❌ Exception during organization creation:', error);
      alert('Произошла ошибка при создании организации');
    }
  };

  const resetForm = () => {
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
  };

  return (
    <>
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

        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          <div className="space-y-4">
            <div>
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
              <Label htmlFor="first_user_phone">
                Телефон первого сотрудника <span className="text-red-500">*</span>
              </Label>
              <Input
                id="first_user_phone"
                type="tel"
                value={formData.first_user_phone}
                onChange={(e) => setFormData({ ...formData, first_user_phone: e.target.value })}
                placeholder="+7 (999) 123-45-67"
                required
              />
              <p className="text-sm text-slate-500 mt-1.5">
                На этот номер будет отправлено SMS с кодом приглашения
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