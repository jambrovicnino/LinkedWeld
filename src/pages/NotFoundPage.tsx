import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Flame } from 'lucide-react';
import { ROUTES } from '@/router/routes';
export function NotFoundPage() {
  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-background'>
      <Flame className='h-16 w-16 text-accent-500 mb-4' />
      <h1 className='text-4xl font-bold mb-2'>404</h1>
      <p className='text-muted-foreground mb-6'>Page not found</p>
      <Button variant='accent' asChild><Link to={ROUTES.DASHBOARD}>Back to Dashboard</Link></Button>
    </div>
  );
}
