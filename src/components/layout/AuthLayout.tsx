import { Outlet } from 'react-router-dom';
import { Flame } from 'lucide-react';

export function AuthLayout() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-4'>
      <div className='w-full max-w-md'>
        <div className='flex items-center justify-center gap-2 mb-8'>
          <div className='h-11 w-11 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center'>
            <Flame className='h-6 w-6 text-white' />
          </div>
          <h1 className='text-3xl font-bold text-gray-800'>LinkedWeld</h1>
        </div>
        <div className='bg-white rounded-xl border border-gray-200 shadow-xl shadow-blue-500/5 p-6'>
          <Outlet />
        </div>
        <p className='text-center text-sm text-gray-400 mt-6'>
          Welding Industry Workforce Management
        </p>
      </div>
    </div>
  );
}
