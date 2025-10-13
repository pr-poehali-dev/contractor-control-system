import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';

const userTiers = [
  { users: 5, label: '5 пользователей', price: 0 },
  { users: 10, label: '10 пользователей', price: 500 },
  { users: 25, label: '25 пользователей', price: 1000 },
  { users: 50, label: '50 пользователей', price: 1800 },
  { users: 100, label: '100 пользователей', price: 3000 },
  { users: -1, label: 'Безлимит', price: 5000 },
];

const areaTiers = [
  { area: 1000, label: 'до 1 000 м²', price: 0 },
  { area: 5000, label: 'до 5 000 м²', price: 800 },
  { area: 10000, label: 'до 10 000 м²', price: 1500 },
  { area: 50000, label: 'до 50 000 м²', price: 3000 },
  { area: -1, label: 'Безлимит', price: 5000 },
];

interface AddonFeature {
  id: string;
  title: string;
  description: string;
  icon: string;
  price: number;
  badge?: string;
}

const addonFeatures: AddonFeature[] = [
  {
    id: 'ai_assistant',
    title: 'AI-помощник',
    description: 'Автоматическое заполнение отчётов и анализ дефектов с помощью ИИ',
    icon: 'Sparkles',
    price: 1200,
    badge: 'Популярно'
  },
  {
    id: 'advanced_analytics',
    title: 'Расширенная аналитика',
    description: 'Детальные отчёты, прогнозы сроков, анализ эффективности подрядчиков',
    icon: 'TrendingUp',
    price: 800
  },
  {
    id: 'white_label',
    title: 'White Label',
    description: 'Персонализация интерфейса под ваш бренд (логотип, цвета, домен)',
    icon: 'Palette',
    price: 2000
  },
  {
    id: 'api_access',
    title: 'API доступ',
    description: 'Интеграция с вашими системами через REST API',
    icon: 'Code',
    price: 1500
  },
  {
    id: 'priority_support',
    title: 'Приоритетная поддержка',
    description: 'Персональный менеджер и ответ в течение 1 часа',
    icon: 'Headphones',
    price: 1000
  },
  {
    id: 'mobile_app',
    title: 'Мобильное приложение',
    description: 'Нативные iOS и Android приложения для работы оффлайн',
    icon: 'Smartphone',
    price: 1500,
    badge: 'Скоро'
  },
  {
    id: 'sms_notifications',
    title: 'SMS уведомления',
    description: 'Отправка критичных уведомлений через SMS',
    icon: 'MessageSquare',
    price: 500
  },
  {
    id: 'document_templates',
    title: 'Конструктор документов',
    description: 'Создание и автозаполнение актов, смет, договоров',
    icon: 'FileText',
    price: 900
  }
];

const Pricing = () => {
  const [selectedUserTier, setSelectedUserTier] = useState(0);
  const [selectedAreaTier, setSelectedAreaTier] = useState(0);
  const [enabledAddons, setEnabledAddons] = useState<string[]>([]);

  const toggleAddon = (addonId: string) => {
    setEnabledAddons(prev =>
      prev.includes(addonId)
        ? prev.filter(id => id !== addonId)
        : [...prev, addonId]
    );
  };

  const basePrice = userTiers[selectedUserTier].price + areaTiers[selectedAreaTier].price;
  const addonsPrice = enabledAddons.reduce((sum, addonId) => {
    const addon = addonFeatures.find(a => a.id === addonId);
    return sum + (addon?.price || 0);
  }, 0);
  const totalPrice = basePrice + addonsPrice;
  const discount = totalPrice > 5000 ? Math.floor(totalPrice * 0.15) : 0;
  const finalPrice = totalPrice - discount;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container max-w-5xl mx-auto p-4 md:p-8 pb-24 md:pb-10">
        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600">
              <Icon name="Gem" size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Тарифы</h1>
              <p className="text-sm md:text-base text-slate-600">Настройте план под ваши потребности</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <Icon name="Users" size={20} />
                Количество пользователей
              </CardTitle>
              <CardDescription className="text-sm">
                Сколько человек будет работать в системе
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                {userTiers.map((tier, index) => (
                  <button
                    key={tier.users}
                    onClick={() => setSelectedUserTier(index)}
                    className={cn(
                      'p-3 md:p-4 rounded-xl border-2 transition-all text-left',
                      selectedUserTier === index
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    )}
                  >
                    <div className="text-xl md:text-2xl font-bold text-slate-900 mb-1">
                      {tier.users === -1 ? '∞' : tier.users}
                    </div>
                    <div className="text-[10px] md:text-xs text-slate-600 mb-1 md:mb-2 leading-tight line-clamp-1">{tier.label}</div>
                    <div className="text-xs md:text-sm font-semibold text-blue-600">
                      {tier.price === 0 ? 'Бесплатно' : `+${tier.price} ₽`}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <Icon name="Maximize2" size={20} />
                Площадь проектов
              </CardTitle>
              <CardDescription className="text-sm">
                Суммарная площадь всех объектов в проектах
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                {areaTiers.map((tier, index) => (
                  <button
                    key={tier.area}
                    onClick={() => setSelectedAreaTier(index)}
                    className={cn(
                      'p-3 md:p-4 rounded-xl border-2 transition-all text-left',
                      selectedAreaTier === index
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    )}
                  >
                    <div className="text-xl md:text-2xl font-bold text-slate-900 mb-1">
                      {tier.area === -1 ? '∞' : tier.area / 1000}
                    </div>
                    <div className="text-[10px] md:text-xs text-slate-600 mb-1 md:mb-2 leading-tight line-clamp-1">{tier.label}</div>
                    <div className="text-xs md:text-sm font-semibold text-blue-600">
                      {tier.price === 0 ? 'Бесплатно' : `+${tier.price} ₽`}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <Icon name="Zap" size={20} />
                Дополнительные возможности
              </CardTitle>
              <CardDescription className="text-sm">
                Расширьте функциональность системы
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {addonFeatures.map(addon => (
                <div
                  key={addon.id}
                  className={cn(
                    'flex items-start gap-3 md:gap-4 p-3 md:p-4 rounded-xl border-2 transition-all',
                    enabledAddons.includes(addon.id)
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-slate-200'
                  )}
                >
                  <div className={cn(
                    'flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-xl flex-shrink-0',
                    enabledAddons.includes(addon.id)
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  )}>
                    <Icon name={addon.icon as any} size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm md:text-base font-semibold text-slate-900">{addon.title}</h4>
                      {addon.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {addon.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs md:text-sm text-slate-600">{addon.description}</p>
                  </div>
                  <div className="flex flex-col md:flex-row items-end md:items-center gap-2 md:gap-3 flex-shrink-0">
                    <span className="text-xs md:text-sm font-semibold text-blue-600 whitespace-nowrap">
                      +{addon.price} ₽/мес
                    </span>
                    <Switch
                      checked={enabledAddons.includes(addon.id)}
                      onCheckedChange={() => toggleAddon(addon.id)}
                      disabled={addon.badge === 'Скоро'}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="lg:sticky lg:top-20">
            <CardHeader>
              <CardTitle>Ваш тариф</CardTitle>
              <CardDescription>Итоговая стоимость</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Базовый тариф</span>
                  <span className="font-medium">{basePrice} ₽</span>
                </div>
                {enabledAddons.length > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Дополнительно</span>
                    <span className="font-medium">{addonsPrice} ₽</span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Скидка 15%</span>
                    <span className="font-medium">-{discount} ₽</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-slate-600">Итого в месяц</span>
                  <div className="text-3xl font-bold text-slate-900">
                    {finalPrice} ₽
                  </div>
                </div>
                <p className="text-xs text-slate-500 text-right">
                  {finalPrice * 12} ₽ в год
                </p>
              </div>

              <Button className="w-full" size="lg">
                <Icon name="CreditCard" size={20} className="mr-2" />
                Оформить подписку
              </Button>

              <div className="space-y-2 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Icon name="Check" size={16} className="text-green-600" />
                  <span>Первые 14 дней бесплатно</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Icon name="Check" size={16} className="text-green-600" />
                  <span>Отмена в любое время</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Icon name="Check" size={16} className="text-green-600" />
                  <span>Безопасная оплата</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Pricing;