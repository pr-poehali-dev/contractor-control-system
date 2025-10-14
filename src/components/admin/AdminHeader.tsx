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
    <div className="mb-6 md:mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1 md:mb-2">Админ-панель</h1>
          <p className="text-sm md:text-base text-slate-600 hidden md:block">Управление пользователями системы</p>
        </div>
        <Button onClick={onRefresh} variant="outline" size="sm" className="md:size-default">
          <Icon name="RefreshCw" size={16} className="md:mr-2" />
          <span className="hidden md:inline">Обновить</span>
        </Button>
      </div>
      <div className="w-full">
        <InviteContractorDialog
          isOpen={isInviteOpen}
          onOpenChange={onInviteOpenChange}
          inviteData={inviteData}
          onInviteDataChange={onInviteDataChange}
          onInvite={onInvite}
          isSending={isSendingInvite}
        />
      </div>
    </div>
  );
};