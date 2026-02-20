import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/router/routes';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PIPELINE_STAGES, NATIONALITIES } from '@/lib/constants';
import { Plus, GitBranch, FileCheck } from 'lucide-react';
import type { PipelineCandidate } from '@/types';

export function PipelinePage() {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<PipelineCandidate[]>([]);
  const [stageFilter, setStageFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', nationality: 'Indian', phone: '', email: '', expectedArrivalDate: '', notes: '' });

  const fetchCandidates = () => {
    const params: any = {};
    if (stageFilter !== 'all') params.stage = stageFilter;
    api.get('/pipeline', { params }).then((r) => setCandidates(r.data.data || [])).catch(() => {});
  };

  useEffect(() => { fetchCandidates(); }, [stageFilter]);

  const handleCreate = async () => {
    try {
      await api.post('/pipeline', form);
      setDialogOpen(false);
      setForm({ firstName: '', lastName: '', nationality: 'Indian', phone: '', email: '', expectedArrivalDate: '', notes: '' });
      fetchCandidates();
    } catch {}
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-800'>Recruitment Pipeline</h1>
          <p className='text-gray-500 mt-1'>{candidates.length} candidates in pipeline</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className='h-4 w-4 mr-2' />Add Candidate</Button>
          </DialogTrigger>
          <DialogContent className='max-w-md'>
            <DialogHeader><DialogTitle>Add Pipeline Candidate</DialogTitle></DialogHeader>
            <div className='space-y-3'>
              <div className='grid grid-cols-2 gap-3'>
                <div><Label>First Name</Label><Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></div>
                <div><Label>Last Name</Label><Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></div>
              </div>
              <div><Label>Nationality</Label>
                <Select value={form.nationality} onValueChange={(v) => setForm({ ...form, nationality: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{NATIONALITIES.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className='grid grid-cols-2 gap-3'>
                <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                <div><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              </div>
              <div><Label>Expected Arrival</Label><Input type='date' value={form.expectedArrivalDate} onChange={(e) => setForm({ ...form, expectedArrivalDate: e.target.value })} /></div>
              <div><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
              <Button className='w-full' onClick={handleCreate} disabled={!form.firstName || !form.lastName}>Add Candidate</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stage filter tabs */}
      <div className='flex flex-wrap gap-2'>
        <Button variant={stageFilter === 'all' ? 'default' : 'outline'} size='sm' onClick={() => setStageFilter('all')}>All</Button>
        {PIPELINE_STAGES.map((s) => (
          <Button key={s.value} variant={stageFilter === s.value ? 'default' : 'outline'} size='sm'
            onClick={() => setStageFilter(s.value)}>
            {s.label} ({candidates.filter((c) => c.stage === s.value).length})
          </Button>
        ))}
      </div>

      {candidates.length === 0 ? (
        <Card><CardContent className='py-12 text-center text-gray-400'>
          <GitBranch className='h-12 w-12 mx-auto mb-3 text-gray-300' />
          <p>No candidates in pipeline</p>
        </CardContent></Card>
      ) : (
        <div className='grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
          {candidates.map((c) => {
            const stageConf = PIPELINE_STAGES.find((s) => s.value === c.stage);
            return (
              <Card key={c.id} className='cursor-pointer hover:shadow-md transition-shadow'
                onClick={() => navigate(ROUTES.PIPELINE_DETAIL(c.id))}>
                <CardContent className='p-5'>
                  <div className='flex items-start justify-between mb-2'>
                    <h3 className='font-semibold text-gray-800'>{c.first_name} {c.last_name}</h3>
                    <Badge variant='outline' className='text-[10px] capitalize'>{stageConf?.label || c.stage}</Badge>
                  </div>
                  <p className='text-sm text-gray-500'>{c.nationality}</p>
                  {c.expected_arrival_date && <p className='text-xs text-gray-400 mt-1'>ETA: {c.expected_arrival_date}</p>}
                  <div className='flex items-center gap-2 mt-3'>
                    <FileCheck className='h-4 w-4 text-gray-400' />
                    <span className='text-xs text-gray-500'>{c.docsReceived || 0} / {c.docsTotal || 7} documents</span>
                    <div className='flex-1 h-1.5 bg-gray-100 rounded-full'>
                      <div className='h-full bg-emerald-500 rounded-full' style={{ width: `${((c.docsReceived || 0) / (c.docsTotal || 7)) * 100}%` }} />
                    </div>
                  </div>
                  {c.notes && <p className='text-xs text-gray-400 mt-2 line-clamp-2'>{c.notes}</p>}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
