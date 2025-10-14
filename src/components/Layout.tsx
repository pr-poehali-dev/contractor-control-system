import { ReactNode } from 'react';
import TopNavigation from '@/components/layout/TopNavigation';
import BottomNavigation from '@/components/layout/BottomNavigation';
import DiscountTimer from '@/components/pricing/DiscountTimer';
import { useAuth } from '@/contexts/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <TopNavigation />
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        {children}
      </main>
      <BottomNavigation />
      
      {user?.role === 'client' && <DiscountTimer />}
    </div>
  );
};

export default Layout;