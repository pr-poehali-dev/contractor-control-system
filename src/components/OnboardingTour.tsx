import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: () => void;
  highlightSelector?: string;
}

const steps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Добро пожаловать в Подряд-ПРО!',
    description: 'Давайте настроим ваш первый проект за 3 шага. Это займёт всего 2 минуты.',
    target: 'center',
    position: 'center',
  },
  {
    id: 'create-project',
    title: 'Создайте первый проект',
    description: 'Проект — это контейнер для всех ваших объектов. Например: "Капремонт 2025" или "Ремонт школы №5"',
    target: '/projects',
    position: 'center',
    highlightSelector: '[data-tour="create-project-btn"]',
  },
  {
    id: 'create-object',
    title: 'Добавьте объект',
    description: 'Объект — это конкретный адрес работ. Например: "ул. Ленина, д. 10"',
    target: 'create-object',
    position: 'center',
    highlightSelector: '[data-tour="create-object-btn"]',
  },
  {
    id: 'create-work',
    title: 'Создайте работу',
    description: 'Работа — это конкретный вид работ. Например: "Замена кровли"',
    target: 'create-work',
    position: 'center',
    highlightSelector: '[data-tour="create-work-btn"]',
  },
  {
    id: 'add-log-entry',
    title: 'Добавьте запись в журнал',
    description: 'Журнал работ — сердце системы. Здесь подрядчики отчитываются, а вы проверяете.',
    target: 'work-log',
    position: 'bottom',
    highlightSelector: '[data-tour="add-log-btn"]',
  },
  {
    id: 'complete',
    title: 'Готово! 🎉',
    description: 'Теперь вы можете приглашать подрядчиков и контролировать качество работ.',
    target: 'center',
    position: 'center',
  },
];

interface OnboardingTourProps {
  onComplete: () => void;
}

export default function OnboardingTour({ onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      
      if (step.action) {
        step.action();
      }

      if (step.target === '/projects') {
        navigate('/projects');
      }
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    setIsVisible(false);
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  const handleComplete = () => {
    setIsVisible(false);
    setTimeout(() => {
      onComplete();
      navigate('/dashboard');
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div className={cn(
      'fixed inset-0 z-50 transition-opacity duration-300',
      isVisible ? 'opacity-100' : 'opacity-0'
    )}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleSkip} />
      
      {step.highlightSelector && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0" style={{
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
          }} />
        </div>
      )}

      <div className={cn(
        'absolute z-10 w-full max-w-md p-4',
        step.position === 'center' && 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
        step.position === 'top' && 'top-24 left-1/2 -translate-x-1/2',
        step.position === 'bottom' && 'bottom-24 left-1/2 -translate-x-1/2',
      )}>
        <Card className="shadow-2xl border-2 border-blue-200 animate-fade-in">
          <CardContent className="p-6">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-blue-600">
                  Шаг {currentStep + 1} из {steps.length}
                </span>
                <button
                  onClick={handleSkip}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <Icon name="X" size={18} />
                </button>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 transition-all duration-500 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                {step.title}
              </h2>
              <p className="text-slate-600 leading-relaxed">
                {step.description}
              </p>
            </div>

            <div className="flex gap-3">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="flex-1"
                >
                  <Icon name="ChevronLeft" size={18} className="mr-1" />
                  Назад
                </Button>
              )}
              <Button
                onClick={handleNext}
                className="flex-1"
              >
                {currentStep === steps.length - 1 ? 'Завершить' : 'Далее'}
                {currentStep < steps.length - 1 && (
                  <Icon name="ChevronRight" size={18} className="ml-1" />
                )}
              </Button>
            </div>

            {currentStep === 0 && (
              <button
                onClick={handleSkip}
                className="w-full mt-3 text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                Пропустить обучение
              </button>
            )}
          </CardContent>
        </Card>

        {step.id === 'create-project' && (
          <div className="mt-4 flex justify-center">
            <div className="animate-bounce">
              <Icon name="ArrowDown" size={32} className="text-white drop-shadow-lg" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
