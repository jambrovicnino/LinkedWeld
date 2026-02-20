import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/router/routes';
import {
  LayoutDashboard, AlertTriangle, Users, GitBranch,
  FolderKanban, Receipt, Bell, Settings, Flame,
  ChevronLeft, LogOut,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'OVERVIEW',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, path: ROUTES.DASHBOARD },
      { label: 'Alerts', icon: AlertTriangle, path: ROUTES.ALERTS },
    ],
  },
  {
    title: 'WORKFORCE',
    items: [
      { label: 'Workers', icon: Users, path: ROUTES.WORKERS },
      { label: 'Pipeline', icon: GitBranch, path: ROUTES.PIPELINE },
    ],
  },
  {
    title: 'PROJECTS',
    items: [
      { label: 'Projects', icon: FolderKanban, path: ROUTES.PROJECTS },
    ],
  },
  {
    title: 'FINANCES',
    items: [
      { label: 'Expenses', icon: Receipt, path: ROUTES.EXPENSES },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      { label: 'Notifications', icon: Bell, path: ROUTES.NOTIFICATIONS },
      { label: 'Settings', icon: Settings, path: ROUTES.SETTINGS },
    ],
  },
];

export function Sidebar() {
  const { user, logout } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const location = useLocation();

  return (
    <TooltipProvider delayDuration={0}>
      <aside className={cn(
        'fixed left-0 top-0 z-40 h-screen sidebar-gradient transition-sidebar hidden md:flex md:flex-col shadow-xl',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}>
        <div className='flex h-16 items-center justify-between px-4 border-b border-white/10'>
          {!sidebarCollapsed && (
            <Link to={ROUTES.DASHBOARD} className='flex items-center gap-2.5'>
              <div className='h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center'>
                <Flame className='h-5 w-5 text-white' />
              </div>
              <span className='font-bold text-lg text-white'>LinkedWeld</span>
            </Link>
          )}
          {sidebarCollapsed && (
            <div className='mx-auto h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center'>
              <Flame className='h-5 w-5 text-white' />
            </div>
          )}
          {!sidebarCollapsed && (
            <Button variant='ghost' size='icon' onClick={toggleSidebar}
              className='shrink-0 text-white/60 hover:text-white hover:bg-white/10 h-8 w-8'>
              <ChevronLeft className='h-4 w-4' />
            </Button>
          )}
        </div>

        {sidebarCollapsed && (
          <Button variant='ghost' size='icon' onClick={toggleSidebar}
            className='mx-auto mt-2 text-white/60 hover:text-white hover:bg-white/10 h-8 w-8'>
            <ChevronLeft className='h-4 w-4 rotate-180' />
          </Button>
        )}

        <ScrollArea className='flex-1'>
          <nav className='px-3 py-4 space-y-5'>
            {NAV_GROUPS.map((group) => (
              <div key={group.title}>
                {!sidebarCollapsed && (
                  <p className='px-3 mb-2 text-[10px] font-semibold tracking-widest text-white/40 uppercase'>
                    {group.title}
                  </p>
                )}
                {sidebarCollapsed && <div className='mb-1 mx-auto w-6 border-t border-white/10' />}
                <div className='space-y-0.5'>
                  {group.items.map((item) => {
                    const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                    const link = (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
                          isActive
                            ? 'bg-white/20 text-white shadow-sm'
                            : 'text-white/70 hover:bg-white/10 hover:text-white',
                          sidebarCollapsed && 'justify-center px-2'
                        )}
                      >
                        <item.icon className='h-[18px] w-[18px] shrink-0' />
                        {!sidebarCollapsed && <span>{item.label}</span>}
                      </Link>
                    );
                    if (sidebarCollapsed) {
                      return (
                        <Tooltip key={item.path}>
                          <TooltipTrigger asChild>{link}</TooltipTrigger>
                          <TooltipContent side='right'>{item.label}</TooltipContent>
                        </Tooltip>
                      );
                    }
                    return link;
                  })}
                </div>
              </div>
            ))}
          </nav>
        </ScrollArea>

        {user && !sidebarCollapsed && (
          <div className='border-t border-white/10 p-4 space-y-3'>
            <div className='flex items-center gap-3'>
              <div className='h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-semibold text-white'>
                {(user.firstName?.[0] ?? '').toUpperCase()}{(user.lastName?.[0] ?? '').toUpperCase()}
              </div>
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium text-white truncate'>{user.firstName} {user.lastName}</p>
                <p className='text-xs text-white/50 truncate capitalize'>{user.role}</p>
              </div>
            </div>
            <button onClick={() => logout()}
              className='flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors w-full px-1'>
              <LogOut className='h-4 w-4' /><span>Logout</span>
            </button>
          </div>
        )}
      </aside>
    </TooltipProvider>
  );
}
