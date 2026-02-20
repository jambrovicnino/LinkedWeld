import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/router/routes';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft } from 'lucide-react';
import type { ExpenseCategory, Project, Worker } from '@/types';

export function ExpenseCreatePage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [form, setForm] = useState({
    projectId: '', workerId: '', categoryId: '', amount: '', description: '',
    expenseDate: new Date().toISOString().split('T')[0], isRecurring: false, recurrenceInterval: 'monthly', notes: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/expenses/categories').then((r) => setCategories(r.data.data || [])).catch(() => {});
    api.get('/projects').then((r) => setProjects(r.data.data || [])).catch(() => {});
    api.get('/workers').then((r) => setWorkers(r.data.data || [])).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/expenses', {
        projectId: form.projectId ? parseInt(form.projectId) : null,
        workerId: form.workerId ? parseInt(form.workerId) : null,
        categoryId: form.categoryId ? parseInt(form.categoryId) : 7,
        amount: parseFloat(form.amount) || 0,
        description: form.description, expenseDate: form.expenseDate,
        isRecurring: form.isRecurring, recurrenceInterval: form.isRecurring ? form.recurrenceInterval : null,
        notes: form.notes,
      });
      navigate(ROUTES.EXPENSES);
    } catch {} finally { setSaving(false); }
  };

  const set = (key: string, val: any) => setForm((f) => ({ ...f, [key]: val }));

  return (
    <div className='space-y-6 max-w-2xl'>
      <Button variant='ghost' size='sm' onClick={() => navigate(ROUTES.EXPENSES)}>
        <ArrowLeft className='h-4 w-4 mr-1' /> Back
      </Button>
      <h1 className='text-2xl font-bold text-gray-800'>Add Expense</h1>

      <Card className='shadow-sm'>
        <CardHeader><CardTitle>Expense Details</CardTitle></CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-2 gap-3'>
            <div><Label>Project</Label>
              <Select value={form.projectId} onValueChange={(v) => set('projectId', v)}>
                <SelectTrigger><SelectValue placeholder='Select project...' /></SelectTrigger>
                <SelectContent>
                  <SelectItem value='none'>No project</SelectItem>
                  {projects.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Worker</Label>
              <Select value={form.workerId} onValueChange={(v) => set('workerId', v)}>
                <SelectTrigger><SelectValue placeholder='Select worker...' /></SelectTrigger>
                <SelectContent>
                  <SelectItem value='none'>No worker</SelectItem>
                  {workers.map((w) => <SelectItem key={w.id} value={String(w.id)}>{w.first_name} {w.last_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className='grid grid-cols-2 gap-3'>
            <div><Label>Category</Label>
              <Select value={form.categoryId} onValueChange={(v) => set('categoryId', v)}>
                <SelectTrigger><SelectValue placeholder='Select...' /></SelectTrigger>
                <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Amount (€)</Label><Input type='number' value={form.amount} onChange={(e) => set('amount', e.target.value)} /></div>
          </div>
          <div><Label>Description</Label><Input value={form.description} onChange={(e) => set('description', e.target.value)} /></div>
          <div><Label>Date</Label><Input type='date' value={form.expenseDate} onChange={(e) => set('expenseDate', e.target.value)} /></div>
          <div className='flex items-center gap-3'>
            <Switch checked={form.isRecurring} onCheckedChange={(v) => set('isRecurring', v)} />
            <Label>Recurring expense</Label>
            {form.isRecurring && (
              <Select value={form.recurrenceInterval} onValueChange={(v) => set('recurrenceInterval', v)}>
                <SelectTrigger className='w-32'><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value='weekly'>Weekly</SelectItem>
                  <SelectItem value='monthly'>Monthly</SelectItem>
                  <SelectItem value='quarterly'>Quarterly</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
          <div><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} /></div>
          <Button className='w-full' onClick={handleSave} disabled={!form.description || !form.amount || saving}>
            {saving ? 'Saving...' : 'Add Expense'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
