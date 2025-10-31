import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import OnboardingTour from './OnboardingTour';
import ProUpgradeModal from './ProUpgradeModal';

interface OnboardingFlowProps {
  userId: number;
  userRole: string;
  registrationDate?: string;
}

const OnboardingFlow = ({ userId, userRole, registrationDate }: OnboardingFlowProps) => {
  const [showWelcome, setShowWelcome] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [showProUpgrade, setShowProUpgrade] = useState(false);

  useEffect(() => {
    if (userRole !== 'client' && userRole !== 'contractor') return;

    const hasSeenOnboarding = localStorage.getItem(`onboarding_v2_${userId}`);
    const hasSeenProOffer = localStorage.getItem(`pro_offer_shown_${userId}`);
    
    if (!hasSeenOnboarding) {
      setTimeout(() => setShowWelcome(true), 500);
    } else if (!hasSeenProOffer && registrationDate && userRole === 'client') {
      const regDate = new Date(registrationDate);
      const now = new Date();
      const totalSecondsLeft = 48 * 60 * 60 - Math.floor((now.getTime() - regDate.getTime()) / 1000);
      
      if (totalSecondsLeft > 0) {
        setTimeout(() => setShowProUpgrade(true), 1000);
      }
    }
  }, [userId, userRole, registrationDate]);

  const handleStartTour = () => {
    setShowWelcome(false);
    setTimeout(() => setShowTour(true), 300);
  };

  const handleSkipTour = () => {
    setShowWelcome(false);
    localStorage.setItem(`onboarding_v2_${userId}`, 'skipped');
    if (userRole === 'client') {
      setShowProUpgrade(true);
    }
  };

  const handleTourComplete = () => {
    setShowTour(false);
    localStorage.setItem(`onboarding_v2_${userId}`, 'completed');
    if (userRole === 'client') {
      setTimeout(() => setShowProUpgrade(true), 500);
    }
  };

  const handleTourSkip = () => {
    setShowTour(false);
    localStorage.setItem(`onboarding_v2_${userId}`, 'skipped');
    if (userRole === 'client') {
      setShowProUpgrade(true);
    }
  };

  const handleProUpgradeClose = () => {
    setShowProUpgrade(false);
    localStorage.setItem(`pro_offer_shown_${userId}`, 'true');
  };

  if (userRole !== 'client' && userRole !== 'contractor') return null;

  const handleWelcomeClose = (open: boolean) => {
    if (!open) {
      localStorage.setItem(`onboarding_v2_${userId}`, 'skipped');
      if (userRole === 'client') {
        setShowProUpgrade(true);
      }
    }
    setShowWelcome(open);
  };

  return (
    <>
      <Dialog open={showWelcome} onOpenChange={handleWelcomeClose}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <div className="text-center py-4 md:py-6 px-2">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
              <Icon name="Rocket" size={32} className="md:w-10 md:h-10 text-blue-600" />
            </div>
            
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-2 md:mb-3 px-2">
              Добро пожаловать в систему!
            </h2>
            
            <p className="text-sm md:text-base text-slate-600 mb-6 md:mb-8 leading-relaxed px-2">
              {userRole === 'client' 
                ? 'Мы покажем, как создать объект, добавить работы и начать контролировать строительство. Это займёт всего минуту!' 
                : 'Мы покажем, как работать с системой, выполнять работы и взаимодействовать с заказчиками. Это займёт всего минуту!'}
            </p>

            <div className="flex flex-col gap-3 justify-center px-2">
              <Button
                onClick={handleStartTour}
                className="bg-blue-600 hover:bg-blue-700 w-full"
                size="lg"
              >
                <Icon name="Play" size={16} className="mr-2" />
                Начать обучение
              </Button>
              <Button
                variant="outline"
                onClick={handleSkipTour}
                className="w-full"
              >
                Я разберусь сам
              </Button>
            </div>

            <p className="text-xs text-slate-500 mt-4 md:mt-6 px-2">
              Вы всегда можете вернуться к обучению через меню помощи
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {showTour && (
        <OnboardingTour 
          onComplete={handleTourComplete}
          onSkip={handleTourSkip}
        />
      )}

      {userRole === 'client' && (
        <ProUpgradeModal
          open={showProUpgrade}
          onOpenChange={(open) => {
            if (!open) handleProUpgradeClose();
          }}
          registrationDate={registrationDate}
        />
      )}
    </>
  );
};

export default OnboardingFlow;