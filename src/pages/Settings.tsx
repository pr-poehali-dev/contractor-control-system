import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthRedux } from '@/hooks/useAuthRedux';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchOrganizations, selectOrganizations } from '@/store/slices/organizationsSlice';
import { updateProfile } from '@/store/slices/userSlice';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';

const getRoleLabel = (role?: string): string => {
  if (role === 'admin') return 'Администратор';
  if (role === 'client') return 'Заказчик';
  return 'Подрядчик';
};

const Settings = () => {
  const { user, logout, isAuthenticated } = useAuthRedux();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const organizations = useAppSelector(selectOrganizations);
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'contractor') {
      dispatch(fetchOrganizations());
    }
  }, [dispatch, isAuthenticated, user?.role]);
  
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setAvatarUrl(user.avatar_url || '');
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      await dispatch(updateProfile({ name, email, phone, avatar_url: avatarUrl })).unwrap();
      toast.success('Профиль успешно обновлён');
    } catch (error) {
      toast.error('Ошибка при обновлении профиля');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Выберите изображение');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Размер файла не должен превышать 5 МБ');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('https://cdn.poehali.dev/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Ошибка загрузки');

      const data = await response.json();
      const uploadedUrl = data.url;

      setAvatarUrl(uploadedUrl);
      await dispatch(updateProfile({ avatar_url: uploadedUrl })).unwrap();
      toast.success('Аватарка обновлена');
    } catch (error) {
      toast.error('Не удалось загрузить изображение');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="container max-w-4xl mx-auto p-4 md:p-8 pb-24 md:pb-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Настройки</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={() => navigate('/profile')} className="h-10 w-10 rounded-full">
          <Icon name="X" size={20} />
        </Button>
      </div>

      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-6 mb-6">
              <div className="relative group">
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt="Avatar" 
                    className="h-20 w-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold text-2xl">
                    {user ? getInitials(user.name) : 'U'}
                  </div>
                )}
                <label 
                  htmlFor="avatar-upload" 
                  className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Icon name={isUploadingAvatar ? "Loader2" : "Camera"} size={24} className={`text-white ${isUploadingAvatar ? 'animate-spin' : ''}`} />
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={isUploadingAvatar}
                />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-slate-900">{user?.name}</h3>
                <p className="text-slate-600">{user?.email}</p>
                <Badge className="mt-2" variant="outline">
                  {getRoleLabel(user?.role)}
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Имя</Label>
                <Input 
                  id="name" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Введите имя"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Телефон</Label>
                <Input 
                  id="phone" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+7 (999) 123-45-67"
                />
              </div>
              {user?.role === 'contractor' && (
                <div className="grid gap-2">
                  <Label htmlFor="organization">Организация</Label>
                  <Input 
                    id="organization" 
                    value={organizations[0]?.name || 'Не указана'} 
                    disabled
                    className="bg-slate-50"
                  />
                </div>
              )}
            </div>

            <Button 
              className="w-full mt-6" 
              onClick={handleSaveProfile}
              disabled={isLoading}
            >
              <Icon name="Save" size={18} className="mr-2" />
              {isLoading ? 'Сохранение...' : 'Сохранить изменения'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Уведомления</CardTitle>
            <CardDescription>Управление уведомлениями</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email уведомления</Label>
                <p className="text-sm text-slate-600">Получать уведомления на почту</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Push уведомления</Label>
                <p className="text-sm text-slate-600">Уведомления в браузере</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Новые замечания</Label>
                <p className="text-sm text-slate-600">Уведомлять о новых замечаниях</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Обновления проектов</Label>
                <p className="text-sm text-slate-600">Уведомлять об изменениях</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Безопасность</CardTitle>
            <CardDescription>Управление безопасностью аккаунта</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Icon name="Lock" size={18} className="mr-2" />
              Сменить пароль
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Icon name="Shield" size={18} className="mr-2" />
              Двухфакторная аутентификация
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Icon name="Smartphone" size={18} className="mr-2" />
              Активные сеансы
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Дополнительно</CardTitle>
            <CardDescription>Дополнительные возможности</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {user?.role === 'client' && (
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/pricing')}>
                <Icon name="Gem" size={18} className="mr-2" />
                Тарифы и подписка
              </Button>
            )}
            <Button variant="outline" className="w-full justify-start">
              <Icon name="FileDown" size={18} className="mr-2" />
              Экспорт данных
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Icon name="Download" size={18} className="mr-2" />
              Скачать отчёт
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Icon name="HelpCircle" size={18} className="mr-2" />
              Помощь и поддержка
            </Button>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50/50">
          <CardHeader>
            <CardTitle className="text-red-900">Опасная зона</CardTitle>
            <CardDescription className="text-red-700">Действия, требующие подтверждения</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start border-red-200 text-red-700 hover:bg-red-100 hover:text-red-900"
              onClick={handleLogout}
            >
              <Icon name="LogOut" size={18} className="mr-2" />
              Выйти из системы
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start border-red-200 text-red-700 hover:bg-red-100 hover:text-red-900"
            >
              <Icon name="Trash2" size={18} className="mr-2" />
              Удалить аккаунт
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;