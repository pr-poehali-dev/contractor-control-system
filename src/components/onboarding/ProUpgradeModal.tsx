import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';

interface ProUpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registrationDate?: string;
}

const ProUpgradeModal = ({ open, onOpenChange, registrationDate }: ProUpgradeModalProps) => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isOfferActive, setIsOfferActive] = useState(false);

  useEffect(() => {
    if (!registrationDate) return;

    const checkOffer = () => {
      const regDate = new Date(registrationDate);
      const now = new Date();
      const hoursPassed = (now.getTime() - regDate.getTime()) / (1000 * 60 * 60);
      
      if (hoursPassed < 48) {
        setIsOfferActive(true);
        const hoursLeft = Math.floor(48 - hoursPassed);
        const minutesLeft = Math.floor(((48 - hoursPassed) % 1) * 60);
        setTimeLeft(`${hoursLeft}ч ${minutesLeft}м`);
      } else {
        setIsOfferActive(false);
      }
    };

    checkOffer();
    const interval = setInterval(checkOffer, 60000);
    
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
          {isOfferActive && (
            <div className="absolute top-4 right-4">
              <Badge className="bg-orange-500 text-white border-0 px-3 py-1.5 text-xs font-semibold animate-pulse">
                <Icon name="Clock" size={12} className="mr-1.5" />
                Осталось {timeLeft}
              </Badge>
            </div>
          )}
          
          <div className="flex items-start gap-4 mb-6">
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
          {isOfferActive && (
            <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <Icon name="Zap" size={20} className="text-orange-600" />
                <h3 className="font-semibold text-slate-900">Специальное предложение для новых клиентов!</h3>
              </div>
              <p className="text-sm text-slate-600 mb-3">
                Активируйте PRO в течение 48 часов и получите:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 text-slate-700">
                  <Icon name="Check" size={16} className="text-green-600 flex-shrink-0" />
                  <span><strong>-30% на первый месяц</strong> (вместо 1990₽ → 1393₽)</span>
                </li>
                <li className="flex items-center gap-2 text-slate-700">
                  <Icon name="Check" size={16} className="text-green-600 flex-shrink-0" />
                  <span><strong>Бесплатная настройка</strong> справочников работ</span>
                </li>
                <li className="flex items-center gap-2 text-slate-700">
                  <Icon name="Check" size={16} className="text-green-600 flex-shrink-0" />
                  <span><strong>Персональная консультация</strong> по работе с системой</span>
                </li>
              </ul>
            </div>
          )}

          <div className="space-y-3 mb-6">
            <h3 className="font-semibold text-slate-900 mb-4">Возможности PRO тарифа:</h3>
            
            <div className="flex gap-3">
              <Icon name="Users" size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-slate-900 text-sm">Неограниченные объекты и подрядчики</h4>
                <p className="text-xs text-slate-600">Управляйте любым количеством проектов одновременно</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Icon name="Camera" size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-slate-900 text-sm">Фотофиксация с автосохранением</h4>
                <p className="text-xs text-slate-600">Храните все фото работ в облаке без ограничений</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Icon name="FileText" size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-slate-900 text-sm">Экспорт отчетов в PDF/Excel</h4>
                <p className="text-xs text-slate-600">Формируйте профессиональные отчеты одним кликом</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Icon name="Bell" size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-slate-900 text-sm">Уведомления и напоминания</h4>
                <p className="text-xs text-slate-600">Email и Telegram оповещения о важных событиях</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Icon name="Shield" size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-slate-900 text-sm">Приоритетная поддержка</h4>
                <p className="text-xs text-slate-600">Ответы на вопросы в течение 2 часов</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Позже
            </Button>
            <Button 
              onClick={handleUpgrade}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <Icon name="Sparkles" size={16} className="mr-2" />
              {isOfferActive ? 'Активировать со скидкой' : 'Перейти к тарифам'}
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
