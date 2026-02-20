import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ROUTES } from '@/router/routes';
import { ArrowLeft, Award, MapPin, Clock } from 'lucide-react';
export function WorkerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-4'>
        <Button variant='ghost' size='icon' onClick={() => navigate(ROUTES.WORKERS)}><ArrowLeft className='h-5 w-5' /></Button>
        <PageHeader title='Jan de Vries' description='Worker profile' />
      </div>
      <div className='grid gap-4 grid-cols-1 sm:grid-cols-3'>
        <Card><CardContent className='p-4 flex items-center gap-3'><MapPin className='h-5 w-5 text-accent-500' /><div><p className='text-xs text-muted-foreground'>Location</p><p className='text-sm font-medium'>Rotterdam</p></div></CardContent></Card>
        <Card><CardContent className='p-4 flex items-center gap-3'><Clock className='h-5 w-5 text-accent-500' /><div><p className='text-xs text-muted-foreground'>Experience</p><p className='text-sm font-medium'>12 years</p></div></CardContent></Card>
        <Card><CardContent className='p-4 flex items-center gap-3'><Award className='h-5 w-5 text-accent-500' /><div><p className='text-xs text-muted-foreground'>Certs</p><p className='text-sm font-medium'>5 active</p></div></CardContent></Card>
      </div>
      <Tabs defaultValue='profile'>
        <TabsList><TabsTrigger value='profile'>Profile</TabsTrigger><TabsTrigger value='certs'>Certifications</TabsTrigger><TabsTrigger value='attendance'>Attendance</TabsTrigger></TabsList>
        <TabsContent value='profile'><Card><CardContent className='p-6'><p className='text-muted-foreground'>Experienced TIG and MIG welder.</p><div className='flex gap-2 mt-3'><Badge>TIG</Badge><Badge>MIG</Badge></div></CardContent></Card></TabsContent>
        <TabsContent value='certs'><Card><CardContent className='p-6 space-y-3'>{['AWS D1.1','EN ISO 9606-1','ASME IX'].map((c,i) => (<div key={i} className='flex items-center justify-between py-2 border-b last:border-0'><span className='text-sm'>{c}</span><Badge variant='success'>Active</Badge></div>))}</CardContent></Card></TabsContent>
        <TabsContent value='attendance'><Card><CardContent className='p-6 text-center text-muted-foreground'>Attendance records here.</CardContent></Card></TabsContent>
      </Tabs>
    </div>
  );
}
