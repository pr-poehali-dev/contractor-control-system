import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const [loginMethod, setLoginMethod] = useState<'password' | 'sms'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  const handlePasswordLogin = async () => {
    if (!email) {
      toast({
        title: 'Ошибка',
        description: 'Введите логин',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    try {
      await login(email);
      navigate('/dashboard');
      toast({
        title: 'Добро пожаловать!',
        description: 'Вы успешно вошли в систему',
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Проверьте логин',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setIsLoading(true);
    try {
      await login('test1');
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
          <div className="flex gap-2 mb-6">
            <Button
              variant={loginMethod === 'password' ? 'default' : 'outline'}
              onClick={() => setLoginMethod('password')}
              className="flex-1 h-12"
            >
              <Icon name="Key" size={18} className="mr-2" />
              Логин/Пароль
            </Button>
            <Button
              variant={loginMethod === 'sms' ? 'default' : 'outline'}
              onClick={() => setLoginMethod('sms')}
              className="flex-1 h-12"
            >
              <Icon name="Smartphone" size={18} className="mr-2" />
              СМС
            </Button>
          </div>

          {loginMethod === 'password' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email или логин
                </label>
                <Input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="h-12"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handlePasswordLogin()}
                />
              </div>

              <Button
                onClick={handlePasswordLogin}
                disabled={isLoading}
                className="w-full h-12 text-base font-semibold"
              >
                {isLoading ? (
                  <Icon name="Loader2" size={20} className="animate-spin" />
                ) : (
                  'Войти'
                )}
              </Button>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs font-semibold text-blue-900 mb-1">Тестовые аккаунты:</p>
                <p className="text-xs text-blue-700">Test1 — Заказчик (3 проекта)</p>
                <p className="text-xs text-blue-700">Test2 — Подрядчик (работы Test1)</p>
                <p className="text-xs text-blue-700">Test3 — Новый заказчик (пустой)</p>
              </div>
            </div>
          ) : step === 'phone' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Номер телефона
                </label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="+7 999 123-45-67"
                  className="h-12 text-base"
                  autoFocus
                />
              </div>

              <Button
                onClick={handleSendSMS}
                disabled={phone.length < 18 || isLoading}
                className="w-full h-12 text-base font-semibold"
              >
                {isLoading ? (
                  <Icon name="Loader2" size={20} className="animate-spin" />
                ) : (
                  'Получить СМС'
                )}
              </Button>

              <p className="text-center text-xs text-slate-500">
                Мы отправим вам код подтверждения
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Код из СМС
                  </label>
                  <button
                    onClick={() => setStep('phone')}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Изменить
                  </button>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Отправлено на {phone}
                </p>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={code}
                  onChange={handleCodeChange}
                  placeholder="••••"
                  className="h-12 text-2xl text-center tracking-widest font-semibold"
                  maxLength={4}
                  autoFocus
                />
              </div>

              <Button
                onClick={handleVerifyCode}
                disabled={code.length < 4 || isLoading}
                className="w-full h-12 text-base font-semibold"
              >
                {isLoading ? (
                  <Icon name="Loader2" size={20} className="animate-spin" />
                ) : (
                  'Войти'
                )}
              </Button>

              <button
                onClick={handleSendSMS}
                className="w-full text-xs text-slate-600 hover:text-slate-900"
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