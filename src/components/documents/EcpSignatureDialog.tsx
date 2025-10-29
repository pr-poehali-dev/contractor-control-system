import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface EcpSignatureDialogProps {
  open: boolean;
  onClose: () => void;
  onSign: (certificateData: string) => Promise<void>;
}

export default function EcpSignatureDialog({ 
  open, 
  onClose, 
  onSign 
}: EcpSignatureDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSign = async () => {
    if (!selectedFile) {
      toast({
        title: 'Ошибка',
        description: 'Выберите файл сертификата',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const certificateData = e.target?.result as string;
        await onSign(certificateData);
        setSelectedFile(null);
        onClose();
      };
      reader.readAsText(selectedFile);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось подписать документ',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="FileKey" size={24} className="text-green-600" />
            Подписание через ЭЦП
          </DialogTitle>
          <DialogDescription>
            Загрузите файл сертификата электронной подписи
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:border-slate-300 transition-colors">
            <input
              type="file"
              id="certificate-file"
              className="hidden"
              accept=".cer,.crt,.pem,.p12,.pfx"
              onChange={handleFileSelect}
              disabled={isLoading}
            />
            <Label htmlFor="certificate-file" className="cursor-pointer">
              <div className="flex flex-col items-center gap-3">
                <Icon name="Upload" size={32} className="text-slate-400" />
                {selectedFile ? (
                  <div className="text-center">
                    <p className="font-medium text-slate-900">{selectedFile.name}</p>
                    <p className="text-sm text-slate-500 mt-1">
                      {(selectedFile.size / 1024).toFixed(2)} КБ
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="font-medium text-slate-700">Выберите файл сертификата</p>
                    <p className="text-sm text-slate-500 mt-1">
                      Форматы: .cer, .crt, .pem, .p12, .pfx
                    </p>
                  </div>
                )}
              </div>
            </Label>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Icon name="Info" size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">Требования к сертификату:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-800">
                  <li>Действующий сертификат ЭЦП</li>
                  <li>Выпущен аккредитованным УЦ</li>
                  <li>Соответствует ФЗ-63</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleClose}
              disabled={isLoading}
            >
              Отмена
            </Button>
            
            <Button
              className="flex-1"
              onClick={handleSign}
              disabled={!selectedFile || isLoading}
            >
              {isLoading ? (
                <>
                  <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                  Подписание...
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
      </DialogContent>
    </Dialog>
  );
}
