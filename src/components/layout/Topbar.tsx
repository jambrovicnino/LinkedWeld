import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { useNavigate } from 'react-router-dom';
import { Bell, Menu, Search, LogOut, Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getInitials } from '@/lib/utils';
import { ROUTES } from '@/router/routes';

export function Topbar() {
  const { user, logout } = useAuthStore();
  const { toggleMobileMenu } = useUIStore();
  const { unreadCount } = useNotificationStore();
  const navigate = useNavigate();

  return (
    <header className='sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 px-4 md:px-6'>
      <Button variant='ghost' size='icon' className='md:hidden' onClick={toggleMobileMenu}>
        <Menu className='h-5 w-5' />
      </Button>

      <div className='flex-1 flex items-center gap-4'>
        <div className='relative hidden md:block w-full max-w-sm'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <Input placeholder='Search projects, workers...' className='pl-9 bg-secondary border-0' />
        </div>
      </div>

      <div className='flex items-center gap-2'>
        <Button variant='ghost' size='icon' className='relative' onClick={() => navigate(ROUTES.NOTIFICATIONS)}>
          <Bell className='h-5 w-5' />
          {unreadCount > 0 && (
            <Badge variant='accent' className='absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]'>
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='relative h-9 w-9 rounded-full'>
              <Avatar className='h-9 w-9'>
                <AvatarImage src={user?.avatarUrl} alt={user?.firstName} />
                <AvatarFallback className='bg-primary-700 text-white text-xs'>
                  {user ? getInitials(user.firstName, user.lastName) : '??'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className='w-56' align='end'>
            <DropdownMenuLabel className='font-normal'>
              <div className='flex flex-col space-y-1'>
                <p className='text-sm font-medium'>{user?.firstName} {user?.lastName}</p>
                <p className='text-xs text-muted-foreground'>{user?.email}</p>
                <Badge variant='outline' className='w-fit text-[10px] capitalize'>{user?.role}</Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate(ROUTES.SETTINGS)}>
              <Settings className='mr-2 h-4 w-4' /><span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(ROUTES.WORKER_PROFILE)}>
              <User className='mr-2 h-4 w-4' /><span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => { logout(); navigate(ROUTES.LOGIN); }}>
              <LogOut className='mr-2 h-4 w-4' /><span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
