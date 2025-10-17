import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  roles?: ('customer' | 'contractor' | 'client' | 'admin')[];
}

const mobileNavItems: NavItem[] = [
  { id: 'dashboard', label: 'Главная', icon: 'Home', path: '/dashboard' },
  { id: 'objects', label: 'Объекты', icon: 'Building2', path: '/objects', roles: ['client', 'contractor', 'admin'] },
  { id: 'my-tasks', label: 'Мои задачи', icon: 'ClipboardCheck', path: '/my-tasks', roles: ['contractor'] },
  { id: 'defects', label: 'Проверки', icon: 'ClipboardCheck', path: '/defects', roles: ['client', 'admin'] },
];

export default function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const visibleNavItems = mobileNavItems
    .filter((item) => !item.roles || item.roles.includes(user?.role as any || 'contractor'))
    .slice(0, 3);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 safe-area-pb">
      <div className="grid h-16" style={{ gridTemplateColumns: `repeat(${visibleNavItems.length}, 1fr)` }}>
        {visibleNavItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path === '/objects' && location.pathname.startsWith('/objects'));

          return (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => navigate(item.path)}
              className={cn(
                'flex flex-col items-center justify-center gap-1 h-full rounded-none',
                isActive ? 'text-[#F59E0B]' : 'text-slate-600'
              )}
            >
              <Icon name={item.icon as any} size={24} />
              <span className="text-[11px] font-medium">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}