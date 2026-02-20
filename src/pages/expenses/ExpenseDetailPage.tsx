import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/router/routes';
import { ArrowLeft } from 'lucide-react';
export function ExpenseDetailPage() {
  const navigate = useNavigate();
  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-4'><Button variant='ghost' size='icon' onClick={() => navigate(ROUTES.EXPENSES)}><ArrowLeft className='h-5 w-5' /></Button><PageHeader title='Expense Detail' /></div>
      <Card><CardContent className='p-6 space-y-4'>
        <div className='flex justify-between'><span className='text-muted-foreground'>Status</span><StatusBadge status='pending' /></div>
        <div className='flex justify-between'><span className='text-muted-foreground'>Amount</span><span className='font-bold text-lg'>EUR 245.00</span></div>
        <div className='flex justify-between'><span className='text-muted-foreground'>Category</span><span>Materials</span></div>
        <div className='flex justify-between'><span className='text-muted-foreground'>Date</span><span>Feb 18, 2026</span></div>
        <div className='flex justify-between'><span className='text-muted-foreground'>Description</span><span>Welding electrodes E7018</span></div>
      </CardContent></Card>
    </div>
  );
}
