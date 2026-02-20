import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ROUTES } from '@/router/routes';
import { Plus, Search, MapPin, Calendar, FolderKanban } from 'lucide-react';

const DEMO_PROJECTS = [
  { id: 1, title: 'Shipyard Phase 2', status: 'in_progress', priority: 'high', location: 'Rotterdam Port', progress: 75, budget: 45000, startDate: '2026-01-15', endDate: '2026-04-30', assignmentCount: 8 },
  { id: 2, title: 'Refinery Maintenance', status: 'open', priority: 'urgent', location: 'Hamburg Industrial', progress: 0, budget: 120000, startDate: '2026-03-01', endDate: '2026-06-30', assignmentCount: 0 },
  { id: 3, title: 'Pipeline Extension B4', status: 'in_progress', priority: 'medium', location: 'North Sea Platform', progress: 45, budget: 78000, startDate: '2026-02-01', endDate: '2026-05-15', assignmentCount: 5 },
  { id: 4, title: 'Bridge Repairs', status: 'completed', priority: 'low', location: 'Amsterdam Canal', progress: 100, budget: 15000, startDate: '2025-11-01', endDate: '2026-01-31', assignmentCount: 3 },
  { id: 5, title: 'Storage Tank Installation', status: 'draft', priority: 'medium', location: 'Antwerp Docks', progress: 0, budget: 55000, startDate: '2026-04-01', endDate: '2026-08-15', assignmentCount: 0 },
];

export function ProjectsListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = DEMO_PROJECTS.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.location.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className='space-y-6'>
      <PageHeader title='Projects' description='Manage your welding projects'>
        <Button variant='accent' onClick={() => navigate(ROUTES.PROJECT_NEW)}>
          <Plus className='mr-2 h-4 w-4' /> New Project
        </Button>
      </PageHeader>

      <div className='flex flex-col sm:flex-row gap-3'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <Input placeholder='Search projects...' className='pl-9' value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className='w-full sm:w-48'><SelectValue placeholder='Filter by status' /></SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Statuses</SelectItem>
            <SelectItem value='draft'>Draft</SelectItem>
            <SelectItem value='open'>Open</SelectItem>
            <SelectItem value='in_progress'>In Progress</SelectItem>
            <SelectItem value='completed'>Completed</SelectItem>
            <SelectItem value='cancelled'>Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title='No projects found' description='Try adjusting your search or filters' icon={FolderKanban} />
      ) : (
        <div className='grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
          {filtered.map(project => (
            <Card key={project.id} className='cursor-pointer hover:border-accent-500/50 transition-colors' onClick={() => navigate(ROUTES.PROJECT_DETAIL(project.id))}>
              <CardContent className='p-5'>
                <div className='flex items-start justify-between mb-3'>
                  <h3 className='font-semibold text-lg leading-tight'>{project.title}</h3>
                  <StatusBadge status={project.status} />
                </div>
                <div className='space-y-2 text-sm text-muted-foreground'>
                  <div className='flex items-center gap-2'><MapPin className='h-3.5 w-3.5' />{project.location}</div>
                  <div className='flex items-center gap-2'><Calendar className='h-3.5 w-3.5' />{project.startDate} - {project.endDate}</div>
                </div>
                <div className='mt-4 space-y-1'>
                  <div className='flex items-center justify-between text-sm'>
                    <span>Progress</span>
                    <span className='font-medium'>{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className='h-2' />
                </div>
                <div className='flex items-center justify-between mt-3 pt-3 border-t'>
                  <Badge variant='outline' className='text-xs'>{project.assignmentCount} workers</Badge>
                  <span className='text-sm font-medium text-accent-500'>EUR {project.budget?.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
