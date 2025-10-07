import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (role: 'customer' | 'contractor') => {
    if (!email || !password) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password, role);
      navigate('/dashboard');
      toast({
        title: 'Успешный вход',
        description: `Добро пожаловать!`,
      });
    } catch (error) {
      toast({
        title: 'Ошибка входа',
        description: 'Проверьте логин и пароль',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#2563EB] to-[#1E40AF] rounded-2xl mb-4 shadow-lg">
            <Icon name="HardHat" className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Подряд-ПРО</h1>
          <p className="text-slate-600">Система строительного контроля</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle>Вход в систему</CardTitle>
            <CardDescription>Выберите роль для входа</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="customer" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="customer">
                  <Icon name="UserCheck" size={16} className="mr-2" />
                  Заказчик
                </TabsTrigger>
                <TabsTrigger value="contractor">
                  <Icon name="HardHat" size={16} className="mr-2" />
                  Подрядчик
                </TabsTrigger>
              </TabsList>

              <TabsContent value="customer" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-customer">Email</Label>
                  <Input
                    id="email-customer"
                    type="email"
                    placeholder="inspector@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-customer">Пароль</Label>
                  <Input
                    id="password-customer"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => handleLogin('customer')}
                  disabled={isLoading}
                >
                  {isLoading ? 'Вход...' : 'Войти как заказчик'}
                </Button>
                <p className="text-xs text-slate-500 text-center">
                  Демо: любые данные
                </p>
              </TabsContent>

              <TabsContent value="contractor" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-contractor">Email</Label>
                  <Input
                    id="email-contractor"
                    type="email"
                    placeholder="contractor@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-contractor">Пароль</Label>
                  <Input
                    id="password-contractor"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => handleLogin('contractor')}
                  disabled={isLoading}
                >
                  {isLoading ? 'Вход...' : 'Войти как подрядчик'}
                </Button>
                <p className="text-xs text-slate-500 text-center">
                  Демо: любые данные
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-slate-600">
          <p>© 2025 Подряд-ПРО. Все права защищены.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
