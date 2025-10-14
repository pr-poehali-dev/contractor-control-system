import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function useDiscountOffer() {
  const { user } = useAuth();
  const [isOfferActive, setIsOfferActive] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(0);

  useEffect(() => {
    if (!user?.created_at) {
      setIsOfferActive(false);
      setDiscountPercent(0);
      return;
    }

    const checkOffer = () => {
      const regDate = new Date(user.created_at);
      const now = new Date();
      const totalSecondsLeft = 48 * 60 * 60 - Math.floor((now.getTime() - regDate.getTime()) / 1000);
      
      if (totalSecondsLeft > 0) {
        setIsOfferActive(true);
        setDiscountPercent(25);
      } else {
        setIsOfferActive(false);
        setDiscountPercent(0);
      }
    };

    checkOffer();
    const interval = setInterval(checkOffer, 1000);
    
    return () => clearInterval(interval);
  }, [user]);

  return { isOfferActive, discountPercent };
}
