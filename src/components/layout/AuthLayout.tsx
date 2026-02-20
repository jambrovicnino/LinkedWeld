import { Outlet } from 'react-router-dom';
import { Flame } from 'lucide-react';

export function AuthLayout() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 p-4'>
      <div className='w-full max-w-md'>
        <div className='flex items-center justify-center gap-2 mb-8'>
          <Flame className='h-10 w-10 text-accent-500' />
          <h1 className='text-3xl font-bold text-white'>LinkedWeld</h1>
        </div>
        <div className='bg-card rounded-xl border shadow-2xl p-6'>
          <Outlet />
        </div>
        <p className='text-center text-sm text-muted-foreground mt-6'>
          Welding Industry Workforce Management
        </p>
      </div>
    </div>
  );
}
