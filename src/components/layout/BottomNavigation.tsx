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
  roles?: ('customer' | 'contractor')[];
}

const mobileNavItems: NavItem[] = [
  { id: 'projects', label: 'Проекты', icon: 'Folder', path: '/projects', roles: ['customer'] },
  { id: 'objects', label: 'Главная', icon: 'Home', path: '/objects', roles: ['contractor'] },
  { id: 'objects-customer', label: 'Главная', icon: 'Home', path: '/objects', roles: ['customer'] },
  { id: 'defects', label: 'Задачи', icon: 'ListTodo', path: '/defects', roles: ['customer', 'contractor'] },
];

export default function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const visibleNavItems = mobileNavItems
    .filter((item) => !item.roles || item.roles.includes(user?.role || 'contractor'))
    .slice(0, 3);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 safe-area-pb">
      <div className="grid h-16" style={{ gridTemplateColumns: `repeat(${visibleNavItems.length}, 1fr)` }}>
        {visibleNavItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path === '/objects' && location.pathname.startsWith('/projects'));

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