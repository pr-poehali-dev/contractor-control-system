import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { InviteContractorDialog } from './InviteContractorDialog';

interface InviteData {
  name: string;
  phone: string;
  email: string;
  organization: string;
}

interface AdminHeaderProps {
  isInviteOpen: boolean;
  onInviteOpenChange: (open: boolean) => void;
  inviteData: InviteData;
  onInviteDataChange: (data: InviteData) => void;
  onInvite: () => void;
  isSendingInvite: boolean;
  onRefresh: () => void;
}

export const AdminHeader = ({
  isInviteOpen,
  onInviteOpenChange,
  inviteData,
  onInviteDataChange,
  onInvite,
  isSendingInvite,
  onRefresh,
}: AdminHeaderProps) => {
  return (
    <div className="mb-8 flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Админ-панель</h1>
        <p className="text-slate-600">Управление пользователями системы</p>
      </div>
      <div className="flex gap-3">
        <InviteContractorDialog
          isOpen={isInviteOpen}
          onOpenChange={onInviteOpenChange}
          inviteData={inviteData}
          onInviteDataChange={onInviteDataChange}
          onInvite={onInvite}
          isSending={isSendingInvite}
        />
        <Button onClick={onRefresh} variant="outline">
          <Icon name="RefreshCw" size={18} className="mr-2" />
          Обновить
        </Button>
      </div>
    </div>
  );
};
