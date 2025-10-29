import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface SignatureMethodDialogProps {
  open: boolean;
  onClose: () => void;
  onSelectMethod: (method: 'sms' | 'ecp') => void;
  documentTitle?: string;
}

export default function SignatureMethodDialog({ 
  open, 
  onClose, 
  onSelectMethod,
  documentTitle 
}: SignatureMethodDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Выберите способ подписи</DialogTitle>
          <DialogDescription>
            {documentTitle && `Документ: ${documentTitle}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          <Button
            variant="outline"
            className="w-full h-auto py-4 flex flex-col items-center gap-2 hover:bg-blue-50 hover:border-blue-300 transition-all"
            onClick={() => onSelectMethod('sms')}
          >
            <Icon name="Smartphone" size={32} className="text-blue-600" />
            <div className="text-center">
              <p className="font-semibold text-base">Подписать через СМС</p>
              <p className="text-sm text-slate-500 mt-1">
                Код подтверждения придёт на ваш номер телефона
              </p>
            </div>
          </Button>

          <Button
            variant="outline"
            className="w-full h-auto py-4 flex flex-col items-center gap-2 hover:bg-green-50 hover:border-green-300 transition-all"
            onClick={() => onSelectMethod('ecp')}
          >
            <Icon name="FileKey" size={32} className="text-green-600" />
            <div className="text-center">
              <p className="font-semibold text-base">Подписать через ЭЦП</p>
              <p className="text-sm text-slate-500 mt-1">
                Используйте электронную цифровую подпись
              </p>
            </div>
          </Button>
        </div>

        <Button variant="ghost" onClick={onClose} className="mt-4">
          Отмена
        </Button>
      </DialogContent>
    </Dialog>
  );
}
