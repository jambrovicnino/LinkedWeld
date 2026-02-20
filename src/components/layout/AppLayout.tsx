import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileNav } from './MobileNav';
import { useUIStore } from '@/stores/uiStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';

export function AppLayout() {
  const { sidebarCollapsed } = useUIStore();
  const { fetchUnreadCount } = useNotificationStore();

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  return (
    <div className='min-h-screen bg-background'>
      <Sidebar />
      <div className={cn('transition-sidebar', sidebarCollapsed ? 'md:ml-16' : 'md:ml-64')}>
        <Topbar />
        <main className='p-4 md:p-6 pb-20 md:pb-6'>
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
