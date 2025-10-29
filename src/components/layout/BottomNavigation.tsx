import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthRedux } from '@/hooks/useAuthRedux';
import { useUnreadNotifications } from '@/hooks/useUnreadNotifications';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/constants/routes';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  roles?: ('customer' | 'contractor' | 'client' | 'admin')[];
}

const mobileNavItems: NavItem[] = [
  { id: 'dashboard', label: 'Главная', icon: 'Home', path: ROUTES.DASHBOARD },
  { id: 'objects', label: 'Объекты', icon: 'Building2', path: ROUTES.OBJECTS, roles: ['client', 'contractor', 'admin'] },
  { id: 'my-tasks', label: 'Мои задачи', icon: 'ClipboardCheck', path: ROUTES.MY_TASKS, roles: ['contractor'] },
  { id: 'defects', label: 'Проверки', icon: 'ClipboardCheck', path: ROUTES.DEFECTS, roles: ['client', 'admin'] },
];

export default function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthRedux();
  const { displayCount, hasUnread } = useUnreadNotifications();

  const visibleNavItems = mobileNavItems
    .filter((item) => !item.roles || item.roles.includes(user?.role as any || 'contractor'))
    .slice(0, 3);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 safe-area-pb">
      <div className="grid h-16" style={{ gridTemplateColumns: `repeat(${visibleNavItems.length}, 1fr)` }}>
        {visibleNavItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path === ROUTES.OBJECTS && location.pathname.startsWith(ROUTES.OBJECTS));

          return (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => navigate(item.path)}
              className={cn(
                'flex flex-col items-center justify-center gap-1 h-full rounded-none relative',
                isActive ? 'text-[#F59E0B]' : 'text-slate-600'
              )}
            >
              <Icon name={item.icon as any} size={24} />
              <span className="text-[11px] font-medium">{item.label}</span>
              {item.id === 'objects' && hasUnread && (
                <span className="absolute top-2 right-1/2 translate-x-3 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full">
                  {displayCount}
                </span>
              )}
            </Button>
          );
        })}
      </div>
    </nav>
  );
}