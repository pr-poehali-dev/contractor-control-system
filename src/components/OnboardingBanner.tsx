import { useState } from 'react';
import OnboardingTour from './OnboardingTour';
import PricingModal from './PricingModal';

interface OnboardingBannerProps {
  onClose: () => void;
}

const OnboardingBanner = ({ onClose }: OnboardingBannerProps) => {
  const [showPricing, setShowPricing] = useState(true);
  const [showTour, setShowTour] = useState(false);

  const handleStartTour = () => {
    setShowPricing(false);
    setShowTour(true);
  };

  const handleCompleteTour = () => {
    localStorage.setItem('onboarding_3', 'true');
    onClose();
  };

  if (showTour) {
    return <OnboardingTour onComplete={handleCompleteTour} />;
  }

  if (showPricing) {
    return <PricingModal onClose={handleStartTour} onStartTrial={handleStartTour} />;
  }

  return null;
};

export default OnboardingBanner;
