import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface SignatureTypeDialogProps {
  open: boolean;
  onClose: () => void;
  onSelectType: (type: 'sms' | 'ecp') => void;
  documentTitle?: string;
}

export default function SignatureTypeDialog({
  open,
  onClose,
  onSelectType,
  documentTitle,
}: SignatureTypeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Выберите тип подписания</DialogTitle>
          <DialogDescription>
            Документ: {documentTitle || 'Без названия'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          <Button
            variant="outline"
            className="w-full justify-start h-auto py-4"
            onClick={() => {
              onSelectType('sms');
              onClose();
            }}
          >
            <div className="flex items-start gap-3 text-left">
              <Icon name="MessageSquare" size={24} className="mt-0.5 text-blue-600" />
              <div>
                <div className="font-semibold">Подписать по СМС</div>
                <div className="text-sm text-slate-500 mt-1">
                  Получите код подтверждения на телефон
                </div>
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start h-auto py-4"
            onClick={() => {
              onSelectType('ecp');
              onClose();
            }}
          >
            <div className="flex items-start gap-3 text-left">
              <Icon name="ShieldCheck" size={24} className="mt-0.5 text-green-600" />
              <div>
                <div className="font-semibold">Подписать ЭЦП</div>
                <div className="text-sm text-slate-500 mt-1">
                  Используйте электронную цифровую подпись
                </div>
              </div>
            </div>
          </Button>
        </div>

        <div className="flex justify-end mt-4">
          <Button variant="ghost" onClick={onClose}>
            Отмена
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
