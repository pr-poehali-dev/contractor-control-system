import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
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
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
  };

  const handleSendSMS = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep('code');
      toast({
        title: 'СМС отправлено',
        description: `Код отправлен на ${phone}`,
      });
    }, 800);
  };

  const handleVerifyCode = async () => {
    setIsLoading(true);
    try {
      await login('demo@example.com', 'password', 'contractor');
      navigate('/dashboard');
      toast({
        title: 'Добро пожаловать!',
        description: 'Вы успешно вошли в систему',
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Неверный код',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCode(value);
    if (value.length === 4) {
      handleVerifyCode();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-600 mb-6">
            <Icon name="Building2" size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Подряд-ПРО</h1>
          <p className="text-slate-600 text-lg">Журнал работ для строителей</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {step === 'phone' ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Номер телефона
                </label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="+7 999 123-45-67"
                  className="h-14 text-lg"
                  autoFocus
                />
              </div>

              <Button
                onClick={handleSendSMS}
                disabled={phone.length < 18 || isLoading}
                className="w-full h-14 text-lg font-semibold"
              >
                {isLoading ? (
                  <Icon name="Loader2" size={24} className="animate-spin" />
                ) : (
                  'Получить СМС'
                )}
              </Button>

              <p className="text-center text-sm text-slate-500">
                Мы отправим вам код подтверждения
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Код из СМС
                  </label>
                  <button
                    onClick={() => setStep('phone')}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Изменить номер
                  </button>
                </div>
                <p className="text-sm text-slate-500 mb-4">
                  Отправлено на {phone}
                </p>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={code}
                  onChange={handleCodeChange}
                  placeholder="••••"
                  className="h-14 text-2xl text-center tracking-widest font-semibold"
                  maxLength={4}
                  autoFocus
                />
              </div>

              <Button
                onClick={handleVerifyCode}
                disabled={code.length < 4 || isLoading}
                className="w-full h-14 text-lg font-semibold"
              >
                {isLoading ? (
                  <Icon name="Loader2" size={24} className="animate-spin" />
                ) : (
                  'Войти'
                )}
              </Button>

              <button
                onClick={handleSendSMS}
                className="w-full text-sm text-slate-600 hover:text-slate-900"
              >
                Отправить код повторно
              </button>
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-sm text-slate-500">
          <p>
            Входя в систему, вы соглашаетесь с{' '}
            <a href="#" className="text-blue-600 hover:underline">
              условиями использования
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;