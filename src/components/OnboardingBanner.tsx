import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface OnboardingBannerProps {
  onClose: () => void;
}

const OnboardingBanner = ({ onClose }: OnboardingBannerProps) => {
  const [timeLeft, setTimeLeft] = useState(24 * 60 * 60);
  const [showSteps, setShowSteps] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  const steps = [
    {
      title: 'Создайте первый проект',
      description: 'Проект — это контейнер для всех объектов строительства',
      icon: 'FolderPlus',
      buttonText: '+ Новый проект',
    },
    {
      title: 'Добавьте объект',
      description: 'Объект — это конкретный адрес или локация работ',
      icon: 'MapPin',
      buttonText: '+ Новый объект',
    },
    {
      title: 'Создайте первую работу',
      description: 'Работа — это задача для подрядчика с журналом записей',
      icon: 'Wrench',
      buttonText: '+ Новая работа',
    },
  ];

  if (showSteps) {
    const step = steps[currentStep];
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
            <Icon name={step.icon as any} size={40} className="text-blue-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-slate-900 mb-3">{step.title}</h2>
          <p className="text-slate-600 mb-8">{step.description}</p>

          <Button size="lg" className="w-full mb-4" onClick={() => {
            if (currentStep < steps.length - 1) {
              setCurrentStep(currentStep + 1);
            } else {
              onClose();
            }
          }}>
            <Icon name="Plus" size={20} className="mr-2" />
            {step.buttonText}
          </Button>

          <div className="flex gap-2 justify-center mb-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentStep ? 'w-8 bg-blue-600' : 'w-2 bg-slate-300'
                }`}
              />
            ))}
          </div>

          <button
            onClick={onClose}
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            Пропустить обучение
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white text-center relative">
          <button
            onClick={() => setShowSteps(true)}
            className="absolute top-4 right-4 text-white/80 hover:text-white"
          >
            <Icon name="X" size={24} />
          </button>
          
          <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
            <Icon name="Zap" size={32} />
          </div>
          
          <h1 className="text-3xl font-bold mb-2">Специальное предложение!</h1>
          <p className="text-blue-100 text-lg mb-6">
            Тариф "Про" со скидкой 50% — только 24 часа
          </p>

          <div className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-lg px-6 py-4 mb-6">
            <div className="text-center">
              <div className="text-4xl font-bold">{String(hours).padStart(2, '0')}</div>
              <div className="text-xs text-blue-200">часов</div>
            </div>
            <div className="text-3xl">:</div>
            <div className="text-center">
              <div className="text-4xl font-bold">{String(minutes).padStart(2, '0')}</div>
              <div className="text-xs text-blue-200">минут</div>
            </div>
            <div className="text-3xl">:</div>
            <div className="text-center">
              <div className="text-4xl font-bold">{String(seconds).padStart(2, '0')}</div>
              <div className="text-xs text-blue-200">секунд</div>
            </div>
          </div>

          <Button 
            size="lg" 
            className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8"
          >
            Активировать скидку
          </Button>
        </div>

        <div className="p-6 bg-white">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <Icon name="Users" size={24} className="mx-auto text-blue-600 mb-2" />
              <p className="text-sm font-medium text-slate-900">Команда</p>
              <p className="text-xs text-slate-500">до 50 человек</p>
            </div>
            <div>
              <Icon name="Cloud" size={24} className="mx-auto text-blue-600 mb-2" />
              <p className="text-sm font-medium text-slate-900">Хранилище</p>
              <p className="text-xs text-slate-500">100 ГБ</p>
            </div>
            <div>
              <Icon name="LineChart" size={24} className="mx-auto text-blue-600 mb-2" />
              <p className="text-sm font-medium text-slate-900">Аналитика</p>
              <p className="text-xs text-slate-500">Расширенная</p>
            </div>
          </div>

          <button
            onClick={() => setShowSteps(true)}
            className="w-full mt-6 text-sm text-slate-500 hover:text-slate-700"
          >
            Продолжить без подписки
          </button>
        </div>
      </Card>
    </div>
  );
};

export default OnboardingBanner;
