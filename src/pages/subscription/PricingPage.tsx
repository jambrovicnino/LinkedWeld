import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
const PLANS = [
  { name:'Free', price:0, features:['Basic profile','2 projects','Limited search','100MB storage'], current:false },
  { name:'Pro', price:29, features:['Full profile + certifications','10 projects','GPS check-in','1GB storage','In-app messaging'], current:false },
  { name:'Business', price:79, features:['Team management','Unlimited projects','Expense approval workflows','10GB storage','Reports & analytics'], current:true },
  { name:'Enterprise', price:199, features:['Everything in Business','API access','Custom reports','Unlimited storage','Priority support','Role-based access control'], current:false },
];
export function PricingPage() {
  return (
    <div className='space-y-6'>
      <PageHeader title='Pricing Plans' description='Choose the plan that fits your needs' />
      <div className='grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'>
        {PLANS.map(p=>(
          <Card key={p.name} className={p.current ? 'border-accent-500 ring-2 ring-accent-500/20' : ''}>
            <CardHeader className='text-center'>
              {p.current && <Badge variant='accent' className='w-fit mx-auto mb-2'>Current Plan</Badge>}
              <CardTitle>{p.name}</CardTitle>
              <div className='mt-2'><span className='text-3xl font-bold'>EUR {p.price}</span><span className='text-muted-foreground'>/mo</span></div>
            </CardHeader>
            <CardContent className='space-y-4'>
              <ul className='space-y-2'>
                {p.features.map(f=>(<li key={f} className='flex items-center gap-2 text-sm'><Check className='h-4 w-4 text-green-500 shrink-0' />{f}</li>))}
              </ul>
              <Button variant={p.current ? 'outline' : 'accent'} className='w-full' disabled={p.current}>{p.current ? 'Current Plan' : 'Upgrade'}</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
