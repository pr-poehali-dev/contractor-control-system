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
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [devCode, setDevCode] = useState('');
  const { loginWithPhone } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSendCode = async () => {
    if (!phone) {
      toast({
        title: 'Ошибка',
        description: 'Введите номер телефона',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/ff8b8a8a-815e-455b-a052-81b59ae4cab2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsCodeSent(true);
        setDevCode(data.dev_code);
        toast({
          title: 'Код отправлен',
          description: `Код для разработки: ${data.dev_code}`,
        });
      } else {
        throw new Error(data.error || 'Ошибка отправки кода');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось отправить код',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code) {
      toast({
        title: 'Ошибка',
        description: 'Введите код подтверждения',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    try {
      await loginWithPhone(phone, code);
      navigate('/dashboard');
      toast({
        title: 'Добро пожаловать!',
        description: 'Вы успешно вошли в систему',
      });
    } catch (error) {
      toast({
        title: 'Ошибка входа',
        description: error instanceof Error ? error.message : 'Неверный код',
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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Подряд-ПРО</h1>
          <p className="text-slate-600 text-lg">Контроль подрядчиков</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Вход в систему</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Номер телефона
              </label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+7 (999) 123-45-67"
                className="h-12"
                autoFocus
                disabled={isCodeSent}
                onKeyDown={(e) => e.key === 'Enter' && !isCodeSent && handleSendCode()}
              />
            </div>

            {isCodeSent && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Код подтверждения
                </label>
                <Input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="123456"
                  className="h-12"
                  maxLength={6}
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleVerifyCode()}
                />
                {devCode && (
                  <p className="text-xs text-slate-500 mt-1">
                    Код для разработки: {devCode}
                  </p>
                )}
              </div>
            )}

            {!isCodeSent ? (
              <Button
                onClick={handleSendCode}
                disabled={isLoading}
                className="w-full h-12 text-base font-semibold"
              >
                {isLoading ? (
                  <Icon name="Loader2" size={20} className="animate-spin" />
                ) : (
                  'Получить код'
                )}
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleVerifyCode}
                  disabled={isLoading}
                  className="w-full h-12 text-base font-semibold"
                >
                  {isLoading ? (
                    <Icon name="Loader2" size={20} className="animate-spin" />
                  ) : (
                    'Войти'
                  )}
                </Button>
                <Button
                  onClick={() => {
                    setIsCodeSent(false);
                    setCode('');
                    setDevCode('');
                  }}
                  variant="outline"
                  className="w-full h-12 text-base"
                >
                  Изменить номер
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="mt-4 text-center text-xs text-slate-500">
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
