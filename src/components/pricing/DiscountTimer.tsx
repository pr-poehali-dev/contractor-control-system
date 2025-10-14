import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
}

export default function DiscountTimer() {
  const { user } = useAuth();
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [isOfferActive, setIsOfferActive] = useState(false);

  useEffect(() => {
    if (!user?.created_at) {
      console.log('[DiscountTimer] No user.created_at:', user);
      return;
    }

    const checkOffer = () => {
      const regDate = new Date(user.created_at);
      const now = new Date();
      const totalSecondsLeft = 48 * 60 * 60 - Math.floor((now.getTime() - regDate.getTime()) / 1000);
      
      console.log('[DiscountTimer]', {
        regDate: regDate.toISOString(),
        now: now.toISOString(),
        totalSecondsLeft,
        isActive: totalSecondsLeft > 0
      });
      
      if (totalSecondsLeft > 0) {
        setIsOfferActive(true);
        const hours = Math.floor(totalSecondsLeft / 3600);
        const minutes = Math.floor((totalSecondsLeft % 3600) / 60);
        const seconds = totalSecondsLeft % 60;
        setTimeLeft({ hours, minutes, seconds });
      } else {
        setIsOfferActive(false);
        setTimeLeft(null);
      }
    };

    checkOffer();
    const interval = setInterval(checkOffer, 1000);
    
    return () => clearInterval(interval);
  }, [user]);

  if (!isOfferActive || !timeLeft) return null;

  return (
    <Card className="p-4 md:p-6 bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-300 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200/30 rounded-full -mr-16 -mt-16"></div>
      
      <div className="relative">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon name="Zap" size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-slate-900 text-lg">Скидка 25% заканчивается!</h3>
            <p className="text-xs text-slate-600">Только для новых пользователей</p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-lg p-3 text-center shadow-sm">
            <div className="text-3xl font-bold text-orange-600">{timeLeft.hours.toString().padStart(2, '0')}</div>
            <div className="text-xs text-slate-600 uppercase mt-1">Часов</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center shadow-sm">
            <div className="text-3xl font-bold text-orange-600">{timeLeft.minutes.toString().padStart(2, '0')}</div>
            <div className="text-xs text-slate-600 uppercase mt-1">Минут</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center shadow-sm">
            <div className="text-3xl font-bold text-orange-600">{timeLeft.seconds.toString().padStart(2, '0')}</div>
            <div className="text-xs text-slate-600 uppercase mt-1">Секунд</div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-white/70 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <Icon name="Gift" size={16} className="text-orange-600" />
            <span className="font-semibold">При покупке получите:</span>
          </div>
          <ul className="mt-2 space-y-1 text-xs text-slate-600">
            <li className="flex items-center gap-2">
              <Icon name="Check" size={12} className="text-green-600" />
              <span>-25% на все тарифы навсегда</span>
            </li>
            <li className="flex items-center gap-2">
              <Icon name="Check" size={12} className="text-green-600" />
              <span>Бесплатную настройку системы</span>
            </li>
            <li className="flex items-center gap-2">
              <Icon name="Check" size={12} className="text-green-600" />
              <span>Персональную консультацию</span>
            </li>
          </ul>
        </div>
      </div>
    </Card>
  );
}