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
import Icon from '@/components/ui/icon';

interface AdminUser {
  id: number;
  phone: string;
  email?: string;
  name: string;
  role: string;
  organization?: string;
  created_at: string;
  projects_count: number;
  works_count: number;
}

interface EditData {
  name: string;
  email: string;
  phone: string;
  organization: string;
}

interface EditUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingUser: AdminUser | null;
  editData: EditData;
  onEditDataChange: (data: EditData) => void;
  onSave: () => void;
  onResetPassword: () => void;
  newPassword: string;
}

export const EditUserDialog = ({
  isOpen,
  onOpenChange,
  editingUser,
  editData,
  onEditDataChange,
  onSave,
  onResetPassword,
  newPassword,
}: EditUserDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Редактировать пользователя</DialogTitle>
          <DialogDescription>
            Изменение данных пользователя {editingUser?.name}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Имя</Label>
            <Input
              id="edit-name"
              value={editData.name}
              onChange={(e) => onEditDataChange({ ...editData, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-email">Email</Label>
            <Input
              id="edit-email"
              type="email"
              value={editData.email}
              onChange={(e) => onEditDataChange({ ...editData, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-phone">Телефон</Label>
            <Input
              id="edit-phone"
              value={editData.phone}
              onChange={(e) => onEditDataChange({ ...editData, phone: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-organization">Организация</Label>
            <Input
              id="edit-organization"
              value={editData.organization}
              onChange={(e) => onEditDataChange({ ...editData, organization: e.target.value })}
            />
          </div>

          {newPassword && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <Label className="text-green-900">Новый пароль:</Label>
              <p className="font-mono font-bold text-lg text-green-900 mt-1">{newPassword}</p>
              <p className="text-xs text-green-700 mt-2">Сохраните пароль, он больше не будет показан</p>
            </div>
          )}

          <div className="pt-4 border-t">
            <Button
              variant="outline"
              onClick={onResetPassword}
              className="w-full"
            >
              <Icon name="Key" size={18} className="mr-2" />
              Сбросить пароль
            </Button>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={onSave}>
            <Icon name="Save" size={18} className="mr-2" />
            Сохранить
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
