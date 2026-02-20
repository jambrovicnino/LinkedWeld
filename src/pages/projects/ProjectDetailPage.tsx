import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ROUTES } from '@/router/routes';
import { ArrowLeft, Edit, MapPin, Calendar, Users, DollarSign, CheckCircle } from 'lucide-react';

export function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-4'>
        <Button variant='ghost' size='icon' onClick={() => navigate(ROUTES.PROJECTS)}><ArrowLeft className='h-5 w-5' /></Button>
        <PageHeader title='Shipyard Phase 2' description='Project details and management'>
          <StatusBadge status='in_progress' />
          <Button variant='outline' onClick={() => navigate(ROUTES.PROJECT_EDIT(id || '1'))}><Edit className='mr-2 h-4 w-4' /> Edit</Button>
        </PageHeader>
      </div>

      <div className='grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'>
        <Card><CardContent className='p-4 flex items-center gap-3'><MapPin className='h-5 w-5 text-accent-500' /><div><p className='text-xs text-muted-foreground'>Location</p><p className='text-sm font-medium'>Rotterdam Port</p></div></CardContent></Card>
        <Card><CardContent className='p-4 flex items-center gap-3'><Calendar className='h-5 w-5 text-accent-500' /><div><p className='text-xs text-muted-foreground'>Timeline</p><p className='text-sm font-medium'>Jan 15 - Apr 30</p></div></CardContent></Card>
        <Card><CardContent className='p-4 flex items-center gap-3'><Users className='h-5 w-5 text-accent-500' /><div><p className='text-xs text-muted-foreground'>Team</p><p className='text-sm font-medium'>8 Workers</p></div></CardContent></Card>
        <Card><CardContent className='p-4 flex items-center gap-3'><DollarSign className='h-5 w-5 text-accent-500' /><div><p className='text-xs text-muted-foreground'>Budget</p><p className='text-sm font-medium'>EUR 45,000</p></div></CardContent></Card>
      </div>

      <div className='space-y-1'>
        <div className='flex justify-between text-sm'><span>Overall Progress</span><span className='font-medium'>75%</span></div>
        <Progress value={75} className='h-3' />
      </div>

      <Tabs defaultValue='overview'>
        <TabsList>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='team'>Team</TabsTrigger>
          <TabsTrigger value='milestones'>Milestones</TabsTrigger>
          <TabsTrigger value='documents'>Documents</TabsTrigger>
          <TabsTrigger value='expenses'>Expenses</TabsTrigger>
        </TabsList>
        <TabsContent value='overview'>
          <Card><CardHeader><CardTitle>Project Description</CardTitle></CardHeader><CardContent>
            <p className='text-muted-foreground'>Phase 2 of the Rotterdam shipyard welding project. Involves structural welding of hull sections and pipe fitting for the engine room. Requires certified TIG and MIG welders with maritime experience.</p>
            <Separator className='my-4' />
            <div className='grid grid-cols-2 gap-4 text-sm'>
              <div><span className='text-muted-foreground'>Welding Types:</span><div className='flex gap-1 mt-1'><Badge>TIG</Badge><Badge>MIG</Badge></div></div>
              <div><span className='text-muted-foreground'>Priority:</span><div className='mt-1'><Badge variant='destructive'>High</Badge></div></div>
            </div>
          </CardContent></Card>
        </TabsContent>
        <TabsContent value='team'>
          <Card><CardContent className='p-6 space-y-3'>
            {['Jan de Vries - Lead Welder', 'Pieter Bakker - TIG Specialist', 'Maria Silva - Pipefitter'].map((w, i) => (
              <div key={i} className='flex items-center justify-between py-2 border-b last:border-0'>
                <div className='flex items-center gap-3'><div className='h-8 w-8 rounded-full bg-primary-700 flex items-center justify-center text-xs text-white font-medium'>{w[0]}</div><span className='text-sm'>{w}</span></div>
                <StatusBadge status='active' />
              </div>
            ))}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value='milestones'>
          <Card><CardContent className='p-6 space-y-3'>
            {[{ title: 'Hull Section A Complete', done: true }, { title: 'Pipe System Installation', done: true }, { title: 'Engine Room Welding', done: false }, { title: 'Final Inspection', done: false }].map((m, i) => (
              <div key={i} className='flex items-center gap-3 py-2'>
                <CheckCircle className={m.done ? 'h-5 w-5 text-green-500' : 'h-5 w-5 text-muted-foreground'} />
                <span className={m.done ? 'text-sm line-through text-muted-foreground' : 'text-sm'}>{m.title}</span>
              </div>
            ))}
          </CardContent></Card>
        </TabsContent>
        <TabsContent value='documents'><Card><CardContent className='p-6 text-center text-muted-foreground'>No documents attached yet.</CardContent></Card></TabsContent>
        <TabsContent value='expenses'><Card><CardContent className='p-6 text-center text-muted-foreground'>No expenses recorded yet.</CardContent></Card></TabsContent>
      </Tabs>
    </div>
  );
}
