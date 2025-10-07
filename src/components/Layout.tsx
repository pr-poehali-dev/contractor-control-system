import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = user?.role === 'customer' 
    ? [
        { icon: 'LayoutDashboard', label: 'Дашборд', path: '/dashboard' },
        { icon: 'FolderKanban', label: 'Проекты', path: '/projects' },
        { icon: 'AlertTriangle', label: 'Замечания', path: '/defects' },
        { icon: 'ClipboardList', label: 'Журнал действий', path: '/activity' },
        { icon: 'Users', label: 'Подрядчики', path: '/contractors' },
        { icon: 'BarChart3', label: 'Аналитика', path: '/analytics' },
        { icon: 'MessageSquare', label: 'Сообщения', path: '/messages' },
        { icon: 'Settings', label: 'Настройки', path: '/settings' },
      ]
    : [
        { icon: 'LayoutDashboard', label: 'Дашборд', path: '/dashboard' },
        { icon: 'Wrench', label: 'Мои работы', path: '/my-works' },
        { icon: 'ClipboardCheck', label: 'Журнал работ', path: '/work-log' },
        { icon: 'AlertTriangle', label: 'Замечания', path: '/defects' },
        { icon: 'MessageSquare', label: 'Сообщения', path: '/messages' },
        { icon: 'Settings', label: 'Настройки', path: '/settings' },
      ];

  return (
    <div className="flex h-screen bg-slate-50">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#2563EB] to-[#1E40AF] rounded-lg flex items-center justify-center">
              <Icon name="HardHat" className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Подряд-ПРО</h1>
              <p className="text-xs text-slate-500">
                {user?.role === 'customer' ? 'Заказчик' : 'Подрядчик'}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <Button
              key={item.path}
              variant={location.pathname === item.path ? 'default' : 'ghost'}
              className={cn(
                'w-full justify-start',
                location.pathname === item.path && 'bg-[#2563EB] text-white'
              )}
              onClick={() => navigate(item.path)}
            >
              <Icon name={item.icon as any} size={20} className="mr-3" />
              {item.label}
            </Button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start p-2">
                <Avatar className="h-8 w-8 mr-3">
                  <AvatarFallback className="bg-[#2563EB] text-white text-sm">
                    {user?.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-slate-900">{user?.name}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
                <Icon name="ChevronUp" size={16} className="text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Мой аккаунт</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <Icon name="User" size={16} className="mr-2" />
                Профиль
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Icon name="Settings" size={16} className="mr-2" />
                Настройки
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <Icon name="LogOut" size={16} className="mr-2" />
                Выйти
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;