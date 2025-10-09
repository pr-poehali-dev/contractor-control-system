import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface InviteData {
  name: string;
  phone: string;
  email: string;
  organization: string;
}

interface InviteContractorDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  inviteData: InviteData;
  onInviteDataChange: (data: InviteData) => void;
  onInvite: () => void;
  isSending: boolean;
}

export const InviteContractorDialog = ({
  isOpen,
  onOpenChange,
  inviteData,
  onInviteDataChange,
  onInvite,
  isSending,
}: InviteContractorDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Icon name="UserPlus" size={18} className="mr-2" />
          Пригласить подрядчика
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Пригласить подрядчика</DialogTitle>
          <DialogDescription>
            Введите данные подрядчика. На указанный телефон будет отправлен пароль для входа.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Имя *</Label>
            <Input
              id="name"
              placeholder="Иван Иванов"
              value={inviteData.name}
              onChange={(e) => onInviteDataChange({ ...inviteData, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Телефон *</Label>
            <Input
              id="phone"
              placeholder="+7 (900) 123-45-67"
              value={inviteData.phone}
              onChange={(e) => onInviteDataChange({ ...inviteData, phone: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="contractor@example.com"
              value={inviteData.email}
              onChange={(e) => onInviteDataChange({ ...inviteData, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="organization">Организация</Label>
            <Input
              id="organization"
              placeholder="ООО 'Стройпроект'"
              value={inviteData.organization}
              onChange={(e) => onInviteDataChange({ ...inviteData, organization: e.target.value })}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={onInvite} disabled={isSending}>
            {isSending ? (
              <>
                <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                Отправка...
              </>
            ) : (
              <>
                <Icon name="Send" size={18} className="mr-2" />
                Отправить приглашение
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
