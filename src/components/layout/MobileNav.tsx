import { Link, useLocation } from 'react-router-dom';
import { ROUTES } from '@/router/routes';
import { cn } from '@/lib/utils';
import { LayoutDashboard, FolderKanban, Receipt, FileText, Settings } from 'lucide-react';

const MOBILE_NAV = [
  { label: 'Home', icon: LayoutDashboard, path: ROUTES.DASHBOARD },
  { label: 'Projects', icon: FolderKanban, path: ROUTES.PROJECTS },
  { label: 'Expenses', icon: Receipt, path: ROUTES.EXPENSES },
  { label: 'Docs', icon: FileText, path: ROUTES.DOCUMENTS },
  { label: 'Settings', icon: Settings, path: ROUTES.SETTINGS },
];

export function MobileNav() {
  const location = useLocation();

  return (
    <nav className='fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white md:hidden'>
      <div className='flex items-center justify-around h-16'>
        {MOBILE_NAV.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} className={cn(
              'flex flex-col items-center gap-1 px-3 py-2 text-xs',
              isActive ? 'text-blue-500' : 'text-gray-400'
            )}>
              <item.icon className='h-5 w-5' />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
