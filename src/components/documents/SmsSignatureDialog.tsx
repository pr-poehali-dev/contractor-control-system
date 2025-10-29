import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface SmsSignatureDialogProps {
  open: boolean;
  onClose: () => void;
  onSign: (code: string) => Promise<void>;
  phoneNumber?: string;
}

export default function SmsSignatureDialog({ 
  open, 
  onClose, 
  onSign,
  phoneNumber 
}: SmsSignatureDialogProps) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    if (open && !codeSent) {
      handleSendCode();
    }
  }, [open]);

  const handleSendCode = async () => {
    setIsLoading(true);
    try {
      console.log(`SMS подписание: код будет отправлен на ${phoneNumber}`);
      toast({
        title: 'Код отправлен',
        description: `СМС с кодом отправлена на номер ${phoneNumber || 'ваш номер'}`,
      });
      setCodeSent(true);
      setCountdown(60);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить код',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (code.length !== 6) {
      toast({
        title: 'Ошибка',
        description: 'Введите 6-значный код',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      await onSign(code);
      setCode('');
      setCodeSent(false);
      onClose();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Неверный код или истёк срок действия',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setCode('');
    setCodeSent(false);
    setCountdown(0);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Smartphone" size={24} className="text-blue-600" />
            Подписание через СМС
          </DialogTitle>
          <DialogDescription>
            Введите код из СМС для подтверждения подписи
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {phoneNumber && (
            <div className="bg-slate-50 p-3 rounded-lg">
              <p className="text-sm text-slate-600">
                Код отправлен на номер:
              </p>
              <p className="font-semibold text-slate-900">{phoneNumber}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="code">Код подтверждения</Label>
            <Input
              id="code"
              type="text"
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              className="text-center text-2xl tracking-widest font-mono"
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleSendCode}
              disabled={countdown > 0 || isLoading}
            >
              {countdown > 0 ? (
                <>Отправить повторно ({countdown}с)</>
              ) : (
                <>
                  <Icon name="RefreshCw" size={16} className="mr-2" />
                  Отправить повторно
                </>
              )}
            </Button>
            
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={code.length !== 6 || isLoading}
            >
              {isLoading ? (
                <>
                  <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                  Проверка...
                </>
              ) : (
                <>
                  <Icon name="CheckCircle" size={16} className="mr-2" />
                  Подписать
                </>
              )}
            </Button>
          </div>
        </div>

        <Button variant="ghost" onClick={handleClose} className="mt-2">
          Отмена
        </Button>
      </DialogContent>
    </Dialog>
  );
}