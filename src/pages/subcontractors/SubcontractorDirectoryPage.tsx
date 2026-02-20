import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { StarRating } from '@/components/common/StarRating';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ROUTES } from '@/router/routes';
import { Search, MapPin, Users, Building } from 'lucide-react';
const DEMO = [
  { id: 1, company: 'Nordic Welding Co.', rating: 4.8, reviews: 24, team: 15, location: 'Rotterdam', specs: ['TIG','MIG','Structural'] },
  { id: 2, company: 'Baltic Pipe Solutions', rating: 4.5, reviews: 18, team: 8, location: 'Hamburg', specs: ['Pipe','Industrial'] },
  { id: 3, company: 'Atlantic Steel Works', rating: 4.2, reviews: 12, team: 22, location: 'Antwerp', specs: ['MIG','Stick','Maritime'] },
];
export function SubcontractorDirectoryPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const filtered = DEMO.filter(s => s.company.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className='space-y-6'>
      <PageHeader title='Subcontractor Directory' description='Find welding teams and companies' />
      <div className='relative max-w-sm'><Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' /><Input placeholder='Search companies...' className='pl-9' value={search} onChange={e => setSearch(e.target.value)} /></div>
      <div className='grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
        {filtered.map(s => (
          <Card key={s.id} className='cursor-pointer hover:border-accent-500/50 transition-colors' onClick={() => navigate(ROUTES.SUBCONTRACTOR_DETAIL(s.id))}>
            <CardContent className='p-5'>
              <div className='flex items-center gap-3 mb-3'><div className='h-10 w-10 rounded bg-primary/10 flex items-center justify-center'><Building className='h-5 w-5 text-accent-500' /></div><div><h3 className='font-semibold'>{s.company}</h3><div className='flex items-center gap-1'><StarRating rating={Math.round(s.rating)} size='sm' /><span className='text-xs text-muted-foreground'>({s.reviews})</span></div></div></div>
              <div className='flex items-center gap-1 text-xs text-muted-foreground mb-2'><MapPin className='h-3 w-3' />{s.location}</div>
              <div className='flex items-center gap-1 text-xs text-muted-foreground mb-3'><Users className='h-3 w-3' />{s.team} workers</div>
              <div className='flex flex-wrap gap-1'>{s.specs.map(sp => <Badge key={sp} variant='outline' className='text-[10px]'>{sp}</Badge>)}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
