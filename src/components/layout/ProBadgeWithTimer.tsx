import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import { useAuthRedux } from '@/hooks/useAuthRedux';

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
}

export default function ProBadgeWithTimer() {
  const navigate = useNavigate();
  const { user } = useAuthRedux();
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [isOfferActive, setIsOfferActive] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    const proOfferShown = localStorage.getItem(`pro_offer_shown_${user.id}`);
    if (!proOfferShown) return;

    const registrationDate = user.created_at;
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
        setTimeLeft(null);
      }
    };

    checkOffer();
    const interval = setInterval(checkOffer, 1000);
    
    return () => clearInterval(interval);
  }, [user]);

  return (
    <Button
      variant="ghost"
      onClick={() => navigate('/pricing')}
      className="h-10 px-3 gap-2 relative"
    >
      <div className="flex items-center gap-2 px-2 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold text-sm">
        <Icon name="Gem" size={14} />
        <span>Pro</span>
      </div>
      
      {isOfferActive && timeLeft && (
        <div className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-lg border-2 border-white animate-pulse">
          {timeLeft.hours.toString().padStart(2, '0')}:{timeLeft.minutes.toString().padStart(2, '0')}:{timeLeft.seconds.toString().padStart(2, '0')}
        </div>
      )}
    </Button>
  );
}