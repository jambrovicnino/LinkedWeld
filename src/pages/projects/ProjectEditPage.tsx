import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ROUTES } from '@/router/routes';
import { PROJECT_PHASES, EU_COUNTRIES } from '@/lib/constants';
import { ArrowLeft } from 'lucide-react';
import api from '@/lib/api';
import type { Project } from '@/types';

export function ProjectEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    api.get(`/projects/${id}`).then(r => setProject(r.data.data)).catch(() => navigate(ROUTES.PROJECTS));
  }, [id]);

  const handleSave = async () => {
    if (!project) return;
    setSaving(true);
    try {
      await api.put(`/projects/${id}`, project);
      navigate(ROUTES.PROJECT_DETAIL(id || ''));
    } catch {} finally { setSaving(false); }
  };

  if (!project) return <div className='text-center py-12 text-gray-400'>Loading...</div>;

  const set = (key: string, val: any) => setProject(p => p ? { ...p, [key]: val } : p);

  return (
    <div className='space-y-6 max-w-2xl'>
      <Button variant='ghost' size='sm' onClick={() => navigate(ROUTES.PROJECT_DETAIL(id || ''))}>
        <ArrowLeft className='h-4 w-4 mr-1' /> Back
      </Button>
      <h1 className='text-2xl font-bold text-gray-800'>Edit Project</h1>

      <Card className='shadow-sm'>
        <CardHeader><CardTitle>Project Details</CardTitle></CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-2 gap-3'>
            <div><Label>Name</Label><Input value={project.name || ''} onChange={e => set('name', e.target.value)} /></div>
            <div><Label>Client</Label><Input value={project.client || ''} onChange={e => set('client', e.target.value)} /></div>
          </div>
          <div className='grid grid-cols-2 gap-3'>
            <div><Label>Location</Label><Input value={project.location || ''} onChange={e => set('location', e.target.value)} /></div>
            <div><Label>Country</Label>
              <Select value={project.country || 'Slovenia'} onValueChange={v => set('country', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{EU_COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className='grid grid-cols-2 gap-3'>
            <div><Label>Phase</Label>
              <Select value={project.phase || 'mobilization'} onValueChange={v => set('phase', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PROJECT_PHASES.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Progress (%)</Label><Input type='number' min='0' max='100' value={project.progress || 0} onChange={e => set('progress', parseInt(e.target.value) || 0)} /></div>
          </div>
          <div className='grid grid-cols-2 gap-3'>
            <div><Label>Start Date</Label><Input type='date' value={project.start_date || ''} onChange={e => set('start_date', e.target.value)} /></div>
            <div><Label>Expected End Date</Label><Input type='date' value={project.expected_end_date || ''} onChange={e => set('expected_end_date', e.target.value)} /></div>
          </div>
        </CardContent>
      </Card>

      <Card className='shadow-sm'>
        <CardHeader><CardTitle>Budget (EUR)</CardTitle></CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
            <div><Label>Labor</Label><Input type='number' value={project.budget_labor || 0} onChange={e => set('budget_labor', parseFloat(e.target.value) || 0)} /></div>
            <div><Label>Transport</Label><Input type='number' value={project.budget_transport || 0} onChange={e => set('budget_transport', parseFloat(e.target.value) || 0)} /></div>
            <div><Label>Accommodation</Label><Input type='number' value={project.budget_accommodation || 0} onChange={e => set('budget_accommodation', parseFloat(e.target.value) || 0)} /></div>
            <div><Label>Tools</Label><Input type='number' value={project.budget_tools || 0} onChange={e => set('budget_tools', parseFloat(e.target.value) || 0)} /></div>
            <div><Label>Per Diem</Label><Input type='number' value={project.budget_per_diem || 0} onChange={e => set('budget_per_diem', parseFloat(e.target.value) || 0)} /></div>
            <div><Label>Other</Label><Input type='number' value={project.budget_other || 0} onChange={e => set('budget_other', parseFloat(e.target.value) || 0)} /></div>
          </div>
        </CardContent>
      </Card>

      <Card className='shadow-sm'>
        <CardContent className='p-6'>
          <Label>Notes</Label>
          <Textarea className='mt-2' rows={4} value={project.notes || ''} onChange={e => set('notes', e.target.value)} />
        </CardContent>
      </Card>

      <Button className='w-full' onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  );
}
