import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const Register = () => {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'client' | 'contractor'>('client');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length === 0) return '';
    if (digits.length <= 1) return `+7 ${digits}`;
    if (digits.length <= 4) return `+7 ${digits.slice(1, 4)}`;
    if (digits.length <= 7) return `+7 ${digits.slice(1, 4)} ${digits.slice(4, 7)}`;
    if (digits.length <= 9) return `+7 ${digits.slice(1, 4)} ${digits.slice(4, 7)}-${digits.slice(7, 9)}`;
    return `+7 ${digits.slice(1, 4)} ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  };

  const handleRegister = async () => {
    if (!phone || !name) {
      toast({
        title: 'Ошибка',
        description: 'Заполните телефон и имя',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const phoneDigits = phone.replace(/\D/g, '');
      const response = await fetch('https://functions.poehali.dev/448ad9ac-b820-4587-b3cc-0a988ebaa4e8', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: `+${phoneDigits}`,
          email: email || undefined,
          name,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка регистрации');
      }

      toast({
        title: 'Регистрация успешна!',
        description: 'Теперь вы можете войти в систему',
      });

      setTimeout(() => navigate('/login'), 1500);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось зарегистрироваться',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-600 mb-6">
            <Icon name="Building2" size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Регистрация</h1>
          <p className="text-slate-600">Создайте аккаунт в Подряд-ПРО</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Телефон *
              </label>
              <Input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="+7 999 123-45-67"
                className="h-12"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Имя *
              </label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Иван Иванов"
                className="h-12"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email (необязательно)
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="h-12"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Роль
              </label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={role === 'client' ? 'default' : 'outline'}
                  onClick={() => setRole('client')}
                  className="flex-1 h-12"
                >
                  <Icon name="UserCog" size={18} className="mr-2" />
                  Заказчик
                </Button>
                <Button
                  type="button"
                  variant={role === 'contractor' ? 'default' : 'outline'}
                  onClick={() => setRole('contractor')}
                  className="flex-1 h-12"
                >
                  <Icon name="Wrench" size={18} className="mr-2" />
                  Подрядчик
                </Button>
              </div>
            </div>

            <Button
              onClick={handleRegister}
              disabled={isLoading}
              className="w-full h-12 text-base font-semibold"
            >
              {isLoading ? (
                <Icon name="Loader2" size={20} className="animate-spin" />
              ) : (
                'Зарегистрироваться'
              )}
            </Button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            Уже есть аккаунт?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-blue-600 hover:underline font-medium"
            >
              Войти
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
