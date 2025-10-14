import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
}

interface ProUpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registrationDate?: string;
}

const ProUpgradeModal = ({ open, onOpenChange, registrationDate }: ProUpgradeModalProps) => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ hours: 0, minutes: 0, seconds: 0 });
  const [isOfferActive, setIsOfferActive] = useState(false);

  useEffect(() => {
    if (!registrationDate) return;

    const checkOffer = () => {
      const regDate = new Date(registrationDate);
      const now = new Date();
      const totalSecondsLeft = 48 * 60 * 60 - Math.floor((now.getTime() - regDate.getTime()) / 1000);
      
      if (totalSecondsLeft > 0) {
        setIsOfferActive(true);
        const hours = Math.floor(totalSecondsLeft / 3600);
        const minutes = Math.floor((totalSecondsLeft % 3600) / 60);
        const seconds = totalSecondsLeft % 60;
        setTimeLeft({ hours, minutes, seconds });
      } else {
        setIsOfferActive(false);
      }
    };

    checkOffer();
    const interval = setInterval(checkOffer, 1000);
    
    return () => clearInterval(interval);
  }, [registrationDate]);

  const handleUpgrade = () => {
    onOpenChange(false);
    navigate('/pricing');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
        <div className="relative bg-gradient-to-br from-blue-600 to-blue-700 p-8 text-white">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Icon name="Sparkles" size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Усильте контроль с PRO!</h2>
              <p className="text-blue-100 text-sm leading-relaxed">
                Получите доступ к расширенным возможностям для полного контроля строительства
              </p>
            </div>
          </div>
        </div>

        <div className="p-8">

          <div className="space-y-3 mb-8">
            
            <div className="flex gap-3">
              <Icon name="Users" size={20} className="text-slate-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-slate-900">Неограниченные объекты и подрядчики</h4>
                <p className="text-sm text-slate-600">Управляйте любым количеством проектов одновременно</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Icon name="Camera" size={20} className="text-slate-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-slate-900">Фотофиксация с автосохранением</h4>
                <p className="text-sm text-slate-600">Храните все фото работ в облаке без ограничений</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Icon name="FileText" size={20} className="text-slate-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-slate-900">Экспорт отчетов в PDF/Excel</h4>
                <p className="text-sm text-slate-600">Формируйте профессиональные отчеты одним кликом</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Icon name="Bell" size={20} className="text-slate-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-slate-900">Уведомления и напоминания</h4>
                <p className="text-sm text-slate-600">Email и Telegram оповещения о важных событиях</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Icon name="Shield" size={20} className="text-slate-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-slate-900">Приоритетная поддержка</h4>
                <p className="text-sm text-slate-600">Ответы на вопросы в течение 2 часов</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1 border-slate-300"
            >
              Позже
            </Button>
            <Button 
              onClick={handleUpgrade}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <Icon name="Sparkles" size={16} className="mr-2" />
              Перейти к тарифам
            </Button>
          </div>

          <p className="text-xs text-slate-500 text-center mt-4">
            Базовый тариф остаётся бесплатным. PRO можно подключить в любой момент.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProUpgradeModal;