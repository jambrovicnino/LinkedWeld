import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ROUTES } from '@/router/routes';
import { Search, MapPin, Users } from 'lucide-react';

const DEMO = [
  { id: 1, name: 'Jan de Vries', trade: 'Welder', availability: 'available', location: 'Rotterdam', skills: ['TIG','MIG'], experience: 12 },
  { id: 2, name: 'Pieter Bakker', trade: 'Pipefitter', availability: 'busy', location: 'Amsterdam', skills: ['TIG','Stick'], experience: 8 },
  { id: 3, name: 'Maria Silva', trade: 'Welder', availability: 'available', location: 'Hamburg', skills: ['MIG'], experience: 5 },
  { id: 4, name: 'Klaus Schmidt', trade: 'Boilermaker', availability: 'unavailable', location: 'Bremen', skills: ['Stick','TIG'], experience: 15 },
];

export function WorkersListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const filtered = DEMO.filter(w => w.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className='space-y-6'>
      <PageHeader title='Workers' description='Browse and manage workers' />
      <div className='relative max-w-sm'><Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' /><Input placeholder='Search...' className='pl-9' value={search} onChange={e => setSearch(e.target.value)} /></div>
      {filtered.length === 0 ? <EmptyState title='No workers found' icon={Users} /> : (
        <div className='grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
          {filtered.map(w => (
            <Card key={w.id} className='cursor-pointer hover:border-accent-500/50 transition-colors' onClick={() => navigate(ROUTES.WORKER_DETAIL(w.id))}>
              <CardContent className='p-5'>
                <div className='flex items-start gap-3'>
                  <Avatar className='h-12 w-12'><AvatarFallback className='bg-primary-700 text-white'>{w.name[0]}</AvatarFallback></Avatar>
                  <div className='flex-1'>
                    <div className='flex items-center justify-between'><h3 className='font-semibold'>{w.name}</h3><StatusBadge status={w.availability} /></div>
                    <p className='text-sm text-muted-foreground'>{w.trade}</p>
                    <div className='flex items-center gap-1 text-xs text-muted-foreground mt-1'><MapPin className='h-3 w-3' />{w.location}</div>
                    <div className='flex flex-wrap gap-1 mt-2'>{w.skills.map(s => <Badge key={s} variant='outline' className='text-[10px]'>{s}</Badge>)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
