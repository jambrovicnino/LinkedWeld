import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ROUTES } from '@/router/routes';
import { NATIONALITIES } from '@/lib/constants';
import { daysUntilExpiry, validityColor, validityLabel, getInitials } from '@/lib/utils';
import { Search, Users, Plus, MapPin, Shield } from 'lucide-react';
import api from '@/lib/api';
import type { Worker } from '@/types';

export function WorkersListPage() {
  const navigate = useNavigate();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', nationality: 'Indian', phone: '', email: '',
    hourlyRate: '', weldingTypes: '' as string, status: 'active', notes: '',
  });

  const fetchWorkers = () => {
    const params: any = {};
    if (search) params.search = search;
    if (statusFilter !== 'all') params.status = statusFilter;
    api.get('/workers', { params }).then((r) => setWorkers(r.data.data || [])).catch(() => {});
  };

  useEffect(() => { fetchWorkers(); }, [statusFilter]);

  const handleCreate = async () => {
    try {
      await api.post('/workers', {
        first_name: form.firstName, last_name: form.lastName,
        nationality: form.nationality, phone: form.phone, email: form.email,
        hourly_rate: parseFloat(form.hourlyRate) || 0,
        welding_types: form.weldingTypes ? form.weldingTypes.split(',').map(s => s.trim()) : [],
        status: form.status, notes: form.notes,
      });
      setDialogOpen(false);
      setForm({ firstName: '', lastName: '', nationality: 'Indian', phone: '', email: '', hourlyRate: '', weldingTypes: '', status: 'active', notes: '' });
      fetchWorkers();
    } catch {}
  };

  const filtered = workers.filter(w => {
    const name = `${w.first_name} ${w.last_name}`.toLowerCase();
    return name.includes(search.toLowerCase()) || w.nationality?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-800'>Workers</h1>
          <p className='text-gray-500 mt-1'>{workers.length} workers in your team</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className='h-4 w-4 mr-2' />Add Worker</Button>
          </DialogTrigger>
          <DialogContent className='max-w-md'>
            <DialogHeader><DialogTitle>Add New Worker</DialogTitle></DialogHeader>
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
              <div><Label>Hourly Rate (EUR)</Label><Input type='number' value={form.hourlyRate} onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })} /></div>
              <div><Label>Welding Types (comma-separated)</Label><Input placeholder='TIG, MIG, Stick' value={form.weldingTypes} onChange={(e) => setForm({ ...form, weldingTypes: e.target.value })} /></div>
              <Button className='w-full' onClick={handleCreate} disabled={!form.firstName || !form.lastName}>Add Worker</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className='flex flex-col sm:flex-row gap-3'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <Input placeholder='Search workers...' className='pl-9' value={search} onChange={e => { setSearch(e.target.value); }} onKeyDown={e => e.key === 'Enter' && fetchWorkers()} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className='w-full sm:w-40'><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Status</SelectItem>
            <SelectItem value='active'>Active</SelectItem>
            <SelectItem value='inactive'>Inactive</SelectItem>
            <SelectItem value='on_leave'>On Leave</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Card><CardContent className='py-12 text-center text-gray-400'>
          <Users className='h-12 w-12 mx-auto mb-3 text-gray-300' />
          <p className='text-lg font-medium'>No workers found</p>
          <p className='text-sm'>Add your first worker to get started.</p>
        </CardContent></Card>
      ) : (
        <div className='grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
          {filtered.map(w => {
            const trcDays = w.trcDaysLeft ?? daysUntilExpiry(w.trcExpiryDate ?? null);
            return (
              <Card key={w.id} className='cursor-pointer hover:shadow-md transition-shadow' onClick={() => navigate(ROUTES.WORKER_DETAIL(w.id))}>
                <CardContent className='p-5'>
                  <div className='flex items-start gap-3'>
                    <Avatar className='h-12 w-12'>
                      <AvatarFallback className='bg-blue-500 text-white font-semibold'>
                        {getInitials(w.first_name, w.last_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center justify-between'>
                        <h3 className='font-semibold text-gray-800 truncate'>{w.first_name} {w.last_name}</h3>
                        <Badge variant='outline' className={`text-[10px] capitalize ${
                          w.status === 'active' ? 'border-emerald-200 text-emerald-600 bg-emerald-50' :
                          w.status === 'on_leave' ? 'border-amber-200 text-amber-600 bg-amber-50' :
                          'border-gray-200 text-gray-500'
                        }`}>{w.status?.replace('_', ' ')}</Badge>
                      </div>
                      <div className='flex items-center gap-2 text-sm text-gray-500 mt-0.5'>
                        <MapPin className='h-3 w-3' />
                        <span>{w.nationality}</span>
                      </div>
                      <div className='flex flex-wrap gap-1 mt-2'>
                        {(w.welding_types || []).map(t => (
                          <Badge key={t} variant='outline' className='text-[10px] border-blue-200 text-blue-600'>{t}</Badge>
                        ))}
                      </div>
                      {trcDays !== null && (
                        <div className='flex items-center gap-1.5 mt-2'>
                          <Shield className='h-3.5 w-3.5 text-gray-400' />
                          <span className={`text-xs font-medium ${validityColor(trcDays)}`}>{validityLabel(trcDays)}</span>
                        </div>
                      )}
                      {w.currentProjectName && (
                        <p className='text-xs text-gray-400 mt-1 truncate'>Project: {w.currentProjectName}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
