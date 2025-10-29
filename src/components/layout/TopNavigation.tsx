import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuthRedux } from '@/hooks/useAuthRedux';
import { useAppSelector } from '@/store/hooks';
import { useUnreadNotifications } from '@/hooks/useUnreadNotifications';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import ProBadgeWithTimer from './ProBadgeWithTimer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ROUTES } from '@/constants/routes';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  roles?: ('client' | 'contractor' | 'admin')[];
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Лента событий', icon: 'LayoutDashboard', path: ROUTES.DASHBOARD, roles: ['client', 'contractor', 'admin'] },
  { id: 'objects', label: 'Объекты', icon: 'Building2', path: ROUTES.OBJECTS, roles: ['client', 'contractor', 'admin'] },
  { id: 'my-tasks', label: 'Мои задачи', icon: 'ClipboardCheck', path: ROUTES.MY_TASKS, roles: ['contractor'] },
  { id: 'admin', label: 'Админ-панель', icon: 'Shield', path: ROUTES.ADMIN, roles: ['admin'] },
  { id: 'work-templates', label: 'Справочник', icon: 'BookOpen', path: ROUTES.WORK_TEMPLATES, roles: ['admin'] },
  { id: 'defects', label: 'Проверки', icon: 'ClipboardCheck', path: ROUTES.DEFECTS, roles: ['client', 'admin'] },
  { id: 'documents', label: 'Документы', icon: 'FileText', path: ROUTES.DOCUMENTS, roles: ['client', 'contractor', 'admin'] },
  { id: 'document-templates', label: 'Шаблоны', icon: 'FileType', path: ROUTES.DOCUMENT_TEMPLATES, roles: ['client', 'contractor', 'admin'] },
  { id: 'analytics', label: 'Аналитика', icon: 'BarChart3', path: ROUTES.ANALYTICS, roles: ['client', 'admin'] },
  { id: 'contractors', label: 'Подрядчики', icon: 'Users', path: ROUTES.CONTRACTORS, roles: ['client', 'admin'] },
];

export default function TopNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthRedux();
  const userData = useAppSelector((state) => state.user.userData);
  const { displayCount, hasUnread } = useUnreadNotifications();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const visibleNavItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(user?.role as any || 'contractor')
  );

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="flex h-16 items-center px-4 md:px-6">
        <div className="flex items-center gap-2 mr-8">
          <div className="md:flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 hidden">
            <Icon name="Building2" size={24} className="text-white" />
          </div>
          <div className="flex md:hidden items-center gap-2">
            {isOnline ? (
              <>
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm text-green-600 font-medium">В сети</span>
              </>
            ) : (
              <>
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-sm text-red-600 font-medium">Оффлайн</span>
              </>
            )}
          </div>
          <span className="font-bold text-lg hidden md:inline">Подряд-ПРО</span>
        </div>

        <nav className="hidden md:flex items-center gap-1 flex-1">
          {visibleNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => navigate(item.path)}
                data-tour={`${item.id}-tab`}
                className={cn(
                  'relative h-12 px-3 md:px-4 gap-2',
                  isActive && 'text-blue-600 bg-blue-50'
                )}
              >
                <Icon name={item.icon as any} size={20} />
                <span className="hidden md:inline font-medium">{item.label}</span>
                {item.id === 'objects' && hasUnread && (
                  <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full">
                    {displayCount}
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                )}
              </Button>
            );
          })}
        </nav>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          {user?.role === 'client' && <ProBadgeWithTimer />}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full p-0 hidden md:flex"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <Icon name="User" size={20} />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <div className="px-2 py-3 bg-gradient-to-br from-blue-50 to-indigo-50 border-b">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md">
                    {getInitials(user?.name || 'U')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{user?.name || 'Пользователь'}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        {user?.role === 'client' && 'Заказчик'}
                        {user?.role === 'contractor' && 'Подрядчик'}
                        {user?.role === 'admin' && 'Администратор'}
                      </Badge>
                    </div>
                    {user?.role === 'contractor' && userData?.contractor?.organization_name && (
                      <p className="text-xs text-slate-600 mt-1 flex items-center truncate">
                        <Icon name="Building" size={12} className="mr-1 flex-shrink-0" />
                        <span className="truncate">{userData.contractor.organization_name}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <DropdownMenuItem onClick={() => navigate(ROUTES.PROFILE)}>
                <Icon name="User" size={16} className="mr-2" />
                Профиль
              </DropdownMenuItem>
              {user?.role === 'contractor' && (
                <DropdownMenuItem onClick={() => navigate(ROUTES.ORGANIZATION)}>
                  <Icon name="Building" size={16} className="mr-2" />
                  Организация
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => navigate(ROUTES.SETTINGS)}>
                <Icon name="Settings" size={16} className="mr-2" />
                Настройки
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <Icon name="LogOut" size={16} className="mr-2" />
                Выход
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            onClick={() => navigate(ROUTES.PROFILE)}
            className="relative h-10 w-10 rounded-full p-0 md:hidden"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <Icon name="User" size={20} />
            </div>
          </Button>
        </div>
      </div>
    </header>
  );
}