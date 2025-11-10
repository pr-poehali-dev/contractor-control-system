import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthRedux } from '@/hooks/useAuthRedux';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { ROUTES } from '@/constants/routes';
import styles from './Register.module.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    organization: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuthRedux();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      toast({
        title: 'Ошибка',
        description: 'Заполните обязательные поля',
        variant: 'destructive',
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Ошибка',
        description: 'Пароли не совпадают',
        variant: 'destructive',
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: 'Ошибка',
        description: 'Пароль должен быть минимум 6 символов',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        password: formData.password,
        organization: formData.organization || undefined,
        role: 'client',
      });
      
      navigate(ROUTES.DASHBOARD);
      toast({
        title: 'Регистрация успешна!',
        description: 'Добро пожаловать в систему',
      });
    } catch (error) {
      toast({
        title: 'Ошибка регистрации',
        description: error instanceof Error ? error.message : 'Попробуйте позже',
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
          <p className={styles.subtitle}>Создание аккаунта заказчика</p>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Регистрация</h2>
          
          <div className={styles.form}>
            <div className={styles.inputGroup}>
              <Label htmlFor="name">Ваше имя *</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Иван Иванов"
                className={styles.input}
                autoFocus
              />
            </div>

            <div className={styles.inputGroup}>
              <Label htmlFor="organization">Организация</Label>
              <Input
                id="organization"
                type="text"
                value={formData.organization}
                onChange={(e) => handleChange('organization', e.target.value)}
                placeholder="ООО &quot;Строй-Инвест&quot;"
                className={styles.input}
              />
            </div>

            <div className={styles.inputGroup}>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="user@example.com"
                className={styles.input}
              />
            </div>

            <div className={styles.inputGroup}>
              <Label htmlFor="phone">Телефон</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+7 999 123-45-67"
                className={styles.input}
              />
            </div>

            <div className={styles.inputGroup}>
              <Label htmlFor="password">Пароль *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="Минимум 6 символов"
                className={styles.input}
              />
            </div>

            <div className={styles.inputGroup}>
              <Label htmlFor="confirmPassword">Подтвердите пароль *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                placeholder="Повторите пароль"
                className={styles.input}
                onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
              />
            </div>

            <Button
              onClick={handleRegister}
              disabled={isLoading}
              className={styles.button}
            >
              {isLoading ? (
                <Icon name="Loader2" size={20} className="animate-spin" />
              ) : (
                <>
                  <Icon name="UserPlus" size={20} className="mr-2" />
                  Зарегистрироваться
                </>
              )}
            </Button>
          </div>

          <div className={styles.infoBox}>
            <p className={styles.infoText}>
              <Icon name="Info" size={16} className={styles.infoIcon} />
              После регистрации вы сможете создавать проекты и приглашать подрядчиков
            </p>
          </div>
        </div>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            Уже есть аккаунт?{' '}
            <button
              onClick={() => navigate(ROUTES.LOGIN)}
              className={styles.footerLink}
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