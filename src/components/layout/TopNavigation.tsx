import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  roles?: ('client' | 'contractor' | 'admin')[];
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Главная', icon: 'LayoutDashboard', path: '/dashboard', roles: ['client', 'admin'] },
  { id: 'objects', label: 'Объекты', icon: 'Building2', path: '/objects', roles: ['contractor', 'admin'] },
  { id: 'projects', label: 'Проекты', icon: 'FolderKanban', path: '/projects', roles: ['client', 'admin'] },
  { id: 'admin', label: 'Админ-панель', icon: 'Shield', path: '/admin', roles: ['admin'] },
  { id: 'work-templates', label: 'Справочник', icon: 'BookOpen', path: '/work-templates', roles: ['client', 'contractor', 'admin'] },
  { id: 'defects', label: 'Замечания', icon: 'AlertTriangle', path: '/defects', roles: ['client', 'contractor', 'admin'] },
  { id: 'analytics', label: 'Аналитика', icon: 'BarChart3', path: '/analytics', roles: ['client', 'admin'] },
  { id: 'contractors', label: 'Подрядчики', icon: 'Users', path: '/contractors', roles: ['client', 'admin'] },
];

export default function TopNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const visibleNavItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(user?.role as any || 'contractor')
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
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
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600">
            <Icon name="Building2" size={24} className="text-white" />
          </div>
          <span className="font-bold text-lg hidden md:inline">Подряд-ПРО</span>
        </div>

        <nav className="flex items-center gap-1 flex-1">
          {visibleNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => navigate(item.path)}
                className={cn(
                  'relative h-12 px-3 md:px-4 gap-2',
                  isActive && 'text-blue-600 bg-blue-50'
                )}
              >
                <Icon name={item.icon as any} size={20} />
                <span className="hidden md:inline font-medium">{item.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                )}
              </Button>
            );
          })}
        </nav>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
                {user ? getInitials(user.name) : 'U'}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="flex items-center gap-3 p-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
                {user ? getInitials(user.name) : 'U'}
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              <Icon name="User" size={16} className="mr-2" />
              Профиль
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <Icon name="Settings" size={16} className="mr-2" />
              Настройки
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/tariffs')}>
              <Icon name="CreditCard" size={16} className="mr-2" />
              Тарифы
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <Icon name="LogOut" size={16} className="mr-2" />
              Выйти
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}