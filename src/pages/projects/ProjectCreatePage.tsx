import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

export function ProjectCreatePage() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', client: '', location: '', country: 'Slovenia', phase: 'mobilization',
    startDate: '', expectedEndDate: '', notes: '',
    budgetLabor: '', budgetTransport: '', budgetAccommodation: '',
    budgetTools: '', budgetPerDiem: '', budgetOther: '',
  });

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.post('/projects', {
        name: form.name, client: form.client, location: form.location,
        country: form.country, phase: form.phase,
        start_date: form.startDate || null, expected_end_date: form.expectedEndDate || null,
        budget_labor: parseFloat(form.budgetLabor) || 0,
        budget_transport: parseFloat(form.budgetTransport) || 0,
        budget_accommodation: parseFloat(form.budgetAccommodation) || 0,
        budget_tools: parseFloat(form.budgetTools) || 0,
        budget_per_diem: parseFloat(form.budgetPerDiem) || 0,
        budget_other: parseFloat(form.budgetOther) || 0,
        notes: form.notes,
      });
      navigate(ROUTES.PROJECT_DETAIL(res.data.data?.id || ''));
    } catch {} finally { setSaving(false); }
  };

  return (
    <div className='space-y-6 max-w-2xl'>
      <Button variant='ghost' size='sm' onClick={() => navigate(ROUTES.PROJECTS)}>
        <ArrowLeft className='h-4 w-4 mr-1' /> Back
      </Button>
      <h1 className='text-2xl font-bold text-gray-800'>New Project</h1>

      <Card className='shadow-sm'>
        <CardHeader><CardTitle>Project Details</CardTitle></CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-2 gap-3'>
            <div><Label>Project Name</Label><Input value={form.name} onChange={e => set('name', e.target.value)} placeholder='e.g. Refinery Maintenance' /></div>
            <div><Label>Client</Label><Input value={form.client} onChange={e => set('client', e.target.value)} placeholder='Client company' /></div>
          </div>
          <div className='grid grid-cols-2 gap-3'>
            <div><Label>Location</Label><Input value={form.location} onChange={e => set('location', e.target.value)} placeholder='e.g. Koper' /></div>
            <div><Label>Country</Label>
              <Select value={form.country} onValueChange={v => set('country', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{EU_COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div><Label>Phase</Label>
            <Select value={form.phase} onValueChange={v => set('phase', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{PROJECT_PHASES.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className='grid grid-cols-2 gap-3'>
            <div><Label>Start Date</Label><Input type='date' value={form.startDate} onChange={e => set('startDate', e.target.value)} /></div>
            <div><Label>Expected End Date</Label><Input type='date' value={form.expectedEndDate} onChange={e => set('expectedEndDate', e.target.value)} /></div>
          </div>
        </CardContent>
      </Card>

      <Card className='shadow-sm'>
        <CardHeader><CardTitle>Budget Breakdown (EUR)</CardTitle></CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
            <div><Label>Labor</Label><Input type='number' value={form.budgetLabor} onChange={e => set('budgetLabor', e.target.value)} /></div>
            <div><Label>Transport</Label><Input type='number' value={form.budgetTransport} onChange={e => set('budgetTransport', e.target.value)} /></div>
            <div><Label>Accommodation</Label><Input type='number' value={form.budgetAccommodation} onChange={e => set('budgetAccommodation', e.target.value)} /></div>
            <div><Label>Tools/Equipment</Label><Input type='number' value={form.budgetTools} onChange={e => set('budgetTools', e.target.value)} /></div>
            <div><Label>Per Diem</Label><Input type='number' value={form.budgetPerDiem} onChange={e => set('budgetPerDiem', e.target.value)} /></div>
            <div><Label>Other</Label><Input type='number' value={form.budgetOther} onChange={e => set('budgetOther', e.target.value)} /></div>
          </div>
        </CardContent>
      </Card>

      <Card className='shadow-sm'>
        <CardContent className='p-6'>
          <Label>Notes</Label>
          <Textarea className='mt-2' rows={4} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder='Project scope, requirements...' />
        </CardContent>
      </Card>

      <Button className='w-full' onClick={handleSave} disabled={!form.name || saving}>
        {saving ? 'Creating...' : 'Create Project'}
      </Button>
    </div>
  );
}
