import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreditCard, Calendar, Receipt } from 'lucide-react';
export function BillingPage() {
  return (
    <div className='space-y-6'>
      <PageHeader title='Billing' description='Manage your subscription and payments' />
      <div className='grid gap-4 grid-cols-1 md:grid-cols-3'>
        <Card><CardContent className='p-4 flex items-center gap-3'><CreditCard className='h-5 w-5 text-accent-500' /><div><p className='text-xs text-muted-foreground'>Current Plan</p><p className='font-medium'>Business - EUR 79/mo</p></div></CardContent></Card>
        <Card><CardContent className='p-4 flex items-center gap-3'><Calendar className='h-5 w-5 text-accent-500' /><div><p className='text-xs text-muted-foreground'>Next Billing</p><p className='font-medium'>Mar 20, 2026</p></div></CardContent></Card>
        <Card><CardContent className='p-4 flex items-center gap-3'><Receipt className='h-5 w-5 text-accent-500' /><div><p className='text-xs text-muted-foreground'>Payment Method</p><p className='font-medium'>Visa ending 4242</p></div></CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle>Billing History</CardTitle></CardHeader><CardContent>
        <table className='w-full text-sm'>
          <thead><tr className='border-b'><th className='text-left p-2'>Date</th><th className='text-left p-2'>Description</th><th className='text-left p-2'>Amount</th><th className='text-left p-2'>Status</th></tr></thead>
          <tbody>
            {[{d:'Feb 20',desc:'Business Plan',a:'EUR 79',s:'paid'},{d:'Jan 20',desc:'Business Plan',a:'EUR 79',s:'paid'},{d:'Dec 20',desc:'Pro Plan',a:'EUR 29',s:'paid'}].map((r,i)=>(
              <tr key={i} className='border-b last:border-0'><td className='p-2'>{r.d}</td><td className='p-2'>{r.desc}</td><td className='p-2 font-medium'>{r.a}</td><td className='p-2'><Badge variant='success'>Paid</Badge></td></tr>
            ))}
          </tbody>
        </table>
      </CardContent></Card>
    </div>
  );
}
