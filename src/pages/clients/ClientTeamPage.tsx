import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
export function ClientTeamPage() {
  return (
    <div className='space-y-6'>
      <PageHeader title='Team Approval' description='Review and approve team members' />
      <Card><CardContent className='p-6 space-y-4'>
        {[{n:'Jan de Vries',r:'Lead Welder',s:'pending'},{n:'Pieter Bakker',r:'TIG Specialist',s:'approved'},{n:'Maria Silva',r:'Pipefitter',s:'pending'}].map((w,i)=>(
          <div key={i} className='flex items-center justify-between py-3 border-b last:border-0'>
            <div className='flex items-center gap-3'><Avatar><AvatarFallback className='bg-primary-700 text-white text-xs'>{w.n[0]}</AvatarFallback></Avatar><div><p className='text-sm font-medium'>{w.n}</p><p className='text-xs text-muted-foreground'>{w.r}</p></div></div>
            <div className='flex items-center gap-2'><StatusBadge status={w.s} />{w.s==='pending'&&<><Button size='sm' variant='accent'><Check className='h-3 w-3' /></Button><Button size='sm' variant='outline'><X className='h-3 w-3' /></Button></>}</div>
          </div>
        ))}
      </CardContent></Card>
    </div>
  );
}
