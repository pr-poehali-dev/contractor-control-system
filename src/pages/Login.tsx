import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthRedux } from '@/hooks/useAuthRedux';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/api/apiClient';
import { ENDPOINTS } from '@/api/endpoints';
import { ROUTES } from '@/constants/routes';
import styles from './Login.module.css';

const Login = () => {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [devCode, setDevCode] = useState('');
  const { loginWithPhone, login } = useAuthRedux();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSendCode = async () => {
    if (!phone) {
      toast({
        title: 'Ошибка',
        description: 'Введите номер телефона или "admin"',
        variant: 'destructive',
      });
      return;
    }
    
    if (phone.toLowerCase() === 'admin') {
      setIsLoading(true);
      try {
        await login('admin@example.com', 'admin123');
        navigate(ROUTES.DASHBOARD);
        toast({
          title: 'Добро пожаловать, Администратор!',
          description: 'Вы вошли как администратор',
        });
      } catch (error) {
        toast({
          title: 'Ошибка входа',
          description: error instanceof Error ? error.message : 'Не удалось войти',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await apiClient.post(ENDPOINTS.AUTH.SEND_CODE, { phone });

      if (response.success) {
        setIsCodeSent(true);
        setDevCode(response.data?.dev_code);
        toast({
          title: 'Код отправлен',
          description: `Код для разработки: ${response.data?.dev_code}`,
        });
      } else {
        throw new Error(response.error || 'Ошибка отправки кода');
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
      navigate(ROUTES.DASHBOARD);
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
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <div className={styles.logoWrapper}>
            <Icon name="Building2" size={40} className={styles.logoIcon} />
          </div>
          <h1 className={styles.title}>Подряд-ПРО</h1>
          <p className={styles.subtitle}>Контроль подрядчиков</p>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Вход в систему</h2>
          
          <div className={styles.form}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>
                Номер телефона
              </label>
              <Input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+7 (999) 123-45-67 или admin"
                className={styles.input}
                autoFocus
                disabled={isCodeSent}
                onKeyDown={(e) => e.key === 'Enter' && !isCodeSent && handleSendCode()}
              />
            </div>

            {isCodeSent && (
              <div className={styles.inputGroup}>
                <label className={styles.label}>
                  Код подтверждения
                </label>
                <Input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="123456"
                  className={styles.input}
                  maxLength={6}
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleVerifyCode()}
                />
                {devCode && (
                  <p className={styles.devCode}>
                    Код для разработки: {devCode}
                  </p>
                )}
              </div>
            )}

            {!isCodeSent ? (
              <Button
                onClick={handleSendCode}
                disabled={isLoading}
                className={styles.button}
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
                  className={styles.button}
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
                  className={styles.buttonOutline}
                >
                  Изменить номер
                </Button>
              </>
            )}
          </div>
        </div>

        <div className={styles.footer}>
          <Button
            onClick={async () => {
              try {
                setIsLoading(true);
                await login('admin@example.com', 'admin123');
                navigate(ROUTES.DASHBOARD);
              } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                console.error('Quick admin login failed:', errorMessage);
                toast({
                  title: 'Ошибка входа',
                  description: 'Не удалось войти как администратор',
                  variant: 'destructive'
                });
              } finally {
                setIsLoading(false);
              }
            }}
            variant="outline"
            className={styles.buttonOutline}
            disabled={isLoading}
          >
            Быстрый вход (admin)
          </Button>
          
          <div className={styles.terms}>
            <p>
              Входя в систему, вы соглашаетесь с{' '}
              <a href="#" className={styles.termsLink}>
                условиями использования
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;