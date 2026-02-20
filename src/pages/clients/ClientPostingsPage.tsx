import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Plus, Calendar, MapPin } from 'lucide-react';
export function ClientPostingsPage() {
  return (
    <div className='space-y-6'>
      <PageHeader title='My Postings' description='Manage your project postings'><Button variant='accent'><Plus className='mr-2 h-4 w-4' />New Posting</Button></PageHeader>
      <div className='grid gap-4 grid-cols-1 md:grid-cols-2'>
        {[{t:'Refinery Maintenance',s:'open',l:'Hamburg',d:'Mar 2026'},{t:'Storage Tank Welding',s:'draft',l:'Antwerp',d:'Apr 2026'}].map((p,i)=>(
          <Card key={i}><CardContent className='p-5'><div className='flex justify-between mb-2'><h3 className='font-semibold'>{p.t}</h3><StatusBadge status={p.s} /></div><div className='text-sm text-muted-foreground space-y-1'><div className='flex items-center gap-1'><MapPin className='h-3 w-3' />{p.l}</div><div className='flex items-center gap-1'><Calendar className='h-3 w-3' />{p.d}</div></div></CardContent></Card>
        ))}
      </div>
    </div>
  );
}
