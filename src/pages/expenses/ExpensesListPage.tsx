import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ROUTES } from '@/router/routes';
import { Plus, Receipt, Download } from 'lucide-react';
const DEMO = [
  { id:1, desc:'Welding electrodes E7018', amount:245, category:'Materials', status:'approved', date:'2026-02-18' },
  { id:2, desc:'Safety goggles (team)', amount:180, category:'Safety', status:'pending', date:'2026-02-17' },
  { id:3, desc:'Travel to Hamburg site', amount:95, category:'Travel', status:'approved', date:'2026-02-15' },
  { id:4, desc:'Argon gas cylinders', amount:320, category:'Materials', status:'pending', date:'2026-02-14' },
];
export function ExpensesListPage() {
  const navigate = useNavigate();
  return (
    <div className='space-y-6'>
      <PageHeader title='Expenses' description='Track and manage project expenses'>
        <Button variant='outline'><Download className='mr-2 h-4 w-4' />Export</Button>
        <Button variant='accent' onClick={() => navigate(ROUTES.EXPENSE_NEW)}><Plus className='mr-2 h-4 w-4' />Add Expense</Button>
      </PageHeader>
      <div className='grid gap-3'>
        {DEMO.map(e => (
          <Card key={e.id} className='cursor-pointer hover:border-accent-500/50 transition-colors' onClick={() => navigate(ROUTES.EXPENSE_DETAIL(e.id))}>
            <CardContent className='p-4 flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                <div className='h-10 w-10 rounded bg-primary/10 flex items-center justify-center'><Receipt className='h-5 w-5 text-accent-500' /></div>
                <div><p className='font-medium text-sm'>{e.desc}</p><div className='flex items-center gap-2 mt-0.5'><Badge variant='outline' className='text-[10px]'>{e.category}</Badge><span className='text-xs text-muted-foreground'>{e.date}</span></div></div>
              </div>
              <div className='flex items-center gap-3'><span className='font-semibold'>EUR {e.amount}</span><StatusBadge status={e.status} /></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
