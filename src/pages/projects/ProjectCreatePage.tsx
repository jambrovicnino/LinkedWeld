import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ROUTES } from '@/router/routes';
import { ArrowLeft, Save } from 'lucide-react';

export function ProjectCreatePage() {
  const navigate = useNavigate();
  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-4'>
        <Button variant='ghost' size='icon' onClick={() => navigate(ROUTES.PROJECTS)}><ArrowLeft className='h-5 w-5' /></Button>
        <PageHeader title='New Project' description='Create a new welding project' />
      </div>
      <Card><CardContent className='p-6 space-y-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='space-y-2'><Label>Project Title</Label><Input placeholder='e.g., Shipyard Phase 2' /></div>
          <div className='space-y-2'><Label>Location</Label><Input placeholder='e.g., Rotterdam Port' /></div>
          <div className='space-y-2'><Label>Status</Label><Select defaultValue='draft'><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value='draft'>Draft</SelectItem><SelectItem value='open'>Open</SelectItem></SelectContent></Select></div>
          <div className='space-y-2'><Label>Priority</Label><Select defaultValue='medium'><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value='low'>Low</SelectItem><SelectItem value='medium'>Medium</SelectItem><SelectItem value='high'>High</SelectItem><SelectItem value='urgent'>Urgent</SelectItem></SelectContent></Select></div>
          <div className='space-y-2'><Label>Start Date</Label><Input type='date' /></div>
          <div className='space-y-2'><Label>End Date</Label><Input type='date' /></div>
          <div className='space-y-2'><Label>Budget (EUR)</Label><Input type='number' placeholder='0.00' /></div>
        </div>
        <div className='space-y-2'><Label>Description</Label><Textarea placeholder='Describe the project scope, requirements, and welding types needed...' rows={4} /></div>
        <div className='flex justify-end gap-3'><Button variant='outline' onClick={() => navigate(ROUTES.PROJECTS)}>Cancel</Button><Button variant='accent'><Save className='mr-2 h-4 w-4' /> Create Project</Button></div>
      </CardContent></Card>
    </div>
  );
}
