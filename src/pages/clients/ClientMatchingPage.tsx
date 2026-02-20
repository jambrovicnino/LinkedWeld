import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { StarRating } from '@/components/common/StarRating';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building, Check } from 'lucide-react';
export function ClientMatchingPage() {
  return (
    <div className='space-y-6'>
      <PageHeader title='Team Matching' description='Find the best teams for your projects' />
      <div className='grid gap-4 grid-cols-1 md:grid-cols-2'>
        {[{c:'Nordic Welding Co.',r:4.8,t:15,m:95},{c:'Baltic Pipe Solutions',r:4.5,t:8,m:82}].map((s,i)=>(
          <Card key={i}><CardContent className='p-5 flex items-start gap-4'><div className='h-12 w-12 rounded bg-primary/10 flex items-center justify-center shrink-0'><Building className='h-6 w-6 text-accent-500' /></div><div className='flex-1'><div className='flex justify-between'><h3 className='font-semibold'>{s.c}</h3><Badge variant='accent'>{s.m}% match</Badge></div><StarRating rating={Math.round(s.r)} size='sm' /><p className='text-xs text-muted-foreground mt-1'>{s.t} workers available</p><Button variant='outline' size='sm' className='mt-2'><Check className='mr-1 h-3 w-3' />Request Team</Button></div></CardContent></Card>
        ))}
      </div>
    </div>
  );
}
