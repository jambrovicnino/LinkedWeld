import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { StarRating } from '@/components/common/StarRating';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ROUTES } from '@/router/routes';
import { ArrowLeft, Building, MapPin, Users, Globe } from 'lucide-react';
export function SubcontractorDetailPage() {
  const navigate = useNavigate();
  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-4'><Button variant='ghost' size='icon' onClick={() => navigate(ROUTES.SUBCONTRACTORS)}><ArrowLeft className='h-5 w-5' /></Button><PageHeader title='Nordic Welding Co.' description='Subcontractor profile' /></div>
      <div className='grid gap-4 grid-cols-2 sm:grid-cols-4'>
        <Card><CardContent className='p-4 text-center'><p className='text-2xl font-bold text-accent-500'>4.8</p><StarRating rating={5} size='sm' /><p className='text-xs text-muted-foreground mt-1'>24 reviews</p></CardContent></Card>
        <Card><CardContent className='p-4 flex items-center gap-2'><Users className='h-5 w-5 text-accent-500' /><div><p className='text-xs text-muted-foreground'>Team</p><p className='font-medium'>15</p></div></CardContent></Card>
        <Card><CardContent className='p-4 flex items-center gap-2'><MapPin className='h-5 w-5 text-accent-500' /><div><p className='text-xs text-muted-foreground'>Location</p><p className='font-medium'>Rotterdam</p></div></CardContent></Card>
        <Card><CardContent className='p-4 flex items-center gap-2'><Globe className='h-5 w-5 text-accent-500' /><div><p className='text-xs text-muted-foreground'>Years</p><p className='font-medium'>18</p></div></CardContent></Card>
      </div>
      <Tabs defaultValue='about'>
        <TabsList><TabsTrigger value='about'>About</TabsTrigger><TabsTrigger value='team'>Team</TabsTrigger><TabsTrigger value='reviews'>Reviews</TabsTrigger></TabsList>
        <TabsContent value='about'><Card><CardContent className='p-6'><p className='text-muted-foreground'>Leading welding company specializing in maritime and industrial projects across Northern Europe.</p><div className='flex gap-2 mt-3'><Badge>TIG</Badge><Badge>MIG</Badge><Badge>Structural</Badge></div></CardContent></Card></TabsContent>
        <TabsContent value='team'><Card><CardContent className='p-6 text-muted-foreground text-center'>Team roster will appear here.</CardContent></Card></TabsContent>
        <TabsContent value='reviews'><Card><CardContent className='p-6 text-muted-foreground text-center'>Reviews will appear here.</CardContent></Card></TabsContent>
      </Tabs>
    </div>
  );
}
