import { ReactNode } from 'react';
import TopNavigation from '@/components/layout/TopNavigation';
import BottomNavigation from '@/components/layout/BottomNavigation';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <TopNavigation />
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        {children}
      </main>
      <BottomNavigation />
    </div>
  );
};

export default Layout;