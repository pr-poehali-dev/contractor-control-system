import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';

interface PricingModalProps {
  onClose: () => void;
  onStartTrial: () => void;
}

const plans = [
  {
    id: 'free',
    name: 'Бесплатный',
    price: '0',
    period: 'навсегда',
    description: 'Для знакомства с системой',
    features: [
      { text: '1 проект', included: true },
      { text: '3 объекта', included: true },
      { text: '5 работ', included: true },
      { text: 'Журнал работ', included: true },
      { text: 'Проверки качества', included: false },
      { text: 'Аналитика', included: false },
      { text: 'Команда до 3 человек', included: true },
      { text: 'Поддержка в чате', included: false },
    ],
    badge: null,
    buttonText: 'Текущий план',
    buttonVariant: 'outline' as const,
  },
  {
    id: 'pro',
    name: 'Профессиональный',
    price: '2 990',
    period: 'в месяц',
    description: 'Для небольших команд',
    features: [
      { text: 'Неограниченно проектов', included: true },
      { text: 'Неограниченно объектов', included: true },
      { text: 'Неограниченно работ', included: true },
      { text: 'Журнал работ', included: true },
      { text: 'Проверки качества', included: true },
      { text: 'Базовая аналитика', included: true },
      { text: 'Команда до 20 человек', included: true },
      { text: 'Поддержка в чате', included: true },
    ],
    badge: 'Популярный',
    buttonText: '14 дней бесплатно',
    buttonVariant: 'default' as const,
    discount: '50%',
    oldPrice: '5 990',
  },
  {
    id: 'enterprise',
    name: 'Корпоративный',
    price: '9 990',
    period: 'в месяц',
    description: 'Для крупных организаций',
    features: [
      { text: 'Всё из тарифа Про', included: true },
      { text: 'Расширенная аналитика', included: true },
      { text: 'Интеграция с 1С', included: true },
      { text: 'API доступ', included: true },
      { text: 'Безлимитная команда', included: true },
      { text: 'Персональный менеджер', included: true },
      { text: 'SLA 99.9%', included: true },
      { text: 'Приоритетная поддержка', included: true },
    ],
    badge: 'Лучшее решение',
    buttonText: 'Связаться с нами',
    buttonVariant: 'outline' as const,
  },
];

export default function PricingModal({ onClose, onStartTrial }: PricingModalProps) {
  const [timeLeft, setTimeLeft] = useState(24 * 60 * 60);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-6xl my-8">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-2xl p-6 md:p-8 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <Icon name="X" size={24} />
          </button>
          
          <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
            <Icon name="Zap" size={32} />
          </div>
          
          <h1 className="text-2xl md:text-4xl font-bold mb-2">Специальное предложение!</h1>
          <p className="text-blue-100 text-base md:text-lg mb-6">
            Скидка 50% на тариф "Профессиональный" — только 24 часа
          </p>

          <div className="inline-flex items-center gap-2 md:gap-4 bg-white/10 backdrop-blur-sm rounded-lg px-4 md:px-6 py-3 md:py-4">
            <div className="text-center">
              <div className="text-2xl md:text-4xl font-bold">{String(hours).padStart(2, '0')}</div>
              <div className="text-xs text-blue-200">часов</div>
            </div>
            <div className="text-xl md:text-3xl">:</div>
            <div className="text-center">
              <div className="text-2xl md:text-4xl font-bold">{String(minutes).padStart(2, '0')}</div>
              <div className="text-xs text-blue-200">минут</div>
            </div>
            <div className="text-xl md:text-3xl">:</div>
            <div className="text-center">
              <div className="text-2xl md:text-4xl font-bold">{String(seconds).padStart(2, '0')}</div>
              <div className="text-xs text-blue-200">секунд</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-b-2xl p-4 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6">
            {plans.map((plan) => (
              <Card 
                key={plan.id}
                className={cn(
                  'relative transition-all hover:shadow-xl',
                  plan.id === 'pro' && 'border-2 border-blue-500 shadow-lg scale-105'
                )}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white px-3 py-1">
                      {plan.badge}
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl font-bold mb-2">{plan.name}</CardTitle>
                  <p className="text-sm text-slate-600 mb-4">{plan.description}</p>
                  
                  <div className="mb-2">
                    {plan.discount && (
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <span className="text-lg text-slate-400 line-through">{plan.oldPrice} ₽</span>
                        <Badge variant="destructive" className="text-xs">-{plan.discount}</Badge>
                      </div>
                    )}
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                      <span className="text-slate-600">₽</span>
                    </div>
                    <p className="text-sm text-slate-500">{plan.period}</p>
                  </div>

                  <Button
                    variant={plan.buttonVariant}
                    className="w-full mt-4"
                    onClick={plan.id === 'pro' ? onStartTrial : undefined}
                    disabled={plan.id === 'free'}
                  >
                    {plan.buttonText}
                  </Button>
                </CardHeader>

                <CardContent className="pt-4 border-t">
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Icon 
                          name={feature.included ? 'Check' : 'X'} 
                          size={18} 
                          className={cn(
                            'flex-shrink-0 mt-0.5',
                            feature.included ? 'text-green-600' : 'text-slate-300'
                          )}
                        />
                        <span className={cn(
                          feature.included ? 'text-slate-700' : 'text-slate-400'
                        )}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={onClose}
              className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              Продолжить с бесплатным тарифом →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
