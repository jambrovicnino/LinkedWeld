import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/router/routes';
import type { UserRole } from '@/types';
import {
  LayoutDashboard, FolderKanban, Users, UserCircle, Clock, Receipt,
  FileText, Bell, Settings, BarChart3, Briefcase, Search, Shield,
  UserCog, Building, CreditCard, Flame, ChevronLeft, GitCompare,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
}

const NAV_ITEMS: Record<UserRole, NavItem[]> = {
  welder: [
    { label: 'Dashboard', icon: LayoutDashboard, path: ROUTES.DASHBOARD },
    { label: 'My Projects', icon: FolderKanban, path: ROUTES.PROJECTS },
    { label: 'Profile', icon: UserCircle, path: ROUTES.WORKER_PROFILE },
    { label: 'Attendance', icon: Clock, path: ROUTES.ATTENDANCE },
    { label: 'Expenses', icon: Receipt, path: ROUTES.EXPENSES },
    { label: 'Documents', icon: FileText, path: ROUTES.DOCUMENTS },
    { label: 'Notifications', icon: Bell, path: ROUTES.NOTIFICATIONS },
    { label: 'Settings', icon: Settings, path: ROUTES.SETTINGS },
  ],
  subcontractor: [
    { label: 'Dashboard', icon: LayoutDashboard, path: ROUTES.DASHBOARD },
    { label: 'Projects', icon: FolderKanban, path: ROUTES.PROJECTS },
    { label: 'Workers', icon: Users, path: ROUTES.WORKERS },
    { label: 'Expenses', icon: Receipt, path: ROUTES.EXPENSES },
    { label: 'Documents', icon: FileText, path: ROUTES.DOCUMENTS },
    { label: 'Reports', icon: BarChart3, path: ROUTES.REPORTS },
    { label: 'Notifications', icon: Bell, path: ROUTES.NOTIFICATIONS },
    { label: 'Settings', icon: Settings, path: ROUTES.SETTINGS },
  ],
  client: [
    { label: 'Dashboard', icon: LayoutDashboard, path: ROUTES.DASHBOARD },
    { label: 'My Postings', icon: Briefcase, path: ROUTES.CLIENT_POSTINGS },
    { label: 'Find Teams', icon: Search, path: ROUTES.SUBCONTRACTORS },
    { label: 'Matching', icon: GitCompare, path: ROUTES.CLIENT_MATCHING },
    { label: 'Projects', icon: FolderKanban, path: ROUTES.PROJECTS },
    { label: 'Documents', icon: FileText, path: ROUTES.DOCUMENTS },
    { label: 'Reports', icon: BarChart3, path: ROUTES.REPORTS },
    { label: 'Notifications', icon: Bell, path: ROUTES.NOTIFICATIONS },
    { label: 'Settings', icon: Settings, path: ROUTES.SETTINGS },
  ],
  accountant: [
    { label: 'Dashboard', icon: LayoutDashboard, path: ROUTES.DASHBOARD },
    { label: 'Projects', icon: FolderKanban, path: ROUTES.PROJECTS },
    { label: 'Expenses', icon: Receipt, path: ROUTES.EXPENSES },
    { label: 'Documents', icon: FileText, path: ROUTES.DOCUMENTS },
    { label: 'Reports', icon: BarChart3, path: ROUTES.REPORTS },
    { label: 'Billing', icon: CreditCard, path: ROUTES.BILLING },
    { label: 'Notifications', icon: Bell, path: ROUTES.NOTIFICATIONS },
    { label: 'Settings', icon: Settings, path: ROUTES.SETTINGS },
  ],
  admin: [
    { label: 'Dashboard', icon: LayoutDashboard, path: ROUTES.DASHBOARD },
    { label: 'Admin Panel', icon: Shield, path: ROUTES.ADMIN },
    { label: 'Users', icon: UserCog, path: ROUTES.ADMIN_USERS },
    { label: 'Projects', icon: FolderKanban, path: ROUTES.PROJECTS },
    { label: 'Workers', icon: Users, path: ROUTES.WORKERS },
    { label: 'Subcontractors', icon: Building, path: ROUTES.SUBCONTRACTORS },
    { label: 'Expenses', icon: Receipt, path: ROUTES.EXPENSES },
    { label: 'Documents', icon: FileText, path: ROUTES.DOCUMENTS },
    { label: 'Reports', icon: BarChart3, path: ROUTES.REPORTS },
    { label: 'Settings', icon: Settings, path: ROUTES.SETTINGS },
  ],
};

export function Sidebar() {
  const { user } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const location = useLocation();
  const items = user ? NAV_ITEMS[user.role] ?? [] : [];

  return (
    <TooltipProvider delayDuration={0}>
      <aside className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r bg-card transition-sidebar hidden md:block',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}>
        <div className='flex h-14 items-center justify-between px-4 border-b'>
          {!sidebarCollapsed && (
            <Link to={ROUTES.DASHBOARD} className='flex items-center gap-2'>
              <Flame className='h-6 w-6 text-accent-500 shrink-0' />
              <span className='font-bold text-lg'>LinkedWeld</span>
            </Link>
          )}
          {sidebarCollapsed && <Flame className='h-6 w-6 text-accent-500 mx-auto' />}
          <Button variant='ghost' size='icon' onClick={toggleSidebar} className='shrink-0'>
            <ChevronLeft className={cn('h-4 w-4 transition-transform', sidebarCollapsed && 'rotate-180')} />
          </Button>
        </div>
        <ScrollArea className='h-[calc(100vh-3.5rem)]'>
          <nav className='flex flex-col gap-1 p-2'>
            {items.map((item) => {
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
              const link = (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-accent-500'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                    sidebarCollapsed && 'justify-center px-2'
                  )}
                >
                  <item.icon className='h-5 w-5 shrink-0' />
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
          </nav>
        </ScrollArea>
      </aside>
    </TooltipProvider>
  );
}
