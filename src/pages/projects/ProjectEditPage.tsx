import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ROUTES } from '@/router/routes';
import { ArrowLeft, Save } from 'lucide-react';

export function ProjectEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-4'>
        <Button variant='ghost' size='icon' onClick={() => navigate(ROUTES.PROJECT_DETAIL(id || '1'))}><ArrowLeft className='h-5 w-5' /></Button>
        <PageHeader title='Edit Project' description='Update project details' />
      </div>
      <Card><CardContent className='p-6 space-y-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='space-y-2'><Label>Project Title</Label><Input defaultValue='Shipyard Phase 2' /></div>
          <div className='space-y-2'><Label>Location</Label><Input defaultValue='Rotterdam Port' /></div>
          <div className='space-y-2'><Label>Status</Label><Select defaultValue='in_progress'><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value='draft'>Draft</SelectItem><SelectItem value='open'>Open</SelectItem><SelectItem value='in_progress'>In Progress</SelectItem><SelectItem value='on_hold'>On Hold</SelectItem><SelectItem value='completed'>Completed</SelectItem></SelectContent></Select></div>
          <div className='space-y-2'><Label>Priority</Label><Select defaultValue='high'><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value='low'>Low</SelectItem><SelectItem value='medium'>Medium</SelectItem><SelectItem value='high'>High</SelectItem><SelectItem value='urgent'>Urgent</SelectItem></SelectContent></Select></div>
          <div className='space-y-2'><Label>Start Date</Label><Input type='date' defaultValue='2026-01-15' /></div>
          <div className='space-y-2'><Label>End Date</Label><Input type='date' defaultValue='2026-04-30' /></div>
          <div className='space-y-2'><Label>Budget (EUR)</Label><Input type='number' defaultValue='45000' /></div>
          <div className='space-y-2'><Label>Progress (%)</Label><Input type='number' defaultValue='75' min='0' max='100' /></div>
        </div>
        <div className='space-y-2'><Label>Description</Label><Textarea defaultValue='Phase 2 of the Rotterdam shipyard welding project.' rows={4} /></div>
        <div className='flex justify-end gap-3'><Button variant='outline' onClick={() => navigate(ROUTES.PROJECT_DETAIL(id || '1'))}>Cancel</Button><Button variant='accent'><Save className='mr-2 h-4 w-4' /> Save Changes</Button></div>
      </CardContent></Card>
    </div>
  );
}
