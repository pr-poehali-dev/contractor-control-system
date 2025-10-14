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
    if (userRole !== 'client') return;

    const hasSeenOnboarding = localStorage.getItem(`onboarding_v2_${userId}`);
    
    if (!hasSeenOnboarding) {
      setTimeout(() => setShowWelcome(true), 500);
    }
  }, [userId, userRole]);

  const handleStartTour = () => {
    setShowWelcome(false);
    setTimeout(() => setShowTour(true), 300);
  };

  const handleSkipTour = () => {
    setShowWelcome(false);
    localStorage.setItem(`onboarding_v2_${userId}`, 'skipped');
    setShowProUpgrade(true);
  };

  const handleTourComplete = () => {
    setShowTour(false);
    localStorage.setItem(`onboarding_v2_${userId}`, 'completed');
    setTimeout(() => setShowProUpgrade(true), 500);
  };

  const handleTourSkip = () => {
    setShowTour(false);
    localStorage.setItem(`onboarding_v2_${userId}`, 'skipped');
    setShowProUpgrade(true);
  };

  const handleProUpgradeClose = () => {
    setShowProUpgrade(false);
    localStorage.setItem(`pro_offer_shown_${userId}`, 'true');
  };

  if (userRole !== 'client') return null;

  return (
    <>
      <Dialog open={showWelcome} onOpenChange={setShowWelcome}>
        <DialogContent className="max-w-lg">
          <div className="text-center py-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon name="Rocket" size={40} className="text-blue-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              Добро пожаловать в систему!
            </h2>
            
            <p className="text-slate-600 mb-8 leading-relaxed">
              Мы покажем, как создать объект, добавить работы и начать контролировать строительство. 
              Это займёт всего минуту!
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="outline"
                onClick={handleSkipTour}
                className="order-2 sm:order-1"
              >
                Я разберусь сам
              </Button>
              <Button
                onClick={handleStartTour}
                className="bg-blue-600 hover:bg-blue-700 order-1 sm:order-2"
              >
                <Icon name="Play" size={16} className="mr-2" />
                Начать обучение
              </Button>
            </div>

            <p className="text-xs text-slate-500 mt-6">
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

      <ProUpgradeModal
        open={showProUpgrade}
        onOpenChange={(open) => {
          if (!open) handleProUpgradeClose();
        }}
        registrationDate={registrationDate}
      />
    </>
  );
};

export default OnboardingFlow;
